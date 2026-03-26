const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken'); 
const bcrypt = require('bcryptjs'); 
const multer = require('multer'); 
const path = require('path');
const upload = multer({ dest: 'uploads/' });
const { GoogleGenerativeAI } = require("@google/generative-ai");
const https = require('https'); // Used for raw model fetching
require('dotenv').config();

const app = express();

// --- MIDDLEWARE ---
app.use(express.json()); 
app.use(cors());         
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- GLOBAL STATE FOR AI MODEL ---
let activeModelName = "gemini-1.5-flash"; // Default fallback
let modelDiscoveryComplete = false;

// --- DATABASE CONNECTION ---
// Priority: .env MONGO_URI > Atlas String provided earlier > Localhost fallback
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/krishaka';

mongoose.connect(MONGO_URI)
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.log('❌ MongoDB Error:', err));

// --- GEMINI AI CONFIGURATION ---
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("❌ CRITICAL ERROR: GEMINI_API_KEY is missing in .env file!");
} else {
    console.log(`✅ GEMINI_API_KEY found (Length: ${apiKey.length}).`);
}

const genAI = new GoogleGenerativeAI(apiKey || "missing_key");

// --- HELPER: AUTO-DISCOVER AVAILABLE MODELS ---
function discoverModels() {
    if (!apiKey) return;

    console.log("🔍 Auto-discovering available AI models for your API key...");
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            try {
                const response = JSON.parse(data);
                
                if (response.error) {
                    console.error("❌ API Error during discovery:", response.error.message);
                    if (response.error.code === 403 || response.error.status === 'PERMISSION_DENIED') {
                        console.error("👉 ACTION REQUIRED: Please enable the 'Generative Language API' in your Google Cloud Console.");
                    }
                    return;
                }

                if (response.models) {
                    const validModels = response.models.filter(m => 
                        m.supportedGenerationMethods && 
                        m.supportedGenerationMethods.includes("generateContent")
                    ).map(m => m.name.replace('models/', ''));

                    console.log("📋 Available Models:", validModels.join(", "));

                    if (validModels.includes('gemini-1.5-flash')) activeModelName = 'gemini-1.5-flash';
                    else if (validModels.includes('gemini-pro')) activeModelName = 'gemini-pro';
                    else if (validModels.length > 0) activeModelName = validModels[0];

                    console.log(`✅ Selected Active Model: ${activeModelName}`);
                    modelDiscoveryComplete = true;
                } else {
                    console.warn("⚠️ No models found in response. Using default.");
                }
            } catch (e) {
                console.error("⚠️ Failed to parse model list:", e.message);
            }
        });
    }).on('error', err => {
        console.error("⚠️ Model discovery network error:", err.message);
    });
}

discoverModels();

// --- SCHEMAS ---
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true }, 
    role: { type: String, default: 'Farmer' }
});
const User = mongoose.model('User', userSchema);

const productSchema = new mongoose.Schema({
    name: String,
    price: String,
    quantity: String,
    sellerName: String,
    contact: String,
    description: String,
    imageUrl: String,   // IMPORTANT
    date: { type: Date, default: Date.now }
});
const Product = mongoose.model('Product', productSchema);

const landSchema = new mongoose.Schema({
    type: { type: String, default: 'Rent' }, 
    area: String, location: String, price: String,
    ownerName: String, contact: String, description: String,
    date: { type: Date, default: Date.now }
});
const Land = mongoose.model('Land', landSchema);

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_123';

// --- ROUTES ---

// 1. AUTH
app.post('/auth/signup', async (req, res) => {
    try {
        const { username, password, role } = req.body;
        if (!username || !password) return res.status(400).json({ message: "Missing fields" });
        
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ message: "User exists" });

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = new User({ username, passwordHash, role });
        await newUser.save();
        res.status(201).json({ message: "User created" });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post('/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user: { username: user.username, role: user.role } });
    } catch (err) { res.status(500).json({ message: "Server error" }); }
});

// 2. MARKETPLACE
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ date: -1 });
        res.json(products);
    } catch (err) { res.status(500).json({ message: err.message }); }
});
app.post('/api/products', upload.single('productImage'), async (req, res) => {
    try {
        const newProduct = new Product({
            name: req.body.name,
            price: req.body.price,
            quantity: req.body.quantity,
            sellerName: req.body.sellerName,
            contact: req.body.contact,
            description: req.body.description,
            imageUrl: req.file ? req.file.path : ""
        });

        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);

    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.get('/api/land', async (req, res) => {
    try {
        const lands = await Land.find().sort({ date: -1 });
        res.json(lands);
    } catch (err) { res.status(500).json({ message: err.message }); }
});
app.post('/api/land', async (req, res) => {
    try {
        const newLand = new Land(req.body);
        const savedLand = await newLand.save();
        res.status(201).json(savedLand);
    } catch (err) { res.status(400).json({ message: err.message }); }
});
app.delete('/api/land/:id', async (req, res) => {
  try {
    await Land.findByIdAndDelete(req.params.id);
    res.json({ message: "Land listing deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.delete('/api/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. AI CHAT
app.post('/api/chat', async (req, res) => {
    try {
        if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY missing");

        const { message } = req.body;
        const prompt = `You are a helpful Indian Agricultural Expert named Krishaka AI. Keep answers short, simple, and practical for farmers. User Question: ${message}`;

        const modelsToTry = modelDiscoveryComplete ? [activeModelName] : ["gemini-1.5-flash", "gemini-pro"];

        let responseText = null;
        let lastError = null;

        for (const modelName of modelsToTry) {
            try {
                if (!modelName) continue;
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                const response = await result.response;
                responseText = response.text();
                break; 
            } catch (err) {
                lastError = err;
            }
        }

        if (responseText) res.json({ reply: responseText });
        else res.status(500).json({ message: "AI Service Unavailable", error: lastError?.message });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// 4. SCHEMES MOCK DATA
const schemesData = [
    { id: 1, titleKey: 'PM Kisan Samman Nidhi', descriptionKey: 'Income support of ₹6,000 per year.', link: 'https://pmkisan.gov.in/' },
    { id: 2, titleKey: 'Pradhan Mantri Fasal Bima Yojana', descriptionKey: 'Crop insurance against natural risks.', link: 'https://pmfby.gov.in/' },
    { id: 5, titleKey: 'e-NAM', descriptionKey: 'Pan-India electronic trading portal.', link: 'https://www.enam.gov.in/web/' }
    // ... other schemes from your list
];

app.get('/api/schemes', (req, res) => res.json(schemesData));

app.get('/api/schemes/:id/redirect', (req, res) => {
    const scheme = schemesData.find(s => s.id === parseInt(req.params.id));
    if (scheme && scheme.link) res.redirect(scheme.link);
    else res.status(404).send("Scheme URL not found");
});

// 5. DISEASE DETECTION (Mock)

app.post('/api/detect-disease', upload.single('cropImage'), (req, res) => {
    res.json({
        disease: { en: "Healthy", hi: "स्वस्थ" },
        confidence: 0.98,
        remedies: { en: "1. Maintain regular watering.\n2. Ensure adequate sunlight." }
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Krishaka Server running on port ${PORT}`));