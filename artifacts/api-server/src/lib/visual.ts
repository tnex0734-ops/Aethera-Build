/**
 * Aethera Educational Visual Generator
 *
 * Generates Mermaid diagram syntax (or structured text alternatives)
 * automatically based on subject and question type.
 *
 * PRD Requirement: Every answer includes an educational visualization.
 * Automatically chooses the most appropriate diagram type.
 */

import type { Subject, SubjectAnalysis } from "./subject.js";

export interface VisualResult {
  type: string;           // e.g. "Flowchart", "Timeline", "Concept Diagram"
  mermaidCode: string;    // Valid Mermaid diagram syntax (may be empty if skipped)
  description: string;   // Text fallback / alt text
  shouldShow: boolean;   // false = skip the visual for this question
}

/**
 * Generate an appropriate educational visual based on the subject
 * and question analysis. Returns Mermaid diagram code when applicable.
 */
export function generateVisualSpec(analysis: SubjectAnalysis, question: string): VisualResult {
  const { subject, questionType } = analysis;
  const lower = question.toLowerCase();

  // --- Biology / Life Processes → Flowchart ---
  if (subject === "Biology") {
    if (lower.includes("photosynthesis")) {
      return {
        type: "Flowchart",
        shouldShow: true,
        description: "Photosynthesis process flowchart",
        mermaidCode: `flowchart LR
    A["☀️ Sunlight"] --> B["Chlorophyll\n(in leaves)"]
    C["💧 Water\n(from roots)"] --> B
    D["🌬️ CO₂\n(from air)"] --> B
    B --> E["Glucose\n(Sugar)"]
    B --> F["🌿 Oxygen\n(released)"]
    style A fill:#FFD166,stroke:#000
    style E fill:#06D6A0,stroke:#000
    style F fill:#118AB2,stroke:#fff,color:#fff`,
      };
    }
    if (lower.includes("mitosis") || lower.includes("cell division")) {
      return {
        type: "Flowchart",
        shouldShow: true,
        description: "Cell division (Mitosis) stages flowchart",
        mermaidCode: `flowchart LR
    A["Parent Cell\n(2n)"] --> B["Prophase\n(chromatin condenses)"]
    B --> C["Metaphase\n(chromosomes align)"]
    C --> D["Anaphase\n(chromosomes separate)"]
    D --> E["Telophase\n(2 nuclei form)"]
    E --> F["2 Daughter Cells\n(2n each)"]
    style A fill:#FFD166,stroke:#000
    style F fill:#06D6A0,stroke:#000`,
      };
    }
    return buildDefaultFlowchart(subject, question);
  }

  // --- History → Timeline ---
  if (subject === "History") {
    if (lower.includes("independence") || lower.includes("freedom") || lower.includes("gandhi")) {
      return {
        type: "Timeline",
        shouldShow: true,
        description: "India Independence Movement timeline",
        mermaidCode: `timeline
    title India's Road to Independence
    1857 : First War of Independence
         : Sepoy Mutiny begins
    1885 : Indian National Congress
         : Founded in Bombay
    1919 : Jallianwala Bagh
         : Massacre by British
    1942 : Quit India Movement
         : Gandhi's final push
    1947 : Independence!
         : August 15 — Jawaharlal Nehru PM`,
      };
    }
    return {
      type: "Timeline",
      shouldShow: true,
      description: "Historical timeline",
      mermaidCode: `timeline
    title Key Events
    Event 1 : First major development
    Event 2 : Turning point occurs
    Event 3 : Result or outcome`,
    };
  }

  // --- Mathematics: Geometry / Algebra → Concept Diagram ---
  if (subject === "Mathematics") {
    if (lower.includes("quadratic") || lower.includes("formula") || lower.includes("equation")) {
      return {
        type: "Formula Breakdown",
        shouldShow: true,
        description: "Quadratic equation formula breakdown",
        mermaidCode: `flowchart TD
    A["Quadratic Equation\nax² + bx + c = 0"] --> B["Discriminant\nD = b² - 4ac"]
    B --> C{"D > 0?"}
    C -->|Yes| D["Two Real Roots\nx = (-b ± √D) / 2a"]
    C -->|No, D = 0| E["One Real Root\nx = -b / 2a"]
    C -->|No, D < 0| F["No Real Roots\n(Complex roots)"]
    style A fill:#FFD166,stroke:#000
    style D fill:#06D6A0,stroke:#000
    style F fill:#FF70A6,stroke:#000`,
      };
    }
    if (lower.includes("pythagoras") || lower.includes("triangle") || lower.includes("right angle")) {
      return {
        type: "Geometry Diagram",
        shouldShow: true,
        description: "Pythagorean theorem right triangle",
        mermaidCode: `flowchart LR
    A["Right Triangle"] --> B["Side a (Perpendicular)"]
    A --> C["Side b (Base)"]
    A --> D["Hypotenuse c\n(longest side)"]
    D --> E["Theorem:\na² + b² = c²"]
    style E fill:#FFD166,stroke:#000,font-weight:bold`,
      };
    }
    return buildDefaultFlowchart(subject, question);
  }

  // --- Physics → Force / Energy Diagram ---
  if (subject === "Physics") {
    if (lower.includes("newton") || lower.includes("force") || lower.includes("motion")) {
      return {
        type: "Concept Map",
        shouldShow: true,
        description: "Newton's Laws of Motion concept map",
        mermaidCode: `flowchart TD
    A["🔬 Newton's Laws"] --> B["1st Law\n(Inertia)\nObject stays at rest\nor in motion"]
    A --> C["2nd Law\n(F = ma)\nForce = Mass × Acceleration"]
    A --> D["3rd Law\n(Action-Reaction)\nEvery action has\nan equal & opposite reaction"]
    style A fill:#118AB2,stroke:#000,color:#fff
    style B fill:#FFD166,stroke:#000
    style C fill:#06D6A0,stroke:#000
    style D fill:#FF70A6,stroke:#000`,
      };
    }
    return buildDefaultFlowchart(subject, question);
  }

  // --- Chemistry → Reaction Flowchart ---
  if (subject === "Chemistry") {
    if (lower.includes("acid") && (lower.includes("base") || lower.includes("neutralization"))) {
      return {
        type: "Reaction Diagram",
        shouldShow: true,
        description: "Acid-Base neutralization reaction",
        mermaidCode: `flowchart LR
    A["🧪 Acid\n(H⁺ ions)"] --> C["Neutralization\nReaction"]
    B["⚗️ Base\n(OH⁻ ions)"] --> C
    C --> D["Salt + Water\n(neutral product)"]
    C --> E["pH = 7\n(neutral)"]
    style A fill:#FF70A6,stroke:#000
    style B fill:#118AB2,stroke:#000,color:#fff
    style D fill:#06D6A0,stroke:#000`,
      };
    }
    return buildDefaultFlowchart(subject, question);
  }

  // --- Computer Science → Algorithm / Decision Tree ---
  if (subject === "Computer Science") {
    if (lower.includes("loop") || lower.includes("for loop") || lower.includes("while")) {
      return {
        type: "Algorithm Flowchart",
        shouldShow: true,
        description: "Loop execution flowchart",
        mermaidCode: `flowchart TD
    A["Start"] --> B["Initialize\ni = 0"]
    B --> C{"Condition\ni < n ?"}
    C -->|Yes| D["Execute\nloop body"]
    D --> E["Increment\ni = i + 1"]
    E --> C
    C -->|No| F["Exit Loop"]
    F --> G["Continue program"]
    style A fill:#FFD166,stroke:#000
    style F fill:#06D6A0,stroke:#000`,
      };
    }
    return buildDefaultFlowchart(subject, question);
  }

  // --- Geography → Comparison Table (rendered as Mermaid mindmap) ---
  if (subject === "Geography") {
    return {
      type: "Mind Map",
      shouldShow: true,
      description: "Geography concept mind map",
      mermaidCode: `mindmap
  root((Geography))
    Landforms
      Mountains
      Plateaus
      Plains
      Valleys
    Water Bodies
      Oceans
      Rivers
      Lakes
      Seas
    Climate
      Tropical
      Temperate
      Polar`,
    };
  }

  // --- English → Mind Map ---
  if (subject === "English") {
    return {
      type: "Mind Map",
      shouldShow: true,
      description: "English language mind map",
      mermaidCode: `mindmap
  root((English))
    Grammar
      Nouns
      Verbs
      Adjectives
      Adverbs
    Writing
      Essays
      Stories
      Poems
    Reading
      Comprehension
      Vocabulary
      Inference`,
    };
  }

  // --- Definition questions — skip visual for simple one-liners ---
  if (questionType === "definition" && analysis.gradeNumber <= 4) {
    return {
      type: "None",
      shouldShow: false,
      description: "",
      mermaidCode: "",
    };
  }

  // Default fallback
  return buildDefaultFlowchart(subject, question);
}

function buildDefaultFlowchart(subject: Subject, question: string): VisualResult {
  return {
    type: "Concept Flowchart",
    shouldShow: true,
    description: `${subject} concept overview`,
    mermaidCode: `flowchart LR
    A["📖 Question"] --> B["Identify\nKey Concepts"]
    B --> C["Apply\nFormulas / Rules"]
    C --> D["Work Through\nStep by Step"]
    D --> E["✅ Solution"]
    style A fill:#FFD166,stroke:#000
    style E fill:#06D6A0,stroke:#000`,
  };
}
