import { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [cursorText, setCursorText] = useState('');
  const [cursorVariant, setCursorVariant] = useState<'default' | 'pointer' | 'magnetic' | 'text' | 'action'>('default');
  const [isClicking, setIsClicking] = useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Smooth trailing spring physics
  const springConfig = { damping: 28, stiffness: 400, mass: 0.2 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Check if device supports fine pointer and doesn't prefer reduced motion
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!hasFinePointer || prefersReducedMotion) {
      return;
    }

    setEnabled(true);
    document.body.classList.add('custom-cursor-active');

    const handleMouseMove = (e: MouseEvent) => {
      let targetX = e.clientX;
      let targetY = e.clientY;

      const target = e.target as HTMLElement | null;
      const interactiveEl = target?.closest('[data-cursor], button, a, input, textarea, [role="button"]') as HTMLElement | null;

      if (interactiveEl) {
        const cursorData = interactiveEl.getAttribute('data-cursor');
        const isMagnetic = cursorData === 'magnetic' || interactiveEl.tagName === 'BUTTON' || interactiveEl.tagName === 'A';

        if (cursorData && cursorData !== 'magnetic') {
          setCursorText(cursorData);
          setCursorVariant('action');
        } else if (interactiveEl.tagName === 'INPUT' || interactiveEl.tagName === 'TEXTAREA') {
          setCursorText('');
          setCursorVariant('text');
        } else if (isMagnetic) {
          // Magnetic snap towards center of button
          const rect = interactiveEl.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          
          // Pull 25% towards center
          targetX = targetX + (centerX - targetX) * 0.35;
          targetY = targetY + (centerY - targetY) * 0.35;

          setCursorText('');
          setCursorVariant('magnetic');
        } else {
          setCursorText('');
          setCursorVariant('pointer');
        }
      } else {
        setCursorText('');
        setCursorVariant('default');
      }

      mouseX.set(targetX);
      mouseY.set(targetY);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.body.classList.remove('custom-cursor-active');
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [mouseX, mouseY]);

  if (!enabled) return null;

  const variantStyles = {
    default: {
      width: 24,
      height: 24,
      borderRadius: '50%',
      backgroundColor: '#FFD166',
      border: '3px solid #000',
    },
    pointer: {
      width: 36,
      height: 36,
      borderRadius: '50%',
      backgroundColor: '#FF70A6',
      border: '3px solid #000',
    },
    magnetic: {
      width: 44,
      height: 44,
      borderRadius: '16px',
      backgroundColor: 'rgba(255, 209, 102, 0.4)',
      border: '3px solid #000',
      backdropFilter: 'blur(2px)',
    },
    text: {
      width: 8,
      height: 28,
      borderRadius: '4px',
      backgroundColor: '#000',
      border: 'none',
    },
    action: {
      width: 'auto',
      height: 32,
      borderRadius: '12px',
      backgroundColor: '#118AB2',
      border: '3px solid #000',
      paddingLeft: 10,
      paddingRight: 10,
    },
  };

  return (
    <motion.div
      aria-hidden="true"
      className="fixed top-0 left-0 pointer-events-none z-[99999] flex items-center justify-center font-bold text-xs uppercase tracking-wider text-black shadow-brutal-sm"
      style={{
        x: cursorX,
        y: cursorY,
        translateX: '-50%',
        translateY: '-50%',
      }}
      animate={{
        scale: isClicking ? 0.8 : 1,
        ...variantStyles[cursorVariant],
      }}
      transition={{ type: 'spring', damping: 25, stiffness: 350 }}
    >
      {cursorText && <span className="whitespace-nowrap text-white drop-shadow-sm">{cursorText}</span>}
    </motion.div>
  );
}
