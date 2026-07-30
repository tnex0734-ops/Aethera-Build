import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Lightbulb, CheckCircle2, HelpCircle, Flame, Star, BookOpen, Volume2, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AssistantState =
  | 'idle'
  | 'thinking'
  | 'listening'
  | 'generating'
  | 'explaining'
  | 'teaching'
  | 'encouraging'
  | 'happy'
  | 'celebrating'
  | 'waiting'
  | 'confused'
  | 'finished';

interface AetheraAssistantProps {
  state?: AssistantState;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSpeechBubble?: boolean;
  speechText?: string;
  onStateClick?: () => void;
}

export function AetheraAssistant({
  state = 'idle',
  className,
  size = 'md',
  showSpeechBubble = true,
  speechText,
  onStateClick,
}: AetheraAssistantProps) {
  const [blink, setBlink] = useState(false);

  // Random eye blinking interval
  useEffect(() => {
    const interval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 180);
    }, 3800 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  // Preset speech bubble text by state if not custom provided
  const stateSpeechMap: Record<AssistantState, string> = {
    idle: "Hi! Ready to discover something cool today? 🚀",
    thinking: "Hmm, let me analyze this carefully for you... 🧠",
    listening: "I'm listening! Tell me or upload your question 🎧",
    generating: "Crafting your step-by-step visual explanation... ✨",
    explaining: "Let's break this down into simple steps! 💡",
    teaching: "Here is the key formula & textbook concept 📚",
    encouraging: "You're doing fantastic! Keep asking questions ⭐",
    happy: "Awesome work! Learning is a superpower 🥳",
    celebrating: "BINGO! Perfect answer! You mastered it! 🎉",
    waiting: "Need another hint or practice quiz question? ⏳",
    confused: "Hmm, I didn't quite get that. Try asking differently? 🤔",
    finished: "All done! Ask me anything else anytime 👍",
  };

  const currentSpeechText = speechText || stateSpeechMap[state];

  // Size mapping
  const sizeMap = {
    sm: { container: 'w-24 h-24', svg: 96 },
    md: { container: 'w-36 h-36', svg: 144 },
    lg: { container: 'w-48 h-48', svg: 192 },
    xl: { container: 'w-64 h-64', svg: 256 },
  };

  // State-based body/eye/hand variations
  const eyeYOffset = state === 'thinking' ? -3 : state === 'listening' ? 1 : 0;

  return (
    <div className={cn('relative flex flex-col items-center select-none', className)}>
      {/* Speech Bubble */}
      {showSpeechBubble && (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSpeechText}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="mb-3 max-w-xs bg-white dark:bg-card border-3 border-black dark:border-white p-3 rounded-2xl shadow-brutal text-xs font-semibold text-center text-foreground relative z-10"
          >
            <p className="leading-snug">{currentSpeechText}</p>
            {/* Bubble Tail */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-black dark:border-t-white" />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white dark:border-t-card" />
          </motion.div>
        </AnimatePresence>
      )}

      {/* Mascot Container */}
      <motion.div
        data-cursor="magnetic"
        onClick={onStateClick}
        className={cn('relative flex items-center justify-center cursor-pointer', sizeMap[size].container)}
        animate={
          state === 'idle' || state === 'waiting'
            ? { y: [0, -8, 0], rotate: [0, 1, -1, 0] }
            : state === 'generating'
            ? { scale: [1, 1.05, 1], rotate: [0, -2, 2, 0] }
            : state === 'celebrating' || state === 'happy'
            ? { y: [0, -16, 0], scale: [1, 1.1, 1] }
            : state === 'thinking'
            ? { rotate: [0, 3, -3, 0] }
            : {}
        }
        transition={{
          duration: state === 'generating' ? 1.2 : state === 'celebrating' ? 0.6 : 3.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Glow Halo for Generating / Celebrating */}
        {(state === 'generating' || state === 'celebrating' || state === 'explaining') && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
            className="absolute inset-0 rounded-full bg-primary/40 blur-xl z-0"
          />
        )}

        {/* Floating Sparkles around Mascot */}
        {(state === 'explaining' || state === 'teaching' || state === 'celebrating') && (
          <>
            <motion.div
              animate={{ y: [-10, -24, -10], opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 2, delay: 0.2 }}
              className="absolute -top-4 -left-2 text-primary z-20"
            >
              <Sparkles className="w-6 h-6 fill-primary" />
            </motion.div>
            <motion.div
              animate={{ y: [-5, -20, -5], opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 2.4, delay: 0.8 }}
              className="absolute -top-6 -right-2 text-accent z-20"
            >
              <Star className="w-5 h-5 fill-accent" />
            </motion.div>
          </>
        )}

        {/* State Badge Overlay Icons */}
        <div className="absolute top-0 right-0 z-30 bg-primary border-2 border-black p-1.5 rounded-full shadow-brutal-sm">
          {state === 'thinking' && <Wand2 className="w-4 h-4 text-black animate-spin" />}
          {state === 'listening' && <Volume2 className="w-4 h-4 text-black animate-pulse" />}
          {state === 'generating' && <Flame className="w-4 h-4 text-red-600 animate-bounce" />}
          {state === 'explaining' || state === 'teaching' ? <BookOpen className="w-4 h-4 text-black" /> : null}
          {state === 'celebrating' || state === 'happy' ? <Star className="w-4 h-4 text-black fill-black" /> : null}
          {state === 'confused' && <HelpCircle className="w-4 h-4 text-black" />}
          {state === 'finished' && <CheckCircle2 className="w-4 h-4 text-black" />}
          {(state === 'idle' || state === 'encouraging' || state === 'waiting') && (
            <Lightbulb className="w-4 h-4 text-black" />
          )}
        </div>

        {/* SVG Mascot Character (Neo-Brutalist Robot/Monster Companion) */}
        <svg
          width={sizeMap[size].svg}
          height={sizeMap[size].svg}
          viewBox="0 0 160 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 drop-shadow-md"
        >
          {/* Antenna / Crown */}
          <rect x="73" y="10" width="14" height="18" rx="4" fill="#FF70A6" stroke="#000" strokeWidth="3" />
          <circle cx="80" cy="8" r="8" fill="#FFD166" stroke="#000" strokeWidth="3" />

          {/* Main Head Body */}
          <rect x="20" y="26" width="120" height="110" rx="28" fill="#FFD166" stroke="#000" strokeWidth="4" />

          {/* Face Screen Card */}
          <rect x="32" y="38" width="96" height="74" rx="18" fill="#FFF" stroke="#000" strokeWidth="3.5" />

          {/* Cheeks / Blush */}
          <ellipse cx="44" cy="84" rx="7" ry="4" fill="#FF70A6" opacity="0.7" />
          <ellipse cx="116" cy="84" rx="7" ry="4" fill="#FF70A6" opacity="0.7" />

          {/* EYES */}
          <g transform={`translate(0, ${eyeYOffset})`}>
            {/* Left Eye */}
            <circle cx="56" cy="64" r="12" fill="#000" />
            {!blink && <circle cx="59" cy="61" r="4" fill="#FFF" />}
            {blink && <line x1="44" y1="64" x2="68" y2="64" stroke="#FFF" strokeWidth="4" strokeLinecap="round" />}

            {/* Right Eye */}
            <circle cx="104" cy="64" r="12" fill="#000" />
            {!blink && <circle cx="107" cy="61" r="4" fill="#FFF" />}
            {blink && <line x1="92" y1="64" x2="116" y2="64" stroke="#FFF" strokeWidth="4" strokeLinecap="round" />}

            {/* Eye Glasses / VR visor when thinking or teaching */}
            {(state === 'teaching' || state === 'thinking') && (
              <rect x="40" y="52" width="80" height="24" rx="6" fill="rgba(17, 138, 178, 0.35)" stroke="#000" strokeWidth="2.5" />
            )}
          </g>

          {/* MOUTH & EXPRESSIONS */}
          {state === 'happy' || state === 'celebrating' || state === 'encouraging' ? (
            // Big Smile
            <path d="M 60 84 Q 80 102 100 84" stroke="#000" strokeWidth="4" strokeLinecap="round" fill="none" />
          ) : state === 'thinking' || state === 'confused' ? (
            // O-Mouth / Quizzical
            <circle cx="80" cy="88" r="6" stroke="#000" strokeWidth="3.5" fill="none" />
          ) : state === 'generating' || state === 'explaining' ? (
            // Speaking Wave Mouth
            <path d="M 64 88 Q 72 82 80 88 T 96 88" stroke="#000" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          ) : (
            // Gentle Smile Default
            <path d="M 66 86 Q 80 94 94 86" stroke="#000" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          )}

          {/* HANDS / ARMS */}
          {/* Left Arm */}
          <rect x="4" y="70" width="18" height="24" rx="8" fill="#118AB2" stroke="#000" strokeWidth="3" />
          {/* Right Arm */}
          <motion.g
            animate={
              state === 'explaining' || state === 'encouraging' || state === 'finished'
                ? { rotate: [0, 20, -10, 0] }
                : {}
            }
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <rect x="138" y="70" width="18" height="24" rx="8" fill="#118AB2" stroke="#000" strokeWidth="3" />
          </motion.g>

          {/* Bottom Feet / Wheels */}
          <rect x="44" y="132" width="24" height="14" rx="6" fill="#000" />
          <rect x="92" y="132" width="24" height="14" rx="6" fill="#000" />
        </svg>
      </motion.div>
    </div>
  );
}
