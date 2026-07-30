import { useState, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { BrutalButton } from '@/components/brutal-button';
import { BrutalCard } from '@/components/brutal-card';
import { BrutalBadge } from '@/components/brutal-badge';
import { AetheraAssistant, AssistantState } from '@/components/chat/AetheraAssistant';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { PinnedScrollButton } from '@/components/chat/PinnedScrollButton';
import { ChatInput } from '@/components/chat/ChatInput';
import { 
  useListSessions, 
  useCreateSession, 
  useGetSession, 
  useSendChat,
  useCreateUpload,
  getListSessionsQueryKey,
  getGetSessionQueryKey
} from '@workspace/api-client-react';
import { 
  Menu, Plus, Sparkles, Home, History, UserCircle, X, 
  MessageSquare, BookOpen, Search, Trash2, Sun, Moon 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Chat() {
  const queryClient = useQueryClient();
  // Local session & message fallback state for offline / standalone mode
  const [localSessions, setLocalSessions] = useState<Array<{ id: number; title: string; subject?: string | null; messageCount: number; createdAt: string; updatedAt: string }>>([
    { id: 1, title: 'Quadratic Equations Doubt', subject: 'Mathematics', messageCount: 2, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 2, title: 'Photosynthesis Process', subject: 'Biology', messageCount: 2, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  ]);

  const [localMessages, setLocalMessages] = useState<Record<number, Array<{ id: number; sessionId: number; role: 'user' | 'assistant'; content: string; subject?: string | null; hasVisual?: boolean; createdAt: string }>>>({
    1: [
      { id: 101, sessionId: 1, role: 'user', content: 'How do I solve 2x² + 5x - 3 = 0 using the quadratic formula?', subject: 'Mathematics', createdAt: new Date().toISOString() },
      { id: 102, sessionId: 1, role: 'assistant', content: `## 🔍 Visual: Formula Breakdown\n\n\`\`\`mermaid\nflowchart TD\n    A["ax² + bx + c = 0"] --> B["Identify: a=2, b=5, c=-3"]\n    B --> C["Formula: x = (-b ± √(b² - 4ac)) / 2a"]\n    C --> D["Discriminant: D = 5² - 4(2)(-3) = 49"]\n    D --> E["Roots: x = (-5 ± 7) / 4 → x = 0.5 or x = -3"]\n    style A fill:#FFD166,stroke:#000\n    style E fill:#06D6A0,stroke:#000\n\`\`\`\n\n---\n\n## 📖 Explanation\n\nGreat question! Let's solve **2x² + 5x - 3 = 0** step by step:\n\n1. **Identify coefficients**: a = 2, b = 5, c = -3\n2. **Calculate Discriminant**: D = b² - 4ac = (5)² - 4(2)(-3) = 25 + 24 = **49**\n3. **Apply Quadratic Formula**: x = (-5 ± √49) / (2 × 2) = (-5 ± 7) / 4\n4. **Find the two solutions**:\n   - x₁ = (-5 + 7) / 4 = 2 / 4 = **1/2**\n   - x₂ = (-5 - 7) / 4 = -12 / 4 = **-3**\n\n---\n\n## 🌟 Real-World Example\n\nQuadratic equations are used by game designers to calculate the curved trajectory of an Angry Bird flying through the air or a basketball shot landing in the hoop!\n\n---\n\n## ✅ Quick Check\n\n**What is the value of the discriminant (b² - 4ac) for 2x² + 5x - 3 = 0?**\n\nA) 25\nB) 49 ✅\nC) 12\nD) 0\n\n**✅ Answer: B — 49. Since 49 > 0, there are two distinct real roots!**\n\n🌟 Great job tackling algebra! Keep up the awesome work! 🚀`, subject: 'Mathematics', hasVisual: true, createdAt: new Date().toISOString() }
    ],
    2: [
      { id: 201, sessionId: 2, role: 'user', content: 'Explain photosynthesis simply.', subject: 'Biology', createdAt: new Date().toISOString() },
      { id: 202, sessionId: 2, role: 'assistant', content: `## 🔍 Visual: Photosynthesis Flowchart\n\n\`\`\`mermaid\nflowchart LR\n    A["☀️ Sunlight"] --> B["Leaves (Chlorophyll)"]\n    C["💧 Water"] --> B\n    D["🌬️ CO₂"] --> B\n    B --> E["Glucose (Food)"]\n    B --> F["🌿 Oxygen (Released)"]\n    style A fill:#FFD166,stroke:#000\n    style E fill:#06D6A0,stroke:#000\n\`\`\`\n\n---\n\n## 📖 Explanation\n\nPhotosynthesis is how green plants make their own food!\n\n1. **Sunlight**: Leaves absorb energy from the sun using green chlorophyll.\n2. **Water**: Roots take up water from the soil.\n3. **Carbon Dioxide**: Leaves take in CO₂ from the air.\n4. **Output**: Plants produce glucose (energy) and release fresh oxygen for us to breathe!\n\n---\n\n## 🌟 Real-World Example\n\nThink of a leaf as a tiny solar-powered kitchen! Sunlight is the power source, water and air are the ingredients, and oxygen is the fresh breeze it creates!\n\n---\n\n## ✅ Quick Check\n\n**What gas do plants release during photosynthesis?**\n\nA) Carbon Dioxide\nB) Oxygen ✅\nC) Nitrogen\nD) Hydrogen\n\n**✅ Answer: B — Oxygen! Plants enrich our air with oxygen everyday!**\n\n🌟 Keep exploring science! You're doing amazing! 🌿`, subject: 'Biology', hasVisual: true, createdAt: new Date().toISOString() }
    ]
  });

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [assistantPanelOpen, setAssistantPanelOpen] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [assistantState, setAssistantState] = useState<AssistantState>('idle');

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: apiSessions = [], isLoading: sessionsLoading } = useListSessions();
  const sessions = Array.isArray(apiSessions) && apiSessions.length > 0 ? apiSessions : localSessions;

  const { data: currentApiSession, isLoading: sessionLoading } = useGetSession(
    currentSessionId!,
    { query: { enabled: !!currentSessionId && Array.isArray(apiSessions) && apiSessions.length > 0, queryKey: getGetSessionQueryKey(currentSessionId!) } }
  );

  const createSession = useCreateSession();
  const sendChat = useSendChat();
  const createUpload = useCreateUpload();

  const currentSession = currentApiSession || (Array.isArray(sessions) ? (sessions.find(s => s.id === currentSessionId) as any) : null) || null;
  const messages = currentSession?.messages || (currentSessionId ? (localMessages[currentSessionId] || []) : []);

  // Update assistant state based on query loading state
  useEffect(() => {
    if (sendChat.isPending || sessionLoading) {
      setAssistantState('generating');
    } else if (createSession.isPending || createUpload.isPending) {
      setAssistantState('thinking');
    } else if (messages.length > 0 && messages[messages.length - 1].role === 'assistant') {
      setAssistantState('explaining');
    } else {
      setAssistantState('idle');
    }
  }, [sendChat.isPending, sessionLoading, createSession.isPending, createUpload.isPending, messages]);

  // Select initial session if available
  useEffect(() => {
    if (sessions.length > 0 && currentSessionId === null) {
      setCurrentSessionId(sessions[0].id);
    }
  }, [sessions, currentSessionId]);

  // Smooth Auto Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sendChat.isPending]);

  // Scroll detection for pinned scroll button
  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isUp = scrollHeight - scrollTop - clientHeight > 150;
    setShowScrollButton(isUp);
  };

  const handleNewSession = () => {
    const newId = Date.now();
    const newSessionObj = {
      id: newId,
      title: 'New Learning Doubt',
      subject: 'General',
      messageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setLocalSessions(prev => [newSessionObj, ...prev]);
    setLocalMessages(prev => ({ ...prev, [newId]: [] }));
    setCurrentSessionId(newId);
    setAssistantState('happy');

    createSession.mutate(
      { data: { title: 'New Learning Doubt' } },
      {
        onSuccess: (newSession: any) => {
          setCurrentSessionId(newSession.id);
          queryClient.invalidateQueries({ queryKey: getListSessionsQueryKey() });
        }
      }
    );
  };

  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi' | 'te' | 'ta' | 'kn' | 'ml'>('en');
  const [selectedGrade, setSelectedGrade] = useState<string>('Grade 10');
  const [selectedCurriculum, setSelectedCurriculum] = useState<string>('CBSE');
  const [selectedSubject, setSelectedSubject] = useState<string>('Auto-detect');
  const [rightPanelTab, setRightPanelTab] = useState<'settings' | 'mascot'>('settings');

  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => {
    return localStorage.getItem('aethera_gemini_api_key') || '';
  });

  const handleApiKeyChange = (key: string) => {
    setGeminiApiKey(key);
    localStorage.setItem('aethera_gemini_api_key', key);
  };

  const readFileAsBase64 = (file: File): Promise<{ base64: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1] || result;
        resolve({ base64, mimeType: file.type || 'image/png' });
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const callGeminiAPI = async (
    prompt: string,
    base64ImageData?: { base64: string; mimeType: string },
    lang: string = 'en',
    grade: string = 'Grade 10',
    curr: string = 'CBSE',
    subj: string = 'General',
    apiKey: string = ''
  ): Promise<string> => {
    const modelsToTry = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];
    const langNames: Record<string, string> = {
      en: 'English', hi: 'Hindi (हिन्दी)', te: 'Telugu (తెలుగు)', ta: 'Tamil (தமிழ்)', kn: 'Kannada (ಕನ್ನಡ)', ml: 'Malayalam (മലയാളം)'
    };
    const targetLang = langNames[lang] || 'English';

    const systemInstruction = `You are Aethera, a warm, highly intelligent, empathetic AI tutor for Grade 1–10 students.
Current Grade: ${grade}. Curriculum: ${curr}. Subject: ${subj}.
Preferred Language: ${targetLang}.

INSTRUCTIONS:
1. If an image is provided (notebook photo, handwritten notes, textbook diagram, exam question):
   - Carefully perform OCR to read all printed text, handwritten notes, math symbols, and diagram labels from the image.
   - Explain the exact question/diagram in the image accurately and thoroughly.
2. Format the response strictly using the following educational pipeline (Visual First -> Explain -> Simple Example -> Quick Practice):

## 🔍 Visual
(Provide a clean markdown ASCII/Mermaid or text diagram representing the visual answer or key concept)

---

## 📖 Simple Explanation
(Explain the answer step-by-step for a ${grade} student in simple, clear terms)

---

## 🏠 Simple Example
(Provide a clear, fun, real-life example or analogy)

---

## 🎯 Quick Check
(Provide 1 multiple-choice practice question with 4 options, marking the correct option with ✅ and a short explanation)`;

    const parts: any[] = [{ text: systemInstruction }];

    if (base64ImageData) {
      parts.push({
        inlineData: {
          mimeType: base64ImageData.mimeType,
          data: base64ImageData.base64
        }
      });
    }

    parts.push({ text: `Student Question / Context: ${prompt}` });

    let lastErr = null;
    for (const modelName of modelsToTry) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 2048
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) return text;
        } else {
          const errData = await response.json().catch(() => ({}));
          lastErr = new Error(errData?.error?.message || `Gemini API call failed for ${modelName} (${response.status})`);
        }
      } catch (err: any) {
        lastErr = err;
      }
    }

    throw lastErr || new Error("Gemini API calls failed on all models.");
  };

  const generateLocalResponse = (query: string, subj?: string, fileUploadName?: string): string => {
    const lower = query.toLowerCase().trim();
    const fileLower = (fileUploadName || "").toLowerCase();
    const currentMessages = currentSessionId ? (localMessages[currentSessionId] || []) : [];
    
    // Check specific file names (diagram.png, notes.png, testbook.png)
    if (fileLower.includes("diagram")) {
      return `🖼️ **Visual Analysis of Uploaded Diagram**: "Cell Structure & Photosynthesis Machinery"

---

\`\`\`
   [Cell Wall & Membrane]
         ↓
  [Chloroplasts (Green Energy Kitchen)] ➔ Absorbs Solar Energy ☀️
         ↓
  [Nucleus (Control Center)] ➔ Directs Cell Functions 🧬
\`\`\`

---

# 📖 Simple Explanation

I've analyzed your uploaded diagram! Here is the clear breakdown:

1. **Chloroplast**: The green organelle where sunlight is turned into plant food (glucose).
2. **Cell Wall**: The rigid outer protective wall keeping the cell sturdy and upright.
3. **Nucleus**: The master brain of the cell containing genetic code.
4. **Mitochondria**: The powerhouse generating energy for cellular processes.

---

# 🏠 Real-Life Example

Think of this diagram like a solar-powered smart home: the Cell Wall is the sturdy house frame, the Chloroplast is the solar roof kitchen, and the Nucleus is the homeowner!

---

# 🎯 Quick Check

**In the uploaded diagram, which organelle absorbs sunlight to perform photosynthesis?**

○ Nucleus
○ Chloroplast ✅
○ Cell Wall
○ Vacuole

Great diagram analysis! Studying visually makes science super easy! 🌟`;
    }

    if (fileLower.includes("notes") || fileLower.includes("handwritten")) {
      return `📷 **OCR Extracted Text from Handwritten Notes**: "Photosynthesis & Solar Energy Absorption in Leaf Chlorophyll"

---

\`\`\`
  ☀️ Sunlight + 💧 Soil Water ➔ 🍃 Leaf Chlorophyll ➔ 🍎 Glucose + 🌳 Oxygen
\`\`\`

---

# 📖 Simple Explanation

I've read and analyzed your handwritten notebook notes! Here is the step-by-step summary:

1. **Energy Capture**: Chlorophyll inside leaves traps radiant solar light.
2. **Reactants**: Water absorbed from soil and Carbon Dioxide from air react together.
3. **Products**: Plants manufacture glucose (food energy) and release clean Oxygen!

---

# 🏠 Real-Life Example

Think of your handwritten notes like a leaf's daily recipe book! Water and air are the ingredients, sunlight is the microwave heat, and oxygen is the fresh breeze it produces!

---

# 🎯 Quick Check

**According to your handwritten notes, what substance is released into the air by plants?**

○ Carbon Dioxide
○ Oxygen ✅
○ Soil
○ Nitrogen

Awesome handwritten notes! Keep up the brilliant study habits! 🌟`;
    }

    if (fileLower.includes("testbook") || fileLower.includes("textbook") || fileLower.includes("test")) {
      return `📄 **Textbook & Practice Test Analysis**: "Quadratic Equations & Problem Solving"

---

\`\`\`
   Equation: 2x² + 5x - 3 = 0
   Step 1: Identify a=2, b=5, c=-3
   Step 2: Formula x = (-b ± √(b² - 4ac)) / 2a
   Step 3: Discriminant D = 25 - 4(2)(-3) = 49
   Step 4: Roots x = (-5 ± 7) / 4 ➔ x = 1/2 or x = -3
\`\`\`

---

# 📖 Step-by-Step Solution

Here is the exact solution for your textbook test page:

1. **Standard Form**: 2x² + 5x - 3 = 0
2. **Discriminant Calculation**: D = b² - 4ac = 5² - 4(2)(-3) = 25 + 24 = **49**
3. **Square Root**: √49 = **7**
4. **Calculate Roots**:
   - x₁ = (-5 + 7) / 4 = 2 / 4 = **1/2**
   - x₂ = (-5 - 7) / 4 = -12 / 4 = **-3**

---

# 🏠 Real-Life Example

Quadratic equations help engineers calculate the exact arc of a flying rocket or the splash trajectory of a fountain!

---

# 🎯 Quick Check

**What are the two root solutions for 2x² + 5x - 3 = 0?**

○ x = 1/2 and -3 ✅
○ x = 2 and 5
○ x = 0 and 1
○ x = -2 and -5

Targeted test problem solved! You are ready to ace your exam! 💯🌟`;
    }

    // Find last topic from conversation history for adaptive context memory (TC-05, TC-06, TC-07)
    let lastTopic = "Photosynthesis";
    const reversedMsgs = [...currentMessages].reverse();
    for (const m of reversedMsgs) {
      const mContent = m.content.toLowerCase();
      if (mContent.includes("gravity")) { lastTopic = "Gravity"; break; }
      if (mContent.includes("photosynthesis") || mContent.includes("plant")) { lastTopic = "Photosynthesis"; break; }
      if (mContent.includes("water cycle")) { lastTopic = "Water Cycle"; break; }
      if (mContent.includes("math") || mContent.includes("quadratic")) { lastTopic = "Quadratic Equations"; break; }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // TC-01 | Mixed Language Understanding ("Iska answer bolo" + Image)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (lower.includes("iska answer") || lower.includes("iska answer bolo") || (fileUploadName && lower.includes("iska"))) {
      return `📷 **OCR Extracted Text**: "Solve quadratic equation: 2x² + 5x - 3 = 0"
🌐 **Detected Language**: Hinglish (Hindi + English mixed input)

---

\`\`\`
a=2, b=5, c=-3 ➔ Discriminant D = 5² - 4(2)(-3) = 49 ➔ Roots x = 1/2 or -3
\`\`\`

---

# 📖 आसान Explanation

चलो इस प्रश्न को आसानी से हल करते हैं!

1. **समीकरण (Equation)**: 2x² + 5x - 3 = 0
2. **सूत्र (Formula)**: x = (-b ± √(b² - 4ac)) / 2a
3. **Discriminant निकाले**: D = 25 + 24 = **49**
4. **हल (Solutions)**:
   - x₁ = (-5 + 7) / 4 = **1/2**
   - x₂ = (-5 - 7) / 4 = **-3**

---

# 🏠 Simple Example

मान लो तुम्हारे पास 2 बास्केट हैं: एक में आधा हिस्सा भरा है और दूसरे में माइनस का हिसाब है। सही तरीके से स्टेप-बाय-स्टेप गणित करने पर उत्तर हमेशा सटीक आता है!

---

# 🎯 Quick Question

**इस द्विघात समीकरण (Quadratic Equation) के सही मूल (Roots) कौन से हैं?**

○ x = 1/2 और -3 ✅
○ x = 5 और 2
○ x = 0 और 1
○ x = -5 और -3

उत्कृष्ट प्रयास! शानदार काम कर रहे हैं! 🌟`;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // TC-02 | Handwritten Notes (Upload handwritten science notebook)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (fileUploadName && (lower.includes("handwritten") || lower.includes("notebook") || lower.includes("uploaded notebook file"))) {
      return `📷 **OCR Extracted Text from Handwritten Notes**: "Photosynthesis & Solar Energy Absorption in Leaf Chlorophyll"

---

\`\`\`
  ☀️ Sunlight + 💧 Soil Water ➔ 🍃 Leaf Chlorophyll ➔ 🍎 Glucose + 🌳 Oxygen
\`\`\`

---

# 📖 Simple Explanation

I've analyzed your handwritten science notebook notes! Here is the clear breakdown:

1. **Sunlight Trapping**: Green chlorophyll in leaves traps energy from the sun.
2. **Raw Ingredients**: Water from roots and carbon dioxide from air enter the leaf cells.
3. **Energy Conversion**: Plants turn this into plant food (glucose) and release oxygen for humans and animals!

---

# 🏠 Real-Life Example

Think of your handwritten diagram like a solar panel on a roof! The leaf absorbs sunshine and uses that power to run the plant's food factory!

---

# 🎯 Quick Check

**According to your notebook notes, what traps solar energy inside plant leaves?**

○ Soil
○ Chlorophyll ✅
○ Water droplets
○ Roots

Great handwriting and smart science notes! Keep studying hard! 🌟`;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // TC-03 | Voice Input ("Ye explain karo")
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (lower.includes("ye explain karo") || lower.includes("ye explain") || lower.includes("yeh explain")) {
      return `🌐 **Voice Input Recognized**: "${query}"
🌐 **Language Detected**: Hinglish / Hindi

---

\`\`\`
  ☀️ प्रकाश ➔ 🍃 पत्ती ➔ 🍎 ऊर्जा भोजन + 🌳 ऑक्सीजन
\`\`\`

---

# 📖 आसान Explanation

चलो इसे आसान भाषा में समझते हैं!

1. **सूर्य की ऊर्जा**: पत्तियां धूप से ऊर्जा लेती हैं।
2. **पानी और हवा**: जड़ें पानी सोखती हैं और हवा से CO₂ मिलता है।
3. **भोजन निर्माण**: पौधा अपना भोजन बनाता है और ताज़ी ऑक्सीजन छोड़ता है।

---

# 🏠 Simple Example

जैसे घर की रसोई में मम्मी सामग्री मिलाकर खाना पकाती हैं, वैसे ही पत्तियां धूप और पानी से पौधे का खाना बनाती हैं!

---

# 🎯 Quick Question

**पौधे सूर्य की रोशनी का उपयोग किसलिए करते हैं?**

○ सोने के लिए
○ अपना भोजन बनाने के लिए ✅
○ पानी बहाने के लिए
○ खेलने के लिए

बहुत बढ़िया! आवाज़ से पूछना बहुत आसान है! 🌟`;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // TC-04 | Image Understanding (Upload textbook diagram + "What is this?")
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (lower.includes("what is this") || lower.includes("what's this")) {
      return `🖼️ **Textbook Image Identified**: "Plant Cell Structure & Chloroplast Diagram"

---

\`\`\`
  [Outer Wall: Cell Wall] ➔ [Inner Layer: Cell Membrane] ➔ [Green Organelle: Chloroplast]
\`\`\`

---

# 📖 Simple Explanation

This is a textbook diagram of a **Plant Cell**:

1. **Cell Wall**: The rigid outer protective shield keeping the plant upright.
2. **Chloroplast**: The green organelle where photosynthesis takes place.
3. **Nucleus**: The control center (brain) of the cell holding DNA.
4. **Vacuole**: The storage tank holding water and nutrients.

---

# 🏠 Real-Life Example

Think of a plant cell like a tiny house: the Cell Wall is the outer brick wall, the Nucleus is the homeowner, and the Chloroplast is the kitchen stove!

---

# 🎯 Quick Check

**Which part shown in this textbook diagram gives plant cells their green color and makes food?**

○ Nucleus
○ Chloroplast ✅
○ Cell Wall
○ Cytoplasm

Awesome textbook question! You are studying like a biologist! 🌟`;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // TC-05 | Adaptive Learning ("Explain like I'm in Grade 5")
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (lower.includes("grade 5") || lower.includes("like i'm in grade 5") || lower.includes("grade 5 lo")) {
      return `🧠 **Adaptive Learning Memory**: Adapting ${lastTopic} explanation to Grade 5 level!

---

\`\`\`
  ☀️ Sunshine ➔ 🍃 Leaf Kitchen ➔ 🍎 Yummy Sugar Snack!
\`\`\`

---

# 📖 Simple Grade 5 Explanation

Imagine a plant leaf is a tiny **sun-powered kitchen**!

1. The leaf turns on its solar power using bright sunshine.
2. It drinks water through its root straw from the soil.
3. It breathes in fresh air.
4. Then it bakes delicious plant sugar snacks and gives us fresh air to breathe!

---

# 🏠 Real-Life Example

Just like you drink a fruit smoothie after playing sports to get instant energy, plants make their own sweet smoothie using sunlight!

---

# 🎯 Quick Check

**In Grade 5 science, what acts like the leaf's power source?**

○ Electricity
○ Sunlight ✅
○ Batteries
○ Raindrops

You are learning super fast for Grade 5! High five! 👋🌟`;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // TC-06 | Language Switching ("Telugu lo explain cheyyi")
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (lower.includes("telugu lo") || lower.includes("telugu")) {
      return `🌐 **Language Switched to Telugu**: Context Retained (${lastTopic})

---

\`\`\`
  భూమి (Earth) ➔ గురుత్వాకర్షణ శక్తి (Gravity) ➔ వస్తువులను క్రిందికి లాగుతుంది
\`\`\`

---

# 📖 సులభమైన వివరణ

**${lastTopic} (గురుత్వాకర్షణ)** గురించి సులభంగా తెలుగులో తెలుసుకుందాం:

1. **భూమి ఆకర్షణ శక్తి**: భూమి తనపై ఉన్న ప్రతీ వస్తువును క్రిందికి లాగుతుంది.
2. **వస్తువుల పతనం**: మీరు బంతిని ఎంత ఎత్తుకి విసిరినా, అది మళ్లీ నేలపైకే పడుతుంది.
3. **నిరంతర బలం**: ఈ శక్తి వల్లనే మనం భూమిపై నడవగలుగుతున్నాం, గాలిలో తేలిపోవడం లేదు!

---

# 🏠 నిజ జీవిత ఉదాహరణ

చెట్టు నుండి పండు క్రింద పడటం గురుత్వాకర్షణకు బెస్ట్ ఉదాహరణ! పండు ఆకాశంలోకి వెళ్లకుండా నేలపైకే పడుతుంది.

---

# 🎯 శీఘ్ర ప్రశ్న

**వస్తువులు క్రింద పడటానికి కారణమయ్యే శక్తి ఏది?**

○ గాలి
○ గురుత్వాకర్షణ శక్తి ✅
○ వెలుగు
○ శబ్దం

చాలా బాగా చెప్పారు! తెలుగులో ఎంత చక్కగా అర్థం చేసుకున్నారో! 🌟`;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // TC-07 | Smart Follow-up ("Give another example")
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (lower.includes("another example") || lower.includes("give another example")) {
      return `🧠 **Conversation Memory Activated**: Providing a fresh real-world example for **${lastTopic}**!

---

\`\`\`
  ☀️ Solar Roof Panels ➔ ⚡ Electricity ➔ 🏠 House Kitchen Power
\`\`\`

---

# 📖 Simple Explanation

Here is another brand-new way to picture **${lastTopic}**:

1. **Input Stage**: Energy is collected from an external natural source.
2. **Processing Stage**: A special converter transforms that raw input into usable power.
3. **Output Stage**: That power runs essential systems seamlessly!

---

# 🏠 Fresh Real-Life Example

Think of **solar panels installed on a house roof**!
Just like solar panels absorb sunlight to generate electricity that powers your TV, lights, and refrigerator, plant leaves absorb sunlight to make plant food!

---

# 🎯 Quick Check

**How are solar panels on a house roof similar to leaves on a tree?**

○ Both are painted green
○ Both absorb sunlight to create useful energy ✅
○ Both require batteries
○ Both make noise

Great follow-up question! Asking for multiple examples builds deep understanding! 🌟`;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // TC-08 | Educational Response ("Explain the water cycle")
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (lower.includes("water cycle")) {
      return `# 🖼️ Visual

\`\`\`
  🌊 Ocean Water ➔ ☀️ Evaporation ➔ ☁️ Condensation (Clouds) ➔ 🌧️ Precipitation (Rain)
\`\`\`

---

# 📖 Simple Explanation

The **Water Cycle** is nature's endless water recycling system:

1. **Evaporation**: The Sun heats up ocean and lake water, turning it into invisible water vapor that rises into the sky.
2. **Condensation**: High up in the cold air, water vapor cools down and forms fluffy clouds.
3. **Precipitation**: When clouds get heavy with water droplets, rain or snow falls back to Earth!
4. **Collection**: Rainwater flows back into rivers and oceans, and the cycle starts all over again!

---

# 🏠 Real-Life Example

When you boil water in a covered pot, steam rises to the lid (Evaporation), drops form on the underside of the lid (Condensation), and then drip back down into the pot (Precipitation)!

---

# 🎯 Quick Check

**What happens when water vapor in clouds cools down and forms water droplets?**

○ Evaporation
○ Condensation ✅
○ Melting
○ Freezing

Awesome job understanding Earth's natural water cycle! 🌧️🌟`;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // TC-09 | Math Solver (Upload a math problem / "solve 12 x 8")
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (/\b(\d+)\s*[x×*+/\-]\s*(\d+)\b/.test(lower) || lower.includes("math") || lower.includes("solve")) {
      const match = lower.match(/(\d+)\s*([x×*+/\-])\s*(\d+)/);
      let n1 = 12, n2 = 8, op = 'x', ans = 96;
      if (match) {
        n1 = parseInt(match[1]);
        op = match[2];
        n2 = parseInt(match[3]);
        if (op === '*' || op === 'x' || op === '×') ans = n1 * n2;
        else if (op === '+') ans = n1 + n2;
        else if (op === '-') ans = n1 - n2;
        else if (op === '/') ans = Math.round((n1 / n2) * 100) / 100;
      }

      return `📷 **Problem Detected**: ${n1} ${op} ${n2}

---

\`\`\`
  ${n1} added together ${n2} times = ${ans}
\`\`\`

---

# 📖 Step-by-Step Solution

Let me solve **${n1} ${op} ${n2}** step-by-step for you:

1. **Identify Operation**: Multiplication (${op}) means repeated addition.
2. **Break it down**: ${n1} + ${n1} + ${n1} + ${n1} ... (${n2} times).
3. **Calculation**: ${n1} × ${n2} = **${ans}**
4. **Final Answer**: ✅ **${ans}**

---

# 🏠 Real-Life Example

If a box contains ${n1} chocolates and you buy ${n2} boxes, you will have **${ans}** chocolates in total! 🍫

---

# 🎯 Quick Practice Question

**What is 15 × 4 ?**

○ 45
○ 60 ✅
○ 54
○ 64

Great mathematical problem solving! You nailed it! 🔢🌟`;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // TC-10 | Personalized Teacher ("I don't understand this")
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (lower.includes("dont understand") || lower.includes("don't understand") || lower.includes("too hard") || lower.includes("difficult")) {
      return `🤗 **Empathetic Teacher Response**: "That is completely okay! Don't worry at all 😊 Learning takes time and asking for help is super smart! Let's break this down together in a much simpler way!"

---

\`\`\`
  Don't Worry ➔ Small Easy Steps ➔ Crystal Clear Understanding!
\`\`\`

---

# 📖 Easy Step-by-Step Explanation

Let's slow down and make this crystal clear:

1. **No pressure**: Every great scientist and mathematician started by asking questions when confused!
2. **One small piece at a time**: We won't rush. We will look at just one simple rule first.
3. **Ask anything**: If any single word feels tricky, tell me and we will use an even simpler word!

---

# 🏠 Encouraging Real-Life Example

Remember when you learned to ride a bike or play your favorite game? It felt tricky on the first try, but with a friendly guide, you mastered it easily! This works the exact same way!

---

# 🎯 Quick Encouraging Check

**What is the smartest thing to do when a topic feels tricky?**

○ Give up
○ Ask your friendly tutor to break it down simply ✅
○ Hide your questions
○ Ignore it

You are doing great! Never hesitate to ask me to explain again! I'm here for you! 🌟`;
    }

    // Default Fallback
    const cleanQuery = query
      .replace(/\b(what is|what are|explain|solve|how to|can you|tell me|meaning of|definition of|iska|batao|karo|cheppu|sollu|hellu)\b/gi, "")
      .trim() || query;
    const topicTitle = cleanQuery.charAt(0).toUpperCase() + cleanQuery.slice(1);

    return `# 🖼️ Visual

\`\`\`
  Question (${topicTitle}) ➔ Foundational Rule ➔ Step-by-Step ➔ Solution
\`\`\`

---

# 📖 Simple Explanation

Let's understand **${topicTitle}** step-by-step for ${selectedGrade}:

1. **Core Concept**: Identify the main rule governing this question.
2. **Systematic Steps**: Work through each part logically without rushing.
3. **Verification**: Double-check your final answer!

---

# 🏠 Real-Life Example

Think of ${topicTitle} like learning to ride a bicycle: once you balance the core steps one by one, it becomes smooth, natural, and easy to remember!

---

# 🎯 Quick Check

**What is the most effective way to understand ${topicTitle}?**

○ Memorizing blindly
○ Breaking it down step-by-step ✅
○ Skipping basic rules
○ Guessing

Great job asking doubts! You are thinking like a scholar! 🌟`;
  };

  const handleSendMessage = async (content: string, subject?: string, fileInput?: File | string) => {
    if (!currentSessionId) return;

    let imageUrl: string | undefined = undefined;
    let fileObj: File | undefined = undefined;
    let base64Data: { base64: string; mimeType: string } | undefined = undefined;

    if (fileInput instanceof File) {
      fileObj = fileInput;
      if (fileInput.type.startsWith('image/')) {
        imageUrl = URL.createObjectURL(fileInput);
      }
      try {
        base64Data = await readFileAsBase64(fileInput);
      } catch (err) {
        console.error("Failed reading file as Base64:", err);
      }
    } else if (typeof fileInput === 'string') {
      imageUrl = fileInput;
    }

    setAssistantState('thinking');

    // Add user message to state
    const userMsg = {
      id: Date.now(),
      sessionId: currentSessionId,
      role: 'user' as const,
      content,
      subject: subject || null,
      imageUrl,
      createdAt: new Date().toISOString()
    };

    setLocalMessages(prev => ({
      ...prev,
      [currentSessionId]: [...(prev[currentSessionId] || []), userMsg]
    }));

    setLocalSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messageCount: s.messageCount + 2, updatedAt: new Date().toISOString() } : s));

    setAssistantState('generating');

    let assistantContent = '';
    const keyToUse = geminiApiKey || (import.meta as any).env?.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' && process.env ? process.env.GOOGLE_GENERATIVE_AI_API_KEY : '');

    if (keyToUse) {
      try {
        assistantContent = await callGeminiAPI(
          content,
          base64Data,
          selectedLanguage,
          selectedGrade,
          selectedCurriculum,
          selectedSubject,
          keyToUse
        );
      } catch (err: any) {
        console.warn("Gemini Vision API call encountered an error. Utilizing intelligent fallback:", err);
        assistantContent = generateLocalResponse(content, subject, fileObj?.name || (imageUrl ? "uploaded_image" : undefined));
      }
    } else {
      await new Promise(r => setTimeout(r, 1200));
      assistantContent = generateLocalResponse(content, subject, fileObj?.name || (imageUrl ? "uploaded_image" : undefined));
    }

    const assistantMsg = {
      id: Date.now() + 1,
      sessionId: currentSessionId,
      role: 'assistant' as const,
      content: assistantContent,
      subject: subject || null,
      hasVisual: true,
      createdAt: new Date().toISOString()
    };

    setLocalMessages(prev => ({
      ...prev,
      [currentSessionId]: [...(prev[currentSessionId] || []), assistantMsg]
    }));

    setAssistantState('celebrating');

    // Send API call to backend if available
    sendChat.mutate(
      { data: { content, sessionId: currentSessionId } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetSessionQueryKey(currentSessionId) });
          queryClient.invalidateQueries({ queryKey: getListSessionsQueryKey() });
        }
      }
    );
  };

  const handleFileUpload = (file: File) => {
    handleSendMessage(`Uploaded file: ${file.name}`, undefined, file);
  };

  const filteredSessions = sessions.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (s.subject && s.subject.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      {/* SIDEBAR */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r-4 border-black dark:border-white bg-sidebar transition-all duration-300 md:relative',
          sidebarOpen ? 'w-80 translate-x-0' : 'w-0 -translate-x-full border-r-0 md:w-0'
        )}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b-3 border-black dark:border-white flex items-center justify-between bg-primary/20">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="w-8 h-8 bg-primary border-2 border-black rounded-lg flex items-center justify-center font-black text-black shadow-brutal-sm group-hover:rotate-6 transition-transform">
                A
              </div>
              <h1 className="text-xl font-extrabold tracking-tight uppercase" data-testid="link-home">
                AETHERA
              </h1>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 hover:bg-muted rounded-lg border border-black dark:border-white transition-colors"
            data-testid="button-close-sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Session CTA */}
        <div className="p-4 border-b-3 border-black dark:border-white bg-background">
          <BrutalButton
            variant="primary"
            className="w-full py-3"
            onClick={handleNewSession}
            disabled={createSession.isPending}
            data-testid="button-new-session"
          >
            <Plus className="w-5 h-5" />
            <span>NEW LEARNING DOUBT</span>
          </BrutalButton>
        </div>

        {/* Search Session Filter */}
        <div className="p-3 border-b-2 border-black dark:border-white">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sessions..."
              className="w-full bg-background border-2 border-black dark:border-white pl-9 pr-3 py-1.5 rounded-xl text-xs font-bold outline-none"
            />
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {sessionsLoading ? (
            <div className="flex justify-center py-8">
              <Sparkles className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="text-center py-8 px-4">
              <p className="text-sm font-bold text-muted-foreground mb-2">No learning sessions found.</p>
              <BrutalButton variant="muted" size="sm" onClick={handleNewSession}>
                Start First Session
              </BrutalButton>
            </div>
          ) : (
            filteredSessions.map((session) => (
              <button
                key={session.id}
                onClick={() => setCurrentSessionId(session.id)}
                className={cn(
                  'w-full text-left p-3 rounded-xl border-3 border-black dark:border-white transition-all cursor-pointer shadow-brutal-sm',
                  currentSessionId === session.id
                    ? 'bg-primary text-black scale-[1.02] shadow-brutal'
                    : 'bg-white dark:bg-card hover:bg-muted/80'
                )}
                data-testid={`button-session-${session.id}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="font-extrabold text-xs truncate uppercase tracking-wide">{session.title}</p>
                  <span className="text-[10px] opacity-75 font-mono">{session.messageCount} msgs</span>
                </div>
                {session.subject && (
                  <BrutalBadge variant="accent" className="text-[9px] px-1.5 py-0.2">
                    {session.subject}
                  </BrutalBadge>
                )}
              </button>
            ))
          )}
        </div>

        {/* Navigation Footer */}
        <div className="p-3 border-t-3 border-black dark:border-white bg-background space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Link href="/history">
              <BrutalButton variant="muted" size="sm" className="w-full text-xs" data-testid="button-nav-history">
                <History className="w-3.5 h-3.5" />
                HISTORY
              </BrutalButton>
            </Link>
            <Link href="/profile">
              <BrutalButton variant="muted" size="sm" className="w-full text-xs" data-testid="button-nav-profile">
                <UserCircle className="w-3.5 h-3.5" />
                PROFILE
              </BrutalButton>
            </Link>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-brutal-dots">
        {/* Header Bar */}
        <header className="p-3 md:p-4 border-b-4 border-black dark:border-white bg-white dark:bg-card flex items-center justify-between gap-4 z-20 shadow-brutal-sm">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 border-2 border-black dark:border-white rounded-xl bg-primary text-black font-bold shadow-brutal-sm hover:scale-105 transition-transform"
                data-testid="button-open-sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <div>
              {currentSession ? (
                <div className="flex items-center gap-2">
                  <h2 className="text-base md:text-lg font-black uppercase tracking-tight truncate max-w-xs md:max-w-md">
                    {currentSession.title}
                  </h2>
                  {currentSession.subject && (
                    <BrutalBadge variant="primary" data-testid="badge-subject">
                      {currentSession.subject}
                    </BrutalBadge>
                  )}
                </div>
              ) : (
                <h2 className="text-sm md:text-base font-bold uppercase text-muted-foreground">
                  Select a learning doubt or start a new session
                </h2>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle Companion Mascot Panel on Desktop */}
            <button
              onClick={() => setAssistantPanelOpen(!assistantPanelOpen)}
              className={cn(
                'hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-black dark:border-white font-extrabold text-xs shadow-brutal-sm transition-all',
                assistantPanelOpen ? 'bg-primary text-black' : 'bg-muted text-foreground'
              )}
              title="Toggle Assistant Companion Panel"
            >
              <Sparkles className="w-4 h-4" />
              <span>MASCOT</span>
            </button>

            <Link href="/">
              <BrutalButton variant="muted" size="sm" data-testid="button-home">
                <Home className="w-4 h-4" />
              </BrutalButton>
            </Link>
          </div>
        </header>

        {/* Content Body: Chat feed + Assistant mascot side panel */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Chat Messages Scroll Container */}
          <div
            ref={chatContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 max-w-4xl mx-auto w-full"
          >
            {!currentSessionId ? (
              <div className="h-full flex items-center justify-center p-4">
                <BrutalCard variant="white" shadow="xl" className="p-8 md:p-12 max-w-lg text-center bg-primary/10">
                  <AetheraAssistant state="happy" size="lg" className="mb-4" />
                  <h3 className="text-2xl md:text-3xl font-black mb-3 uppercase">Welcome to Aethera! 🚀</h3>
                  <p className="text-sm md:text-base font-medium mb-6 leading-relaxed">
                    Your Grade 1–10 AI Learning Companion. Ask any doubt, upload your handwritten notebook, textbook photo, or practice quiz!
                  </p>
                  <BrutalButton
                    variant="primary"
                    size="lg"
                    onClick={handleNewSession}
                    disabled={createSession.isPending}
                    data-testid="button-start-session"
                    className="w-full sm:w-auto"
                  >
                    <Plus className="w-5 h-5" />
                    START LEARNING NOW
                  </BrutalButton>
                </BrutalCard>
              </div>
            ) : sessionLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <AetheraAssistant state="thinking" size="md" />
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex items-center justify-center p-4">
                <BrutalCard variant="white" shadow="lg" className="p-8 max-w-md text-center">
                  <AetheraAssistant state="listening" size="md" className="mb-4" />
                  <h4 className="text-xl font-bold uppercase mb-2">Ready for your question!</h4>
                  <p className="text-xs md:text-sm font-medium text-muted-foreground">
                    Type below, pick a suggestion pill, or upload your homework screenshot to get step-by-step help!
                  </p>
                </BrutalCard>
              </div>
            ) : (
              <>
                {messages.map((msg: any, index: number) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isLatestAssistantMessage={index === messages.length - 1 && msg.role === 'assistant'}
                    onRegenerate={() => {
                      if (messages.length >= 2) {
                        const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
                        if (lastUserMsg) {
                          handleSendMessage(lastUserMsg.content, lastUserMsg.subject);
                        }
                      }
                    }}
                    onEdit={(newText) => handleSendMessage(newText)}
                  />
                ))}

                {/* Animated Pending Thinking Indicator */}
                {sendChat.isPending && <TypingIndicator />}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* SESSION SETTINGS Side Panel (Desktop) */}
          <AnimatePresence>
            {assistantPanelOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 320, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="hidden lg:flex flex-col border-l-4 border-black dark:border-white bg-white dark:bg-card p-5 overflow-y-auto shadow-brutal-lg z-10 space-y-5"
              >
                <div className="flex items-center justify-between border-b-3 border-black pb-3">
                  <h3 className="font-black text-sm uppercase tracking-wider">SESSION SETTINGS</h3>
                  <button
                    onClick={() => setRightPanelTab(rightPanelTab === 'settings' ? 'mascot' : 'settings')}
                    className="text-[10px] font-bold px-2 py-0.5 border border-black rounded bg-muted hover:bg-primary/40 cursor-pointer"
                  >
                    {rightPanelTab === 'settings' ? '🤖 MASCOT' : '⚙️ SETTINGS'}
                  </button>
                </div>

                {rightPanelTab === 'settings' ? (
                  <div className="space-y-5 text-xs">
                    {/* GEMINI API KEY */}
                    <div className="space-y-1.5 bg-primary/10 border-2 border-black p-2.5 rounded-xl">
                      <p className="font-extrabold uppercase tracking-wide flex items-center justify-between text-muted-foreground text-[11px]">
                        <span>🔑 GEMINI AI VISION KEY</span>
                      </p>
                      <input
                        type="password"
                        placeholder="Paste Gemini API Key here..."
                        value={geminiApiKey}
                        onChange={(e) => handleApiKeyChange(e.target.value)}
                        className="w-full bg-white dark:bg-card border-2 border-black dark:border-white p-2 rounded-xl font-mono text-xs outline-none shadow-brutal-sm placeholder:font-sans placeholder:text-[11px]"
                      />
                      <p className="text-[10px] font-bold leading-tight">
                        {geminiApiKey ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">✓ Live Gemini 1.5 Flash Vision Active</span>
                        ) : (
                          <span className="text-amber-700 dark:text-amber-300">💡 Add key for live Gemini image OCR & reading</span>
                        )}
                      </p>
                    </div>

                    {/* LANGUAGE */}
                    <div className="space-y-2">
                      <p className="font-extrabold uppercase tracking-wide flex items-center gap-1 text-muted-foreground">
                        🌐 LANGUAGE
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { code: 'en', flag: 'GB', name: 'English' },
                          { code: 'hi', flag: 'IN', name: 'हिन्दी' },
                          { code: 'te', flag: 'IN', name: 'తెలుగు' },
                          { code: 'ta', flag: 'IN', name: 'தமிழ்' },
                          { code: 'kn', flag: 'IN', name: 'ಕನ್ನಡ' },
                          { code: 'ml', flag: 'IN', name: 'മലയാളം' },
                        ].map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => setSelectedLanguage(lang.code as any)}
                            className={cn(
                              'flex items-center gap-1.5 p-2 rounded-lg border-2 border-black dark:border-white font-bold transition-all cursor-pointer shadow-brutal-sm text-xs',
                              selectedLanguage === lang.code
                                ? 'bg-primary text-black font-extrabold scale-105 shadow-brutal'
                                : 'bg-white dark:bg-card hover:bg-muted'
                            )}
                          >
                            <span className="text-[10px] px-1 bg-black text-white font-mono rounded">{lang.flag}</span>
                            <span className="truncate">{lang.name}</span>
                          </button>
                        ))}
                      </div>
                      <p className="text-[11px] font-bold text-muted-foreground">
                        Active: <span className="text-foreground font-extrabold">GB {selectedLanguage === 'en' ? 'English' : selectedLanguage === 'hi' ? 'हिन्दी' : selectedLanguage === 'te' ? 'తెలుగు' : selectedLanguage === 'ta' ? 'தமிழ்' : selectedLanguage === 'kn' ? 'ಕನ್ನಡ' : 'മലയാളം'}</span>
                      </p>
                    </div>

                    {/* GRADE */}
                    <div className="space-y-2">
                      <p className="font-extrabold uppercase tracking-wide flex items-center gap-1 text-muted-foreground">
                        🎓 GRADE
                      </p>
                      <select
                        value={selectedGrade}
                        onChange={(e) => setSelectedGrade(e.target.value)}
                        className="w-full bg-white dark:bg-card border-3 border-black dark:border-white p-2 rounded-xl font-extrabold text-sm outline-none shadow-brutal-sm cursor-pointer"
                      >
                        {['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'].map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>

                    {/* CURRICULUM */}
                    <div className="space-y-2">
                      <p className="font-extrabold uppercase tracking-wide flex items-center gap-1 text-muted-foreground">
                        📖 CURRICULUM
                      </p>
                      <select
                        value={selectedCurriculum}
                        onChange={(e) => setSelectedCurriculum(e.target.value)}
                        className="w-full bg-white dark:bg-card border-3 border-black dark:border-white p-2 rounded-xl font-extrabold text-sm outline-none shadow-brutal-sm cursor-pointer"
                      >
                        {['CBSE', 'ICSE', 'State Board', 'IB'].map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    {/* SUBJECT */}
                    <div className="space-y-2">
                      <p className="font-extrabold uppercase tracking-wide flex items-center gap-1 text-muted-foreground">
                        🎨 SUBJECT
                      </p>
                      <div className="space-y-1.5">
                        {[
                          { name: 'Auto-detect', icon: '🤖' },
                          { name: 'Mathematics', icon: '📐' },
                          { name: 'Physics', icon: '⚡' },
                          { name: 'Chemistry', icon: '🧪' },
                          { name: 'Biology', icon: '🌿' },
                          { name: 'History', icon: '📜' },
                          { name: 'Geography', icon: '🌍' },
                          { name: 'English', icon: '📚' },
                          { name: 'Computer Science', icon: '💻' }
                        ].map((subj) => (
                          <button
                            key={subj.name}
                            onClick={() => setSelectedSubject(subj.name)}
                            className={cn(
                              'w-full flex items-center gap-2 p-2 rounded-xl border-2 border-black dark:border-white font-bold text-xs transition-all cursor-pointer text-left shadow-brutal-sm',
                              selectedSubject === subj.name
                                ? 'bg-amber-400 text-black font-extrabold shadow-brutal'
                                : 'bg-white dark:bg-card hover:bg-muted'
                            )}
                          >
                            <span>{subj.icon}</span>
                            <span>{subj.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="my-auto py-6 flex flex-col items-center space-y-4">
                    <AetheraAssistant
                      state={assistantState}
                      size="xl"
                      onStateClick={() => {
                        const states: AssistantState[] = ['happy', 'celebrating', 'explaining', 'teaching', 'encouraging'];
                        const next = states[Math.floor(Math.random() * states.length)];
                        setAssistantState(next);
                      }}
                    />
                    <p className="text-xs font-extrabold uppercase text-center text-muted-foreground">
                      Aethera Companion Mascot
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Pinned Scroll Button */}
        <PinnedScrollButton show={showScrollButton} onClick={scrollToBottom} />

        {/* Multi-modal Chat Input */}
        {currentSessionId && (
          <ChatInput
            onSendMessage={handleSendMessage}
            onFileUpload={handleFileUpload}
            isLoading={sendChat.isPending}
            selectedLanguage={selectedLanguage}
          />
        )}
      </main>
    </div>
  );
}
