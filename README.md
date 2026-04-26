# 🚀 NaviMailX — AI Email Router (SaaS)

NaviMailX is a **production-style AI Email Routing system** that classifies customer emails by intent and generates intelligent responses using **local LLMs (Ollama)**.

Built with a **modern SaaS architecture** using Next.js, Tailwind, and Docker.

---

## ✨ Features

* 🤖 **AI Email Classification**

  * Detects intent: `complaint`, `question`, `refund`

* ⚡ **Automated Response Generation**

  * Context-aware replies powered by local LLM (Llama 3)

* 🛡️ **Guardrails Layer**

  * Filters unsafe or irrelevant inputs before processing

* 🧠 **Local AI (No API Cost)**

  * Runs fully offline using Ollama

* 📊 **Request Tracking**

  * Unique UUID for every request

* 🚦 **Rate Limiting Middleware**

  * Prevents abuse with in-memory throttling

* 📦 **Dockerized Setup**

  * Run entire stack with one command

* 🎨 **Modern SaaS UI**

  * Built with Tailwind + Framer Motion
  * Typing animation + toast notifications
  * Smooth 3D + hover effects

---

## 🏗️ Tech Stack

### Frontend

* Next.js (App Router)
* Tailwind CSS
* Framer Motion
* Sonner (toasts)

### Backend

* Next.js API Routes
* Node.js

### AI / ML

* Ollama
* Llama 3 (local LLM)

### DevOps

* Docker
* Docker Compose

---

## 📁 Project Structure

```text
app/
  api/email/route.js
  globals.css
  layout.js
  page.js

components/
  email/
    intent-badge.js
    loading-orb.js
    result-card.js
    typing-response.js
  ui/
    background-beams.js
    hover-border-gradient.js
    lamp-container.js
    toaster.js

lib/
  classifier.js
  guardrails.js
  logger.js
  ollama.js
  rate-limit.js
  request.js
  responder.js
  utils.js

scripts/
  wait-for-ollama.mjs

middleware.js
Dockerfile
docker-compose.yml
tailwind.config.js
postcss.config.mjs
```

---

## ⚙️ Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Install & run Ollama

```bash
ollama pull llama3
ollama run llama3
```

### 3. Start the app

```bash
npm run dev
```

👉 Open: http://localhost:3000

---

## 🐳 Docker Setup

### Run full stack

```bash
docker compose up --build
```

### Pull model inside container

```bash
docker exec -it navimailx-ollama ollama pull llama3
```

---

## 📬 API Usage

### Endpoint

```http
POST /api/email
```

### Request

```json
{
  "email": "I was charged twice for my subscription"
}
```

---

### ✅ Success Response

```json
{
  "id": "uuid",
  "intent": "complaint",
  "response": "Thanks for reaching out..."
}
```

---

### ❌ Error Response

```json
{
  "id": "uuid",
  "error": "Human readable error"
}
```

---

## 🔥 Key Highlights (Resume Ready)

* Built a **full-stack AI SaaS application**
* Implemented **LLM-based intent classification pipeline**
* Designed **modular backend architecture (guardrails + classifier + responder)**
* Integrated **local AI (Ollama) to eliminate API costs**
* Developed **interactive UI with animations and real-time feedback**
* Containerized entire system using **Docker**

---

## 📸 Demo (Add Screenshot Here)

> Add UI screenshot for better impact

---

## 🚀 Future Improvements

* User authentication (multi-tenant SaaS)
* Email inbox integration (Gmail / Outlook)
* Analytics dashboard
* Persistent database (PostgreSQL)
* Streaming responses (real-time tokens)

---

## 📄 License

MIT License
