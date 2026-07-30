
# Aethera – Product Requirements Document (PRD)

> **Tagline:** Every doubt deserves clarity.

## 1. Product Vision

Aethera is a **simple, AI-powered learning companion** built for school students. It helps students learn by accepting **text, voice, notebook photos, textbook pages and question images**, understanding what they actually mean—even when the input is incomplete or contains mistakes—and responding with **clear explanations, educational visuals and practice questions**.

The experience is intentionally designed around **one primary interface** instead of multiple feature-specific screens. Students interact with a single AI workspace where every capability is embedded naturally into the conversation.

---

# 2. Problem

Students often:
- Don't know how to ask questions correctly.
- Mix English with their native language.
- Upload handwritten notes instead of typing.
- Learn better through visuals than long paragraphs.
- Have limited internet access.
- Need explanations matched to their level.

Existing AI tools assume students ask perfect questions. Aethera is designed for **real student behaviour**.

---

# 3. Goals

- Extremely simple and intuitive.
- Accessible on Web (PWA) and low-bandwidth channels.
- Understand imperfect inputs.
- Explain through text + visuals.
- Curriculum-aligned (Grades 6–10 initially).
- Multilingual.
- Personalized within one conversation.

---

# 4. User Persona

## Primary Persona

**Name:** Aarav (Representative Student)

- Age: 14
- Grade: 8
- Uses a low-cost Android phone.
- Sometimes studies from printed textbooks and handwritten notes.
- Switches between English and his regional language.
- Often asks incomplete or misspelled questions.
- Understands concepts better with diagrams than text.
- May have inconsistent internet connectivity.

### Needs

- Fast answers.
- Easy explanations.
- Visual learning.
- Voice interaction.
- Ability to upload notebook pages instead of typing.

---

# 5. Core Experience

Everything happens inside one AI workspace.

Students can:

- Type
- Speak
- Upload notebook images
- Upload textbook pages
- Upload homework
- Upload question papers

No separate tools or workflows are required.

---

# 6. Product Flow

Student Input

↓

Language Detection

↓

OCR / Speech Recognition

↓

Question Reconstruction

↓

Curriculum Understanding

↓

Personalized Explanation

↓

Educational Visual Generation

↓

Quiz & Summary

↓

Learning Memory

---

# 7. Core Features

## 7.1 Intelligent Question Reconstruction

Aethera automatically:

- fixes spelling mistakes
- fixes grammar
- understands abbreviations
- reconstructs incomplete questions
- understands mixed-language inputs

Example

Input

> wat is photo synthsis

Internal understanding

> What is photosynthesis?

The student never needs perfect English.

---

## 7.2 Multimodal Input

Supports

- Text
- Voice
- Notebook photos
- Textbook pages
- Homework images
- Printed question papers
- Diagrams

---

## 7.3 OCR & Academic Vision

Recognizes

- Handwriting
- Printed text
- Equations
- Tables
- Graphs
- Diagrams
- Geometry figures

Automatically identifies

- Subject
- Chapter
- Topic
- Question

---

## 7.4 Curriculum Knowledge Engine

Built around a structured school curriculum instead of generic internet search.

Initial scope

Grades 6–10

Subjects

- Mathematics
- Science
- English
- Social Science
- Computer Science

Designed for future expansion.

---

## 7.5 Multilingual Learning

Students can ask questions in

- English
- Hindi
- Telugu
- Tamil
- Kannada
- Malayalam
- Mixed languages

Responses can be

- English
- Native language
- Bilingual

---

## 7.6 Visual Learning Engine

Every answer includes

- Simple explanation
- AI-generated educational illustration
- Labelled diagram (when useful)
- Real-life analogy
- Key points
- Mini quiz
- Quick summary

The generated visuals are educational, clean and textbook-style rather than decorative.

---

## 7.7 Adaptive Teaching

Aethera automatically changes explanation style based on the student's behaviour.

Possible styles

- Visual
- Story
- Step-by-step
- Exam-focused

No manual switching required.

---

## 7.8 Learning Memory

Remembers

- Previously asked questions
- Weak concepts
- Progress

Future explanations become more personalized.

---

## 7.9 Accessibility

Designed to work with

- Progressive Web App
- Low bandwidth
- Offline caching where possible
- Voice-first interaction
- Simple UI with minimal navigation

---

# 8. Interface Principles

- One primary screen.
- Chat-first interface.
- Upload, microphone and text input always available.
- Generated visuals appear inline with explanations.
- No feature-specific pages.
- Minimal taps.
- Child-friendly design.

---

# 9. Success Metrics

- Student understands concept without re-asking.
- Higher quiz accuracy.
- Reduced clarification requests.
- Faster doubt resolution.
- Consistent learning usage.

---

# 10. Differentiators

- Understands imperfect student inputs.
- Reads notebooks and textbooks.
- Generates educational visuals automatically.
- Explains in multiple languages.
- Curriculum-focused.
- Works with a single simple interface.
- Accessible for students with limited connectivity.
