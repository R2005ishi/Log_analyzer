# LogLens | Intelligent Log Analyzer & Security Copilot

LogLens is a security diagnostic workspace that translates raw, cryptic enterprise syslog streams, auth logs, and Windows Event logs into structured, plain-English incident summaries and actionable mitigation playbooks using Gemini AI.

---

## 🛠️ Tech Stack & Architecture

LogLens is organized into a client-server architecture:

```
AI_log_analyzer/
├── backend/            # FastAPI (Python 3) Security Intelligence Core
└── frontend/           # Next.js 16 (React 19 + Tailwind CSS v4) Web Console
```

- **Backend**: Python FastAPI service that handles rule-based log format detection and integrates with the Google GenAI SDK (`gemini-2.5-flash` or similar) to generate structured analyses. It includes a mock fallback mode if no Gemini API key is configured.
- **Frontend**: A modern Next.js client featuring a premium Indigo/Violet design system, custom shimmer skeleton loading screens, a raw log viewer with line-level highlights, and interactive playbook checklists.

---

## 🚀 Quick Start

### 1. Start the Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Set your environment variables in `.env` (optional, falls back to mock mode if empty):
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-2.5-flash
   ```
4. Launch the FastAPI server:
   ```bash
   python main.py
   ```
   The backend will run on `http://127.0.0.1:8000`.

### 2. Start the Frontend
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install the packages:
   ```bash
   npm install
   ```
3. Run the Next.js development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser to launch the Web Console.

---

## 📋 Supported Logs

- **Cisco ASA**: Outbound TCP sessions and Deny/ACL logs.
- **Linux Auth Logs**: SSH authentication failures and Pam authorization logs.
- **Windows Event ID 4625**: Audit Logon Failure alerts.
- **Custom Logs**: Generic format engine analyzes text for system error/crash/unauthorized patterns.
