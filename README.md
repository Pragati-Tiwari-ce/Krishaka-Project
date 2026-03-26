# 🌱 Krishaka – AI Powered Smart Agriculture Platform
## 📌 Overview

Krishaka is an AI-powered web platform designed to assist farmers with crop management, disease detection, and market access. It integrates modern technologies to provide a **single digital ecosystem** for improving agricultural productivity and decision-making.
  ## 🚀 Features

* 🌿 **Crop Disease Detection**
  Upload crop images and detect diseases using AI/ML models.

* 🤖 **AI Expert Chat**
  Get real-time agricultural guidance powered by AI (Gemini API).

* 🛒 **Marketplace**
  Farmers can list and sell crops directly to buyers.

* 🌍 **Land Rental Portal**
  Post and browse agricultural land available for rent.

* 🌦️ **Weather Forecast**
  Real-time weather updates for better farming decisions.

* 🏛️ **Government Schemes**
  Access information about agricultural schemes and subsidies.
  
## 🛠️ Tech Stack

### Frontend

* React.js
* Tailwind CSS
* Axios

### Backend

* Node.js
* Express.js

### Database

* MongoDB

### AI & APIs

* Google Gemini API (AI Chat)
* Machine Learning Model (Crop Disease Detection)
* Open-Meteo API (Weather)

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/krishaka.git
cd krishaka
```

---

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:

```env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_api_key
```

Run backend:

```bash
npm start
```

---

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 📡 API Endpoints

### Authentication

* `POST /auth/signup`
* `POST /auth/login`

### Marketplace

* `GET /api/products`
* `POST /api/products`
* `DELETE /api/products/:id`

### Land

* `GET /api/land`
* `POST /api/land`
* `DELETE /api/land/:id`

### AI

* `POST /api/chat`
* `POST /api/detect-disease`

---

## 🎯 Objectives

* Provide farmers with **AI-based crop disease detection**
* Enable **direct market access** without middlemen
* Deliver **real-time agricultural guidance**
* Improve decision-making using **weather & data insights**

---

## ⚠️ Limitations

* Requires internet connectivity
* AI predictions depend on dataset accuracy
* No advanced authentication for sensitive operations (can be improved)

---

## 🔮 Future Enhancements

* Mobile app (Flutter/React Native)
* Multi-language support (Hindi, Marathi)
* Advanced ML models for higher accuracy
* Secure authentication & role-based access

---
