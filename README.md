# HealthLens AI 🏥

An intelligent preventive healthcare platform that predicts disease risk, tracks health trends, and provides personalized health insights using advanced AI technology.

## 🚀 Features

- **Health Risk Prediction**: AI-powered disease risk assessment using biomarker analysis
- **Health Scanning**: Real-time health monitoring with webcam integration
- **Medical Reports**: Upload and analyze lab reports with PDF parsing
- **AI Health Chat**: Interactive conversations with AI health assistant
- **Health Trends**: Visualize health data over time with interactive charts
- **Lifestyle Simulation**: Predict outcomes of lifestyle changes
- **Nutrition Tracking**: Monitor dietary habits and nutritional insights
- **Alert System**: Get notified about health concerns and recommendations

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern React with hooks and concurrent features
- **Vite** - Fast build tool and development server
- **React Router** - Client-side routing
- **Framer Motion** - Smooth animations and transitions
- **Recharts** - Interactive data visualizations
- **React Webcam** - Camera integration for health scanning
- **React Hook Form** - Efficient form handling
- **Axios** - HTTP client for API calls
- **React Hot Toast** - Beautiful toast notifications

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - Authentication and authorization
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **PDF parsing** - Extract data from medical reports
- **Groq AI** - Advanced LLM for health predictions and insights

### Security & Performance
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate limiting** - API protection
- **Input validation** - Data sanitization

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account (or local MongoDB)
- Groq API key (free at [console.groq.com](https://console.groq.com))

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/Diksha233456/healthlens-ai.git
cd healthlens-ai
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GROQ_API_KEY=your_groq_api_key
FRONTEND_URL=http://localhost:5173
PORT=5000
```

Start the backend server:
```bash
npm run dev
```
Backend will run on `http://localhost:5000`

### 3. Frontend Setup
Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Frontend will run on `http://localhost:5173`

## 📁 Project Structure

```
healthlens-ai/
├── backend/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

## 🔧 Available Scripts

### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔐 Environment Variables

Create a `.env` file in the backend directory with the following variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for JWT tokens | `your_secret_key` |
| `GROQ_API_KEY` | Groq API key for AI features | `gsk_...` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `PORT` | Backend server port | `5000` |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- **Groq** for providing fast and efficient AI inference
- **MongoDB** for reliable database solutions
- **React** ecosystem for amazing developer experience
- **Vite** for lightning-fast development

## 📞 Support

If you have any questions or need help, please open an issue on GitHub.

---

**Made with ❤️ for better healthcare through AI**