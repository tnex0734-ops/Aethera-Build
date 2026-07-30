import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, HelpCircle, BookOpen, FileText, Languages, PenTool, CheckCircle, Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SuggestionPill {
  id: string;
  label: string;
  prefix: string;
  icon: React.ElementType;
  color: string;
}

const DEFAULT_SUGGESTIONS: SuggestionPill[] = [
  { id: 'explain', label: 'Explain Step-by-Step', prefix: 'Explain in simple terms: ', icon: Sparkles, color: 'bg-primary text-black' },
  { id: 'solve', label: 'Solve Homework', prefix: 'Solve step by step and explain: ', icon: Calculator, color: 'bg-secondary text-white' },
  { id: 'diagram', label: 'Draw Diagram', prefix: 'Explain with a detailed labelled diagram: ', icon: PenTool, color: 'bg-accent text-white' },
  { id: 'quiz', label: 'Quiz Me', prefix: 'Create 3 practice quiz questions on: ', icon: HelpCircle, color: 'bg-emerald-400 text-black' },
  { id: 'summarize', label: 'Summarize Concept', prefix: 'Summarize key points of: ', icon: FileText, color: 'bg-purple-400 text-black' },
  { id: 'example', label: 'Give Real-life Example', prefix: 'Give a real-life analogy and example for: ', icon: BookOpen, color: 'bg-amber-300 text-black' },
  { id: 'translate', label: 'Translate to Hindi/Bilingual', prefix: 'Explain in bilingual English + Hindi: ', icon: Languages, color: 'bg-cyan-400 text-black' },
  { id: 'notes', label: 'Make Exam Notes', prefix: 'Create short revision notes for: ', icon: CheckCircle, color: 'bg-pink-300 text-black' },
];

interface AutocompletePillsProps {
  filterText?: string;
  onSelectSuggestion: (prefix: string) => void;
  className?: string;
}

export function AutocompletePills({ filterText = '', onSelectSuggestion, className }: AutocompletePillsProps) {
  const filtered = filterText.trim()
    ? DEFAULT_SUGGESTIONS.filter((item) =>
        item.label.toLowerCase().includes(filterText.toLowerCase()) ||
        item.prefix.toLowerCase().includes(filterText.toLowerCase())
      )
    : DEFAULT_SUGGESTIONS;

  if (filtered.length === 0) return null;

  return (
    <div className={cn('overflow-x-auto py-2 px-1 flex gap-2 no-scrollbar', className)}>
      <AnimatePresence mode="popLayout">
        {filtered.map((item) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.8, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectSuggestion(item.prefix)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-black dark:border-white font-bold text-xs shadow-brutal-sm whitespace-nowrap transition-all cursor-pointer',
                item.color
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </motion.button>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
