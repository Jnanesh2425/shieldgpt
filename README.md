# 🛡️ AI Firewall - LLM Security Gateway

A comprehensive security solution designed to protect Large Language Model (LLM) applications from malicious prompts, injection attacks, and suspicious input patterns. AI Firewall provides real-time threat detection, risk analysis, and detailed security monitoring.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Architecture](#architecture)
- [Security Features](#security-features)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

- **Advanced Threat Detection**: Uses DistilBERT for zero-shot classification to identify malicious prompts
- **Real-time Dashboard**: Comprehensive security analytics and threat monitoring
- **Rate Limiting**: Prevent abuse with configurable rate limiting per IP
- **Prompt Sanitization**: Automatic input cleaning and sanitization
- **Attack Logging**: Detailed logging of suspicious activities and blocked requests
- **Risk Scoring**: Quantified risk assessment for each prompt
- **Interactive Chat**: Test and validate prompts against the security system
- **Statistics & Analytics**: Real-time statistics on detected threats and system performance
- **Fallback Intelligence**: Smart knowledge base when external services are unavailable
- **CORS Enabled**: Ready for cross-origin requests

## Technology Stack

### Frontend
- **React 19** - UI framework
- **Vite 7** - Build tool and dev server
- **Tailwind CSS 4** - Styling
- **Framer Motion** - Animations
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **React Router DOM** - Navigation
- **React Icons** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express 5** - Web framework
- **MongoDB & Mongoose** - Database
- **Axios** - HTTP client for inter-service communication
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment configuration

### AI/Detection Service
- **Python 3** - Detection service runtime
- **Flask** - Web framework
- **DistilBERT** - Pre-trained transformer for classification
- **Transformers (Hugging Face)** - NLP library
- **PyTorch** - Deep learning framework

## 📁 Project Structure

```
shield-gpt/
├── ai-detector/                 # Python detection service
│   ├── detector.py             # Main Flask API
│   ├── model_loader.py         # DistilBERT model loading
│   └── requirements.txt        # Python dependencies
│
├── Backend/                    # Node.js Express server
│   ├── server.js              # Main server entry point
│   ├── package.json           # Node dependencies
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   └── promptController.js # Route handlers
│   ├── middleware/
│   │   └── rateLimiter.js     # Rate limiting logic
│   ├── models/
│   │   └── promptLog.js       # MongoDB schema
│   ├── routes/
│   │   └── promptRoutes.js    # API routes
│   ├── services/
│   │   ├── detectionService.js    # DistilBERT integration
│   │   ├── ollamaService.js       # LLM service integration
│   │   └── sanitizerService.js    # Prompt sanitization
│   └── utils/
│       ├── riskScorer.js      # Risk calculation
│       └── sanitizer.js       # Input sanitization
│
└── Frontend/                   # React application
    ├── package.json           # React dependencies
    ├── vite.config.js        # Vite configuration
    ├── eslint.config.js      # ESLint rules
    ├── index.html            # Entry HTML
    ├── src/
    │   ├── main.jsx          # React entry point
    │   ├── App.jsx           # Main app component
    │   ├── App.css           # Global styles
    │   ├── components/
    │   │   ├── ChatWindow.jsx       # Chat interface
    │   │   ├── PromptInput.jsx      # Input handler
    │   │   ├── SecurityAnalysis.jsx # Threat analysis display
    │   │   ├── RiskIndicator.jsx    # Risk visualization
    │   │   ├── AttackLogs.jsx       # Log viewer
    │   │   ├── ThreatChart.jsx      # Chart component
    │   │   ├── StatsCards.jsx       # Statistics display
    │   │   ├── MessageBubble.jsx    # Chat message component
    │   │   ├── LLMResponse.jsx      # LLM response display
    │   │   └── ParticleBackground.jsx # Visual effects
    │   ├── pages/
    │   │   ├── Chatgpt.jsx    # Chat page
    │   │   └── Dashboard.jsx  # Analytics dashboard
    │   └── services/
    │       └── api.js         # API client
    └── public/                # Static assets
```

## Prerequisites

Before running the application, ensure you have installed:

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **Python** 3.8+ ([Download](https://www.python.org/))
- **MongoDB** ([Local installation](https://docs.mongodb.com/manual/installation/) or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **npm** or **yarn** for package management

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/shield-gpt.git
cd shield-gpt
```

### 2. Install Backend Dependencies

```bash
cd Backend
npm install
cd ..
```

### 3. Install Frontend Dependencies

```bash
cd Frontend
npm install
cd ..
```

### 4. Install Python Detection Service

```bash
cd ai-detector
pip install -r requirements.txt
cd ..
```

## Configuration

### Backend Configuration

Create a `.env` file in the `Backend/` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/aifw-db
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/aifw-db?retryWrites=true&w=majority

# Detection Service
DETECTION_SERVICE_URL=http://localhost:5001

# Ollama Service (optional)
OLLAMA_URL=http://localhost:11434

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend Configuration

The frontend is configured in `Frontend/vite.config.js`. Default API endpoint is `http://localhost:5000/api`.

If needed, modify the API base URL in `Frontend/src/services/api.js`:

```javascript
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:5000/api';
```

### Python Detection Service

No additional configuration needed. The service runs on port 5001 by default.

## Running the Application

### Option 1: Run All Services Simultaneously (Recommended)

Open three terminal windows and run each command in a separate window:

**Terminal 1 - Start MongoDB** (if running locally)
```bash
mongod
```

**Terminal 2 - Start Python Detection Service**
```bash
cd ai-detector
python detector.py
```

**Terminal 3 - Start Backend Server**
```bash
cd Backend
npm start
# or with auto-reload
npm install -g nodemon
nodemon server.js
```

**Terminal 4 - Start Frontend Dev Server**
```bash
cd Frontend
npm run dev
```

The application will be available at `http://localhost:5173` (or the URL shown by Vite).

### Option 2: Run Production Build

**Build Frontend**
```bash
cd Frontend
npm run build
```

**Run Backend**
```bash
cd Backend
npm start
```

The backend will serve the built frontend at `http://localhost:5000`.

## 📡 API Documentation

### POST `/api/prompt`

Analyze and process a prompt for security threats.

**Request:**
```json
{
  "prompt": "Your prompt text here"
}
```

**Response:**
```json
{
  "id": "log_id",
  "prompt": "Your prompt text here",
  "label": "MALICIOUS|SUSPICIOUS|SAFE",
  "confidence": 0.95,
  "riskScore": 0.8,
  "sanitized": "Sanitized prompt text",
  "timestamp": "2026-05-30T12:00:00Z"
}
```

### GET `/api/logs`

Retrieve all prompt analysis logs.

**Query Parameters:**
- `limit` - Number of logs to retrieve (default: 100)
- `skip` - Number of logs to skip for pagination

**Response:**
```json
{
  "logs": [
    { /* log objects */ }
  ],
  "total": 150
}
```

### GET `/api/stats`

Get dashboard statistics.

**Response:**
```json
{
  "totalPrompts": 1500,
  "maliciousDetected": 45,
  "suspiciousDetected": 120,
  "safePrompts": 1335,
  "averageRiskScore": 0.22,
  "blockedIPs": 12
}
```

### GET `/api/rate-limit-status`

Get rate limiting and blocked IPs information.

**Response:**
```json
{
  "blockedIPs": ["192.168.1.1", "10.0.0.5"],
  "rateLimitWindow": 900000,
  "maxRequests": 100
}
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                       │
│              (Chat Interface + Dashboard)                    │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST
┌──────────────────────▼──────────────────────────────────────┐
│                   Backend (Express)                           │
│        (API Server, Rate Limiting, Logging)                 │
├──────────────────┬──────────────────┬───────────────────────┤
│                  │                  │                       │
│ Detection        │ Ollama          │ Sanitization         │
│ Service Call     │ Service Call    │ Service             │
│                  │                  │                       │
└──────┬───────────┼──────────────────┼──────────────┬────────┘
       │           │                  │              │
       │    ┌──────▼────────────┐     │         ┌────▼───────┐
       │    │  MongoDB          │     │         │ Rate Limit │
       │    │  (Logging, Logs)  │     │         │  Storage   │
       │    └───────────────────┘     │         └────────────┘
       │                              │
       ▼                              ▼
┌─────────────────────┐      ┌────────────────────┐
│ Python Detection    │      │ Ollama Service     │
│ (DistilBERT)        │      │ (Local LLM)        │
└─────────────────────┘      └────────────────────┘
```

## Security Features

1. **Malicious Prompt Detection**: DistilBERT zero-shot classification identifies harmful patterns
2. **Rate Limiting**: IP-based rate limiting prevents brute force attacks
3. **Input Sanitization**: Automatic removal of potentially dangerous content
4. **Logging & Monitoring**: Detailed audit trails for all requests
5. **CORS Protection**: Configurable cross-origin access
6. **Error Handling**: Graceful fallbacks and error recovery
7. **Environment Isolation**: Sensitive configs via environment variables

## Troubleshooting

### Detection Service Connection Error
```
Error: Detection service unavailable
```
**Solution**: Ensure the Python Flask service is running on port 5001

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Start MongoDB locally or update MONGODB_URI in .env with Atlas credentials

### CORS Errors
```
Access-Control-Allow-Origin errors
# AI Firewall - LLM Security Gateway

AI Firewall is a security solution designed to protect Large Language Model (LLM) applications from malicious prompts, injection attacks, and suspicious input patterns. It provides real-time threat detection, risk analysis, and security monitoring.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Architecture](#architecture)
- [Security Features](#security-features)
- [Contributing](#contributing)
- [License](#license)

## Features

- Advanced threat detection using DistilBERT for zero-shot classification
- Real-time dashboard with security analytics and monitoring
- Configurable rate limiting to mitigate abuse
- Input sanitization and cleaning
- Detailed logging of suspicious activity and blocked requests
- Risk scoring for analyzed prompts
- Interactive chat UI for testing and validation
- Statistics and analytics for system performance
- Fallback knowledge base for offline or degraded external services
- Cross-origin request support (CORS)

## Technology Stack

### Frontend
- React 19 — UI framework
- Vite 7 — Build tool and dev server
- Tailwind CSS 4 — Styling
- Framer Motion — Animations
- Recharts — Data visualization
- Axios — HTTP client
- React Router DOM — Navigation

### Backend
- Node.js — Runtime environment
- Express 5 — Web framework
- MongoDB & Mongoose — Database
- Axios — HTTP client for inter-service communication
- CORS — Cross-origin resource sharing
- dotenv — Environment configuration

### AI/Detection Service
- Python 3 — Detection service runtime
- Flask — Web framework
- DistilBERT — Pre-trained transformer for classification
- Transformers (Hugging Face) — NLP library
- PyTorch — Deep learning framework

## Project Structure

```
shield-gpt/
├── ai-detector/                 # Python detection service
│   ├── detector.py              # Main Flask API
│   ├── model_loader.py          # DistilBERT model loading
│   └── requirements.txt         # Python dependencies
│
├── Backend/                      # Node.js Express server
│   ├── server.js                 # Main server entry point
│   ├── package.json              # Node dependencies
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   └── promptController.js   # Route handlers
│   ├── middleware/
│   │   └── rateLimiter.js        # Rate limiting logic
│   ├── models/
│   │   └── promptLog.js          # MongoDB schema
│   ├── routes/
│   │   └── promptRoutes.js       # API routes
│   ├── services/
│   │   ├── detectionService.js   # DistilBERT integration
│   │   ├── ollamaService.js      # LLM service integration
│   │   └── sanitizerService.js   # Prompt sanitization
│   └── utils/
│       ├── riskScorer.js         # Risk calculation
│       └── sanitizer.js          # Input sanitization
│
└── Frontend/                     # React application
    ├── package.json              # React dependencies
    ├── vite.config.js            # Vite configuration
    ├── eslint.config.js          # ESLint rules
    ├── index.html                # Entry HTML
    ├── src/
    │   ├── main.jsx              # React entry point
    │   ├── App.jsx               # Main app component
    │   ├── App.css               # Global styles
    │   ├── components/
    │   │   ├── ChatWindow.jsx       # Chat interface
    │   │   ├── PromptInput.jsx      # Input handler
    │   │   ├── SecurityAnalysis.jsx # Threat analysis display
    │   │   ├── RiskIndicator.jsx    # Risk visualization
    │   │   ├── AttackLogs.jsx       # Log viewer
    │   │   ├── ThreatChart.jsx      # Chart component
    │   │   ├── StatsCards.jsx       # Statistics display
    │   │   ├── MessageBubble.jsx    # Chat message component
    │   │   ├── LLMResponse.jsx      # LLM response display
    │   │   └── ParticleBackground.jsx # Visual effects
    │   ├── pages/
    │   │   ├── Chatgpt.jsx        # Chat page
    │   │   └── Dashboard.jsx      # Analytics dashboard
    │   └── services/
    │       └── api.js             # API client
    └── public/                    # Static assets
```

## Prerequisites

Ensure the following are installed before running the application:

- Node.js v18+
- Python 3.8+
- MongoDB (local or Atlas)
- npm or yarn

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/shield-gpt.git
cd shield-gpt
```

2. Install backend dependencies:

```bash
cd Backend
npm install
cd ..
```

3. Install frontend dependencies:

```bash
cd Frontend
npm install
cd ..
```

4. Install the Python detection service dependencies:

```bash
cd ai-detector
pip install -r requirements.txt
cd ..
```

## Configuration

### Backend

Create a `.env` file in the `Backend/` directory with the following variables:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/aifw-db
DETECTION_SERVICE_URL=http://localhost:5001
OLLAMA_URL=http://localhost:11434
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend

The default API base URL is `http://localhost:5000/api`. Adjust `Frontend/src/services/api.js` or set `VITE_API_URL` as needed.

### Python Detection Service

No additional configuration is required; the service runs on port 5001 by default.

## Running the Application

Recommended: start each service in a separate terminal.

```bash
# Start MongoDB (if running locally)
mongod

# Start the Python detection service
cd ai-detector
python detector.py

# Start the backend server
cd Backend
npm start

# Start the frontend dev server
cd Frontend
npm run dev
```

For production, build the frontend and run the backend:

```bash
cd Frontend
npm run build

cd Backend
npm start
```

The frontend is typically served at the URL shown by Vite (default `http://localhost:5173`) and the backend at `http://localhost:5000`.

## API Documentation

### POST /api/prompt

Analyze and process a prompt for security threats.

Request body:

```json
{
  "prompt": "Your prompt text here"
}
```

Example response:

```json
{
  "id": "log_id",
  "prompt": "Your prompt text here",
  "label": "MALICIOUS|SUSPICIOUS|SAFE",
  "confidence": 0.95,
  "riskScore": 0.8,
  "sanitized": "Sanitized prompt text",
  "timestamp": "2026-05-30T12:00:00Z"
}
```

### GET /api/logs

Retrieve all prompt analysis logs. Supports `limit` and `skip` query parameters for pagination.

### GET /api/stats

Get dashboard statistics (totals, detected counts, average risk score, etc.).

### GET /api/rate-limit-status

Get rate limiting and blocked IPs information.

## Architecture

```
Frontend (React)  -->  Backend (Express)  -->  Detection Service (Python) / Ollama / MongoDB
```

## Security Features

1. Malicious prompt detection using DistilBERT
2. IP-based rate limiting
3. Input sanitization
4. Logging and monitoring
5. CORS configuration
6. Graceful error handling and fallbacks
7. Environment-based configuration for sensitive values

## Troubleshooting

Detection service unavailable:

```text
Error: Detection service unavailable
```

Ensure the Python Flask service is running on port 5001.

MongoDB connection error:

```text
Error: connect ECONNREFUSED 127.0.0.1:27017
```

Start MongoDB locally or update `MONGODB_URI` in `.env` with Atlas credentials.

CORS errors:

```text
Access-Control-Allow-Origin errors
```

Confirm backend CORS configuration and frontend API base URL.

Port already in use:

```text
Error: listen EADDRINUSE: address already in use :::5000
```

Change `PORT` in `.env` or stop the process using the port.

## Contributing

Contributions are welcome. Suggested workflow:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit and push your changes
4. Open a pull request

## License

This project is licensed under the ISC License. See the `LICENSE` file for details.

## Support

For questions or issues, open an issue on the project repository.

## Future Enhancements

- Advanced ML models for improved detection accuracy
- Multi-language prompt support
- Custom rule engine for organization-specific threats
- WebSocket support for real-time updates
- Integration with external threat intelligence feeds
- Admin dashboard for configuration management
- API key authentication
- Webhook notifications for critical events

---

