# 🛡️ AI Firewall for LLMs

AI Firewall is a lightweight **security gateway for Large Language Models (LLMs)** that detects and blocks **prompt injection, jailbreak attempts, and encoded prompt attacks** before they reach the AI model.

It acts as a **protective layer between users and the LLM**, ensuring safer AI interactions.

---

## 🚨 Problem

Modern LLM applications are vulnerable to prompt-based attacks such as:

- Jailbreak attacks (bypassing AI safety rules)
- Prompt injection (manipulating system instructions)
- Encoded prompts (Base64/Hex hidden instructions)
- Repeated brute-force prompt attempts

Most AI systems send prompts **directly to the LLM without security filtering**, which can lead to misuse.

---

## 💡 Solution

Our system introduces an **AI Firewall** that analyzes prompts before they reach the language model.

Workflow:

User Prompt → AI Firewall Detection → Risk Analysis → Decision → LLM Response

Possible outcomes:

User Prompt → Detection → **Blocked** (if malicious)

User Prompt → Detection → **Sanitized** (if partially unsafe)

User Prompt → Detection → **Allowed** → Forwarded to LLM

---

## ⚙️ Tech Stack

Frontend → React  
Backend → Node.js + Express  
Database → MongoDB  
AI Model → DistilBERT (Hugging Face)  
Detection Service → Python + Flask  
LLM Runtime → Ollama (Llama3)

---

## 🔐 Key Features

- AI-based prompt classification (SAFE / JAILBREAK / PROMPT_INJECTION)
- Prompt injection detection
- Jailbreak attack detection
- Encoded prompt detection (Base64 / Hex)
- Prompt sanitization for borderline prompts
- Rate limiting to prevent repeated attacks
- Security monitoring dashboard

---

## 📁 Project Structure

ai-firewall  
│  
├── Backend → API gateway and security logic  
├── Frontend → Chat interface and dashboard  
├── ai-detector → AI detection service  
└── README.md  

---

## 📄 License

MIT License
