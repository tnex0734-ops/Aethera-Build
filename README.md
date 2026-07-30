# 🌈 Aethera — Every Doubt Deserves Clarity

> **A visual-first, multimodal AI learning companion built specifically for school students in Grades 1–10.**

---

## 📋 Table of Contents
1. [Overview & Product Requirements (PRD)](#-overview--product-requirements-prd)
2. [Product Guardrails](#-product-guardrails)
3. [Design System Specification](#-design-system-specification)
4. [Key Features](#-key-features)
5. [Technology Stack](#-technology-stack)
6. [Repository Structure](#-repository-structure)
7. [Getting Started](#-getting-started)

---

## 🌟 Overview & Product Requirements (PRD)

### Product Vision
Aethera is designed around a **single AI workspace** where every doubt resolution capability is embedded naturally. Standard AI tools assume students ask perfect questions in formal English. Aethera is built for **real student behavior**—handling handwritten notes, textbook photos, voice inputs, and mixed-language phrasing (e.g. Hinglish).

### User Persona: Aarav (Representative Student, Grade 8)
* **Context:** Studies from printed textbooks and handwritten notes.
* **Behavior:** Switches between English and regional languages; asks misspelled or incomplete questions.
* **Learning Style:** Learns faster with visual diagrams and step-by-step real-world examples than long paragraphs.

---

## 🛡️ Product Guardrails

Detailed guardrails ensure every interaction is safe, educational, and age-appropriate (see [`GUARDRAILS.md`](file:///c:/Users/TNEX/OneDrive/Desktop/Aethera-Build/GUARDRAILS.md)):

### 1. Input Guardrails
* **G-01 (Imperfect Text):** Correct spelling/grammar internally without pointing out student mistakes.
* **G-02 (Mixed Language):** Understand Hinglish/bilingual queries naturally (e.g., *"Iska answer bolo"* or *"denominator ante enti"*).
* **G-03 (Incomplete Questions):** Infer context from uploaded images or ask at most **one** concise clarification question.

### 2. Educational & Response Guardrails
* **G-04 (Teach First):** Prioritize conceptual understanding over rote answers.
* **G-05 (4-Part Structure):** Every educational response strictly follows:
  1. **🔍 Visual First** (Infographic/Diagram)
  2. **📖 Simple Explanation** (Step-by-step breakdown)
  3. **🏠 Real-Life Example** (Fun analogy)
  4. **🎯 Quick Check** (Interactive practice quiz)

---

## 🎨 Design System Specification

Aethera uses a high-contrast, playful edtech design system (see [`DESIGN.md`](file:///c:/Users/TNEX/OneDrive/Desktop/Aethera-Build/DESIGN.md)):

* **Color Palette:**
  * **Base:** Charcoal (`#14151A`), Cream (`#F6F3E7`), Ink Border (`#000000`)
  * **Accents:** Amber (`#FFD166`), Mint (`#06D6A0`), Coral (`#FF70A6`), Lavender (`#9D4EDD`), Sky (`#118AB2`)
* **Neo-Brutalist Motifs:** 3px thick borders, solid brutalist shadows, rounded card containers (`rounded-2xl`).
* **Pill Motifs:** Full-pill action buttons (`rounded-full`) for quick suggestions and subject filters.

---

## ✨ Key Features

* 🖼️ **Multimodal Vision & OCR:** Upload handwritten notes, textbook pages, or exam questions for instant OCR analysis.
* 👩‍🏫 **The 4-Part Teacher Pipeline:** Predictable visual-first educational responses.
* 🌐 **Mixed-Language & Hinglish Support:** Seamless bilingual understanding.
* ⚡ **Quick Action Pills:** One-tap autocomplete buttons (`✨ Explain Step-by-Step`, `🧮 Solve Homework`, `🖊️ Draw Diagram`, `❓ Quiz Me`).
* 🔊 **Voice Input & Read Aloud TTS:** Built-in Web Speech API voice typing and audio reading.
* 🕹️ **Interactive Quiz Cards:** Practice questions rendered as clickable quiz options with immediate feedback.
* ⚡ **Dual AI Engine:** Live Google Gemini 1.5/2.0 Flash Vision AI + local fallback engine for offline demonstrations.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend App** | React 19, Vite, TypeScript, Tailwind CSS v4, Framer Motion, Zustand, Lucide Icons |
| **AI Models** | Google Gemini 1.5 Flash Vision & Gemini 2.0 Flash (`@google/generative-ai`) |
| **Backend API** | Node.js, Express, Drizzle ORM, Zod Schema Validation |
| **Design Tokens** | Custom Neo-Brutalist Design System |

---

## 📁 Repository Structure

```
Aethera-Build/
├── artifacts/
│   ├── aethera/                # Client Frontend (React + Vite + TypeScript)
│   │   ├── src/
│   │   │   ├── components/     # UI Components (ChatInput, MessageBubble, VisualCard, QuizCard, etc.)
│   │   │   ├── pages/          # Page views (Chat workspace, Landing page, Profile)
│   │   │   └── index.css       # Tailwind CSS design system
│   └── api-server/             # Express API Server & Gemini AI Orchestration
├── DESIGN.md                   # Complete Design System Specification
├── GUARDRAILS.md                # Educational & Safety Guardrails Document
├── README.md                   # Primary Project Documentation
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

* **Node.js**: v18.0.0 or higher
* **pnpm** or **npm**

### Installation & Local Run

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/tnex0734-ops/Aethera-Build.git
   cd Aethera-Build
   ```

2. **Install Dependencies:**
   ```bash
   pnpm install
   ```

3. **Start the Frontend App:**
   ```bash
   cd artifacts/aethera
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## 🌐 Deploying to Vercel

Aethera is pre-configured for one-click deployment on **Vercel** with a root `vercel.json` configuration.

### Steps to Deploy on Vercel:

1. **Import Repository in Vercel:**
   - Go to [Vercel Dashboard](https://vercel.com/new).
   - Import `https://github.com/tnex0734-ops/Aethera-Build`.

2. **Configure Environment Variables (Secure API Key Exposure):**
   Under **Environment Variables** in Vercel settings, add:
   * **Key:** `VITE_GEMINI_API_KEY`
   * **Value:** `your_google_gemini_api_key_here`

3. **Deploy:**
   - Click **Deploy**. Vercel will automatically run the build command (`pnpm --filter ./artifacts/aethera run build`) and serve the application globally with zero config required!

---

## 🔒 Security Best Practices

* **API Key Protection:** The application uses client-side environment variable masking (`VITE_GEMINI_API_KEY`) and optional user session local storage. No plain-text API secrets are hardcoded in source control.
* **Input Sanitization:** User prompts and Markdown responses are parsed cleanly to prevent XSS (Cross-Site Scripting) attacks.
* **Content Safety:** Guardrail rules filter and block inappropriate or non-educational content.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for details.
