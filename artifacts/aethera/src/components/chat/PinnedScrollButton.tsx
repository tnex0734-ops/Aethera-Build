import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown } from 'lucide-react';

interface PinnedScrollButtonProps {
  show: boolean;
  onClick: () => void;
  unreadCount?: number;
}

export function PinnedScrollButton({ show, onClick, unreadCount = 0 }: PinnedScrollButtonProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 15 }}
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClick}
          data-cursor="Scroll Down"
          className="fixed bottom-24 right-6 z-40 bg-primary text-black border-3 border-black dark:border-white p-3 rounded-full shadow-brutal flex items-center justify-center font-bold cursor-pointer"
        >
          <ArrowDown className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-secondary text-white text-[10px] font-black px-1.5 py-0.5 rounded-full border border-black">
              {unreadCount}
            </span>
          )}
        </motion.button>
      )}
    </AnimatePresence>
  );
}
