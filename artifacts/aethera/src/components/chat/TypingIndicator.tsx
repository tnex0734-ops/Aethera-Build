import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center gap-3 my-4"
    >
      <div className="w-10 h-10 bg-primary border-3 border-black dark:border-white rounded-2xl flex items-center justify-center shadow-brutal-sm">
        <Sparkles className="w-5 h-5 text-black animate-spin" />
      </div>

      <div className="bg-white dark:bg-card border-3 border-black dark:border-white p-3.5 rounded-2xl shadow-brutal-sm flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Aethera Thinking</span>
        <div className="flex items-center gap-1.5 ml-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2.5 h-2.5 bg-primary border border-black rounded-full"
              animate={{ scale: [0.8, 1.4, 0.8], y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
