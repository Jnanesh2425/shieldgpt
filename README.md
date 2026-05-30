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
- [Troubleshooting](#troubleshooting)
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

- React 19 - UI framework
- Vite 7 - Build tool and dev server
- Tailwind CSS 4 - Styling
- Framer Motion - Animations
- Recharts - Data visualization
- Axios - HTTP client
- React Router DOM - Navigation

### Backend

- Node.js - Runtime environment
- Express 5 - Web framework
- MongoDB & Mongoose - Database
- Axios - HTTP client for inter-service communication
- CORS - Cross-origin resource sharing
- dotenv - Environment configuration

### AI/Detection Service

- Python 3 - Detection service runtime
- Flask - Web framework
- DistilBERT - Pre-trained transformer for classification
- Transformers (Hugging Face) - NLP library
- PyTorch - Deep learning framework

## Project Structure

```text
shield-gpt/
├── ai-detector/                 # Python detection service
│   ├── detector.py              # Main Flask API
│   ├── model_loader.py          # DistilBERT model loading
│   └── requirements.txt         # Python dependencies
│
├── Backend/                     # Node.js Express server
│   ├── server.js                # Main server entry point
│   ├── package.json             # Node dependencies
│   ├── config/
│   │   └── db.js                # MongoDB connection
│   ├── controllers/
│   │   └── promptController.js  # Route handlers
│   ├── middleware/
│   │   └── rateLimiter.js       # Rate limiting logic
│   ├── models/
│   │   └── promptLog.js         # MongoDB schema
│   ├── routes/
│   │   └── promptRoutes.js      # API routes
│   ├── services/
│   │   ├── detectionService.js  # DistilBERT integration
│   │   ├── ollamaService.js     # LLM service integration
│   │   └── sanitizerService.js  # Prompt sanitization
│   └── utils/
│       ├── riskScorer.js        # Risk calculation
│       └── sanitizer.js         # Input sanitization
│
└── Frontend/                    # React application
    ├── package.json             # React dependencies
    ├── vite.config.js           # Vite configuration
    ├── eslint.config.js         # ESLint rules
    ├── index.html               # Entry HTML
    ├── src/
    │   ├── main.jsx             # React entry point
    │   ├── App.jsx              # Main app component
    │   ├── App.css              # Global styles
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
    │   │   ├── Chatgpt.jsx      # Chat page
    │   │   └── Dashboard.jsx    # Analytics dashboard
    │   └── services/
    │       └── api.js           # API client
    └── public/                  # Static assets
```

## Prerequisites

- Node.js v18+
- Python 3.8+
- MongoDB, local or Atlas
- npm or yarn

## Installation

1. Clone the repository.

```bash
git clone https://github.com/yourusername/shield-gpt.git
cd shield-gpt
```

2. Install backend dependencies.

```bash
cd Backend
npm install
cd ..
```

3. Install frontend dependencies.

```bash
cd Frontend
npm install
cd ..
```

4. Install the Python detection service dependencies.

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

Start each service in a separate terminal.

```bash
# Start MongoDB if you use a local instance
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

The frontend is typically served at the URL shown by Vite, and the backend at `http://localhost:5000`.

## API Documentation

### POST `/api/prompt`

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

### GET `/api/logs`

Retrieve all prompt analysis logs. Supports `limit` and `skip` query parameters for pagination.

### GET `/api/stats`

Get dashboard statistics, including totals, detected counts, and average risk score.

### GET `/api/rate-limit-status`

Get rate limiting and blocked IP information.

## Architecture

```text
Frontend (React) -> Backend (Express) -> Detection Service (Python) / Ollama / MongoDB
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
2. Create a feature branch
3. Commit and push your changes
4. Open a pull request

## License

This project is licensed under the ISC License. See the `LICENSE` file for details.
---

