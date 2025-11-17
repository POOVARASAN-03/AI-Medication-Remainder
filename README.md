# AI Prescription Analyzer & Medication Reminder

This is a full-stack application that allows users to upload prescription images, extracts medicine details using Python OCR, checks for drug interactions, schedules medication reminders, and provides a Gemini-powered medical chatbot.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Folder Structure](#folder-structure)
- [Installation Guide](#installation-guide)
  - [Prerequisites](#prerequisites)
  - [Backend (Node.js/Express)](#backend-nodejsexpress)
  - [Python OCR Microservice (Flask/PaddleOCR)](#python-ocr-microservice-flaskpaddleocr)
  - [Frontend (React/Tailwind CSS)](#frontend-reacttailwind-css)
- [Environment Variables (.env examples)](#environment-variables-env-examples)
- [API Documentation](#api-documentation)
- [Sample Test Data](#sample-test-data)

## Features

- User registration & login (JWT authentication)
- Upload multiple prescription images
- Extract raw text from images using Python OCR (PaddleOCR)
- Extract medicine names, dosage, frequency, and duration using regex and a dictionary
- Check for drug interactions
- Display prescription analysis results on the frontend
- Set medication reminders with custom times
- Schedule reminders using Node-cron
- History page to show reminder logs (sent/taken/missed)
- Gemini chatbot for medical queries
- Responsive UI with Tailwind CSS

## Technology Stack

**Frontend:**
- React
- Tailwind CSS
- Axios
- React Router

**Backend (API):**
- Node.js
- Express
- MongoDB (Mongoose)
- Multer (image upload)
- Axios (call Python OCR)
- node-cron (reminder scheduling)
- jsonwebtoken (JWT authentication)
- bcryptjs (password hashing)
- @google/generative-ai (Gemini API)

**OCR Microservice:**
- Python
- Flask
- PaddleOCR
- OpenCV (opencv-python)

## Folder Structure

```
project/
├─ client/ (React + Tailwind)
│  ├─ src/
│  │   ├─ pages/ (Login, Register, Dashboard, History, PrescriptionView)
│  │   ├─ components/ (Navbar, Sidebar, UploadForm, ChatbotPanel, MedicineTable, PrivateRoute)
│  │   ├─ services/api.js
│  │   ├─ App.jsx
│  │   └─ main.jsx
│  └─ index.html
│  └─ tailwind.config.js
│  └─ vite.config.js
│  └─ package.json
│
├─ server/ (Node.js)
│  ├─ app.js
│  ├─ routes/
│  │  ├─ authRoutes.js
│  │  ├─ prescriptionRoutes.js
│  │  ├─ reminderRoutes.js
│  │  └─ chatRoutes.js
│  ├─ controllers/
│  │  ├─ authController.js
│  │  ├─ prescriptionController.js
│  │  ├─ reminderController.js
│  │  └─ chatController.js
│  ├─ models/
│  │  ├─ User.js
│  │  ├─ Prescription.js
│  │  ├─ Reminder.js
│  │  ├─ ReminderHistory.js
│  │  └─ Interaction.js
│  ├─ services/
│  │  ├─ uploadService.js
│  │  └─ geminiService.js
│  ├─ middleware/
│  │  └─ authMiddleware.js
│  ├─ uploads/ (for prescription images)
│  ├─ data/
│  │  ├─ medicineDictionary.json
│  │  └─ drugInteractions.json
│  └─ package.json
│
└─ python-ocr/ (Flask OCR)
   ├─ ocr.py
   └─ requirements.txt

```

## Installation Guide

### Prerequisites

- Node.js (v18 or higher) & npm
- Python (v3.8 or higher) & pip
- MongoDB (running locally or accessible via a cloud service like MongoDB Atlas)

### Backend (Node.js/Express)

1.  **Navigate to the `server` directory:**
    ```bash
    cd server
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create a `.env` file** in the `server` directory based on the `.env.example` provided below.

4.  **Run the backend server:**
    ```bash
    npm start
    ```
    The server should start on `http://localhost:5001` (or your specified `PORT`).

### Python OCR Microservice (Flask/PaddleOCR)

1.  **Navigate to the `python-ocr` directory:**
    ```bash
    cd python-ocr
    ```

2.  **Create and activate a virtual environment (recommended):**
    ```bash
    python -m venv venv
    # On Windows:
    .\venv\Scripts\activate
    # On macOS/Linux:
    source venv/bin/activate
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Run the Flask application:**
    ```bash
    python ocr.py
    ```
    The OCR service should run on `http://0.0.0.0:5001`.

### Frontend (React/Tailwind CSS)

1.  **Navigate to the `client` directory:**
    ```bash
    cd client
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create a `.env` file** in the `client` directory (optional, if you want to override `VITE_API_BASE_URL`).

4.  **Run the frontend development server:**
    ```bash
    npm run dev
    ```
    The React app should open in your browser on `http://localhost:3000`.

## Environment Variables (.env examples)

### `server/.env`

```
MONGO_URI=mongodb://localhost:27017/medication_reminder
JWT_SECRET=a_very_secret_jwt_key_that_is_long_and_random
PYTHON_OCR_URL=http://localhost:5001
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
PORT=5001
```

### `client/.env` (Optional)

```
VITE_API_BASE_URL=http://localhost:5001
```

## API Documentation

