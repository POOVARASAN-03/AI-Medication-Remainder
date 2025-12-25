# 💊 MedRemind AI - Smart Medication Reminder System

> AI-powered medication management platform with intelligent reminders, prescription analysis, and health tracking.

[![Live Demo](https://img.shields.io/badge/🌐-Live%20Demo-blue)](https://ai-medicationremainder-gasx.onrender.com)

---

## 🌟 Features

### 📸 **Smart Prescription Upload**

- Upload prescription images via camera or file
- AI-powered OCR extracts medication details automatically
- Switch between front/rear camera on mobile devices

### ⏰ **Intelligent Reminders**

- Set custom reminder schedules for each medication
- Push notifications via Firebase Cloud Messaging
- Automatic reminder triggering every minute
- Track medication adherence with visual calendar

### 📊 **Health Analytics**

- Weekly and monthly adherence tracking
- Interactive calendar showing medication history
- Detailed prescription view with extracted medicines

### 🤖 **AI Chatbot Assistant**

- Get instant answers about your medications
- Drug interaction warnings
- Health tips and guidance powered by Google Gemini AI

### 🔐 **Secure Authentication**

- JWT-based authentication
- Password reset via email
- Secure user data storage

---

## 🛠️ Tech Stack

### Frontend

- **React** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Firebase** - Push notifications
- **Axios** - HTTP client
- **React Router** - Navigation
- **Framer Motion** - Animations

### Backend

- **Node.js & Express** - Server framework
- **MongoDB** - Database
- **Firebase Admin SDK** - Notifications
- **Google Gemini AI** - Chatbot & prescription analysis
- **Cloudinary** - Image storage
- **Nodemailer/Resend** - Email service
- **JWT** - Authentication

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Firebase project
- Google Gemini API key

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/POOVARASAN-03/AI-Medication-Remainder.git
cd AI-Medication-Remainder
```

2. **Setup Server**

```bash
cd server
npm install
```

Create `.env` file in `server/`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key_min_32_chars
GEMINI_API_KEY=your_gemini_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY="your_firebase_private_key"
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
RESEND_API_KEY=your_resend_api_key
CRON_SECRET=your_cron_secret
```

3. **Setup Client**

```bash
cd ../client
npm install
```

Create `.env` file in `client/`:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_VAPID_KEY=your_vapid_key
VITE_API_URL=http://localhost:5001
```

4. **Run Development**

Terminal 1 (Server):

```bash
cd server
npm start
```

Terminal 2 (Client):

```bash
cd client
npm run dev
```

Visit `http://localhost:5173` 🎉

---

## 📦 Deployment

### Server (Render/Railway/Heroku)

1. Push code to GitHub
2. Connect repository to hosting platform
3. Set environment variables
4. Deploy!

### Client (Vercel/Netlify)

```bash
cd client
npm run build
```

Deploy the `dist` folder

### Cron Setup (Required for Reminders)

Use **cron-job.org** or similar:

- URL: `https://your-server.com/api/cron/trigger`
- Schedule: `* * * * *` (every minute)
- Method: POST
- Header: `X-Cron-Secret: your_cron_secret`

---

## 📱 API Endpoints

### Authentication

```
POST /api/auth/register    - Register new user
POST /api/auth/login       - Login user
GET  /api/auth/profile     - Get user profile
POST /api/auth/forgot-password - Request password reset
POST /api/auth/reset-password/:token - Reset password
```

### Prescriptions

```
POST /api/prescriptions/upload - Upload prescription image
GET  /api/prescriptions        - Get all prescriptions
GET  /api/prescriptions/:id    - Get single prescription
```

### Reminders

```
POST /api/reminders           - Create reminder
GET  /api/reminders           - Get all reminders
GET  /api/reminders/history   - Get reminder history
PATCH /api/reminders/:id      - Update reminder status
```

### Chatbot

```
POST /api/chat - Send message to AI chatbot
```

---

## 🎯 Key Features Implementation

### AI Prescription Analysis

Uses Google Gemini AI to extract:

- Medicine names
- Dosages
- Frequencies
- Special instructions

### Push Notifications

- Browser notifications via Firebase Cloud Messaging
- Background service worker for offline notifications
- Custom notification actions (Mark as Taken/Skipped)

### Smart Camera

- Auto-detects rear camera on mobile
- Flip camera button for convenience
- Direct capture without file upload

---

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Rate limiting on sensitive endpoints
- CORS configuration
- Environment variable protection
- Secure file uploads

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

## 👨‍💻 Author

**POOVARASAN**

- GitHub: [@POOVARASAN-03](https://github.com/POOVARASAN-03)

---

## 🙏 Acknowledgments

- Google Gemini AI for prescription analysis
- Firebase for push notifications
- Cloudinary for image storage
- MongoDB for database
- All open-source contributors

---

## 📞 Support

For issues and questions, please open an issue in the GitHub repository.

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with ❤️ by POOVARASAN

</div>
