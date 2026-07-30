# 🌈 Aethera — Every Doubt Deserves Clarity

> **A visual-first, multimodal AI learning companion built specifically for school students in Grades 1–10.**

---

## 🌟 Overview

**Aethera** bridges the gap between complex AI technology and early education. Standard AI chatbots are designed for adults—they return dense walls of text, require perfect English grammar, and cannot process physical learning materials like handwritten notebooks or textbook diagrams. 

Aethera acts like a patient, real-life school teacher. It accepts **text, voice, handwritten notes, textbook photos, and diagram images**, detects natural conversational inputs (including mixed languages like Hinglish), and responds through a predictable 4-part educational pipeline.

---

## ✨ Key Features

* 🖼️ **Multimodal Vision & OCR:** Upload photos of handwritten notebook notes (`notes.png`), complex textbook diagrams (`diagram.png`), or exam questions (`testbook.png`). Aethera automatically performs OCR and visual reasoning.
* 👩‍🏫 **The 4-Part Teacher Pipeline:** Every response is strictly formatted into:
  1. **🔍 Visual First:** An educational infographic or visual diagram to anchor the concept.
  2. **📖 Simple Explanation:** Step-by-step breakdown using grade-appropriate vocabulary.
  3. **🏠 Real-Life Example:** A fun, relatable comparison or analogy.
  4. **🎯 Quick Check:** An interactive multiple-choice practice quiz with instant feedback.
* 🌐 **Mixed-Language & Hinglish Support:** Understands natural student phrasing like *"Iska answer bolo"* or *"Ye explain karo"*.
* ⚡ **Quick Action Pills:** One-tap autocomplete pills for instant doubt resolution (`✨ Explain Step-by-Step`, `🧮 Solve Homework`, `🖊️ Draw Diagram`, `❓ Quiz Me`, `📖 Real-life Example`, `🗣️ Translate to Hindi`).
* 🔊 **Voice Input & Read Aloud TTS:** Full Web Speech API integration supporting voice typing and audio synthesis across regional languages (English, Hindi, Telugu, Tamil, Kannada, Malayalam).
* 🕹️ **Interactive Quiz Cards:** Practice questions rendered as interactive, clickable quiz cards with immediate answer validation.
* ⚡ **Intelligent Local Fallback Engine:** Works seamlessly online with live Gemini 1.5/2.0 Flash Vision AI AND offline with a built-in intelligent fallback engine for instant demonstrations.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend App** | React 19, Vite, TypeScript, Tailwind CSS v4, Framer Motion, Zustand, Lucide Icons |
| **AI Models** | Google Gemini 1.5 Flash Vision & Gemini 2.0 Flash (`@google/generative-ai`) |
| **Backend API** | Node.js, Express, Drizzle ORM, Zod Schema Validation |
| **Styling Concept** | High-contrast Neo-Brutalist design (child-friendly, high readability) |

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
├── test case images/           # Sample test case assets for demonstration
│   ├── diagram.png             # Textbook cell diagram test image
│   ├── notes.png               # Handwritten science notes test image
│   └── testbook.png            # Practice exam test page image
├── README.md                   # Project documentation
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

* **Node.js**: v18.0.0 or higher
* **pnpm** or **npm**

### Installation

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/tnex0734-ops/Aethera-Build.git
   cd Aethera-Build
   ```

2. **Install Dependencies:**
   ```bash
   pnpm install
   ```

3. **Configure Environment Variables (Optional):**
   Create a `.env` file in `artifacts/aethera` or set your API key inside the UI Settings Panel:
   ```env
   VITE_GEMINI_API_KEY="your_google_gemini_api_key_here"
   ```

4. **Start the Frontend Development Server:**
   ```bash
   cd artifacts/aethera
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## 🧪 Testing with Sample Test Cases

You can test Aethera end-to-end using the included sample images in `test case images/`:

| Test Case | Asset File | Prompt to Test | Expected Feature Demonstrated |
| :--- | :--- | :--- | :--- |
| **TC-01** | `testbook.png` | *"Iska answer bolo"* | OCR extraction, Hinglish understanding, Quadratic equation step-by-step solver. |
| **TC-02** | `notes.png` | Select `✨ Explain Step-by-Step` | Handwritten notes OCR, Chlorophyll science summary, Interactive quiz. |
| **TC-03** | `diagram.png` | Select `🖊️ Draw Diagram` | Visual organelle breakdown, solar house analogy, cell structure summary. |
| **TC-04** | Text Input | *"What is photosynthesis?"* | Full 4-part teacher pipeline (Visual → Explain → Example → Practice). |
| **TC-05** | Voice Input | Click **🎤 Mic** or **🔊 Listen** | Speech recognition and read-aloud TTS. |

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more details.
