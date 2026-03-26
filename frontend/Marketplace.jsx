import React, { useState, useEffect } from 'react';
import { ShoppingCart, CloudSun, Leaf, Store, Tag, Phone, User, Plus, X } from 'lucide-react';

// ==========================================
// START: Marketplace Component
// (If using separate files, copy from here to the "End of Marketplace Component" comment into a new file named Marketplace.jsx)
// ==========================================

const Marketplace = ({ onBack }) => {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    quantity: '',
    sellerName: '',
    contact: '',
    description: ''
  });

  // Fetch products from backend
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products');
      const data = await response.json();
      setProducts(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
      // Fallback data for preview/demo purposes if backend is unreachable
      if (products.length === 0) {
         setProducts([]); 
      }
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        fetchProducts(); // Refresh list
        setShowForm(false); // Close modal
        setFormData({ name: '', price: '', quantity: '', sellerName: '', contact: '', description: '' }); // Reset form
      }
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <button onClick={onBack} className="text-green-700 font-semibold hover:underline mb-2">← Back to Dashboard</button>
          <h1 className="text-3xl font-bold text-gray-800">Krishaka Marketplace</h1>
          <p className="text-gray-600">Buy and sell fresh produce directly from farmers.</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg transition-all"
        >
          <Plus size={20} /> Sell Produce
        </button>
      </div>

      {/* Product Grid */}
      {loading ? (
        <p className="text-center text-gray-500">Loading products...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.length === 0 && !loading && (
             <div className="col-span-full text-center py-10 text-gray-500 flex flex-col items-center">
                <Store size={48} className="text-gray-300 mb-4"/>
                <p>No products listed yet.</p>
                <p className="text-sm">Be the first to sell!</p>
             </div>
          )}
          {products.map((product) => (
            <div key={product._id || Math.random()} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow border border-gray-100">
              <div className="h-32 bg-green-100 flex items-center justify-center">
                <ShoppingCart size={48} className="text-green-300" />
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-800">{product.name}</h3>
                  <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                    ₹{product.price}/kg
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4 h-10 overflow-hidden">{product.description}</p>
                
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Tag size={16} /> <span>Quantity: {product.quantity}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={16} /> <span>Seller: {product.sellerName}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                   <a href={`tel:${product.contact}`} className="w-full bg-green-50 text-green-700 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-green-100 transition-colors font-medium">
                     <Phone size={18} /> Call Farmer
                   </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Product Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
            
            <h2 className="text-2xl font-bold mb-6 text-gray-800">List Your Produce</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Crop Name</label>
                <input 
                  name="name" required placeholder="e.g. Fresh Tomatoes" 
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
                  value={formData.name} onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹/kg)</label>
                  <input 
                    name="price" type="number" required placeholder="40" 
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
                    value={formData.price} onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input 
                    name="quantity" required placeholder="100 kg" 
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
                    value={formData.quantity} onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  name="description" rows="2" placeholder="Describe quality, location, etc."
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
                  value={formData.description} onChange={handleChange}
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                  <input 
                    name="sellerName" required placeholder="Name" 
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
                    value={formData.sellerName} onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input 
                    name="contact" required placeholder="Contact" 
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
                    value={formData.contact} onChange={handleChange}
                  />
                </div>
              </div>

              <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors mt-2">
                List Product
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// END: Marketplace Component
// ==========================================


// --- Main App Component ---
function App() {
  const [activeView, setActiveView] = useState('home');

  // Navigation handler
  const renderContent = () => {
    if (activeView === 'marketplace') {
      return <Marketplace onBack={() => setActiveView('home')} />;
    }

    return (
      <div className="p-8 max-w-6xl mx-auto">
        <header className="mb-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-4 rounded-full">
              <Leaf size={48} className="text-green-600" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-800 mb-2">Welcome to Krishaka</h1>
          <p className="text-gray-500 text-lg">Empowering Farmers, Connecting Communities</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Marketplace Card */}
          <div 
            onClick={() => setActiveView('marketplace')}
            className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 cursor-pointer hover:shadow-2xl hover:scale-105 transition-all group"
          >
            <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
              <Store size={32} className="text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Marketplace</h2>
            <p className="text-gray-600 mb-4">Connect with buyers and sellers. List your produce or buy fresh crops directly.</p>
            <span className="text-blue-600 font-semibold group-hover:underline">Enter Marketplace &rarr;</span>
          </div>

          {/* Weather Card */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 opacity-75 cursor-not-allowed relative">
            <div className="bg-orange-50 w-16 h-16 rounded-full flex items-center justify-center mb-6">
              <CloudSun size={32} className="text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Weather Information</h2>
            <p className="text-gray-600 mb-4">Get localized weather forecasts relevant to your farm to plan your harvest.</p>
            <span className="absolute top-6 right-6 bg-gray-100 text-gray-500 text-xs font-bold px-2 py-1 rounded">COMING SOON</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 font-sans">
      {renderContent()}
    </div>
  );
}

export default App;