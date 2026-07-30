import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, RefreshCw, Edit3, User, Sparkles, Image as ImageIcon, BookOpen, Volume2 } from 'lucide-react';
import { BrutalCard } from '@/components/brutal-card';
import { BrutalBadge } from '@/components/brutal-badge';
import { cn } from '@/lib/utils';

export interface MessageData {
  id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  subject?: string;
  uploadId?: number;
  imageUrl?: string;
  createdAt?: string;
}

interface MessageBubbleProps {
  message: MessageData;
  onCopy?: (text: string) => void;
  onRegenerate?: () => void;
  onEdit?: (text: string) => void;
  isLatestAssistantMessage?: boolean;
}

export function MessageBubble({ message, onCopy, onRegenerate, onEdit, isLatestAssistantMessage }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    if (onCopy) onCopy(message.content);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        const cleanText = message.content.replace(/#+\s+/g, '').replace(/```[\s\S]*?```/g, '').replace(/[○✅]/g, '');
        const utterance = new SpeechSynthesisUtterance(cleanText);
        
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        
        setIsSpeaking(true);
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  // Render text and explanatory visual images (no text flowcharts)
  const renderFormattedMarkdown = (text: string) => {
    // Extract code blocks first
    const codeBlockRegex = /```([a-z]*)\n([\s\S]*?)```/g;
    const blocks: Array<{ type: 'text' | 'code'; content: string; lang?: string }> = [];

    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        blocks.push({ type: 'text', content: text.slice(lastIndex, match.index) });
      }
      blocks.push({ type: 'code', lang: match[1] || 'text', content: match[2].trim() });
      lastIndex = codeBlockRegex.lastIndex;
    }
    if (lastIndex < text.length) {
      blocks.push({ type: 'text', content: text.slice(lastIndex) });
    }

    return blocks.map((block, bIdx) => {
      if (block.type === 'code') {
        // Extract prompt topic for explanatory visual image
        const rawTopic = block.content.split('\n')[0].replace(/[^a-zA-Z0-9\s]/g, '').trim() || message.subject || 'educational explanation';
        const cleanTopic = rawTopic.toLowerCase().replace(/flowchart|mermaid|td|lr|groups/g, '').trim() || 'learning concept';
        
        const explanatoryAiImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(`detailed educational infographic visual diagram explaining ${cleanTopic}, textbook illustration with clear labeled parts, simple bright clean vector style`)}?width=640&height=340&nologo=true`;
        const webFallbackUrl = `https://loremflickr.com/640/340/${encodeURIComponent(cleanTopic)},science/all`;

        return (
          <div key={bIdx} className="my-4 border-3 border-black dark:border-white rounded-2xl bg-amber-50 dark:bg-card overflow-hidden shadow-brutal-sm">
            {/* Visual Card Header */}
            <div className="bg-amber-300 dark:bg-amber-400 text-black px-4 py-2 flex items-center justify-between border-b-3 border-black font-black text-xs uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-black" />
                <span>🖼️ EXPLANATORY VISUAL</span>
              </span>
              <BrutalBadge variant="primary" className="text-[9px] bg-black text-white px-2 py-0.5">
                AI INFOGRAPHIC
              </BrutalBadge>
            </div>

            {/* Generated Child-Friendly Visual Illustration */}
            <div className="relative bg-white dark:bg-card p-3 flex flex-col items-center justify-center min-h-[180px]">
              <img
                src={explanatoryAiImageUrl}
                alt={`Explanatory infographic for ${cleanTopic}`}
                className="w-full max-h-72 object-contain rounded-xl border-2 border-black bg-white shadow-brutal-sm"
                loading="lazy"
                onError={(e) => {
                  // Fallback to educational web image if AI image generator is slow
                  const target = e.target as HTMLImageElement;
                  if (!target.dataset.triedFallback) {
                    target.dataset.triedFallback = 'true';
                    target.src = webFallbackUrl;
                  } else {
                    target.style.display = 'none';
                  }
                }}
              />
            </div>
          </div>
        );
      }

      // Render regular text paragraph lines
      const lines = block.content.split('\n');
      return (
        <div key={bIdx}>
          {lines.map((line, idx) => {
            if (!line.trim()) return <div key={idx} className="h-2" />;
            
            // Bullet list items
            if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
              return (
                <li key={idx} className="ml-4 list-disc font-medium text-sm my-1">
                  {line.replace(/^[-*]\s+/, '')}
                </li>
              );
            }
            // Headers
            if (line.startsWith('#')) {
              const headerText = line.replace(/^#+\s+/, '');
              return (
                <h4 key={idx} className="font-black text-base md:text-lg uppercase my-3 text-foreground border-b-2 border-primary/40 pb-1 flex items-center gap-2">
                  {headerText}
                </h4>
              );
            }
            // MCQ options formatting (○ Option)
            if (line.trim().startsWith('○') || line.trim().startsWith('A)') || line.trim().startsWith('B)') || line.trim().startsWith('C)') || line.trim().startsWith('D)')) {
              const isCorrect = line.includes('✅');
              return (
                <div key={idx} className={cn(
                  'my-1.5 p-2.5 rounded-xl border-2 border-black font-bold text-xs md:text-sm flex items-center justify-between shadow-brutal-sm transition-all',
                  isCorrect ? 'bg-emerald-300 dark:bg-emerald-900/60 text-black dark:text-white font-extrabold border-3' : 'bg-muted/70 hover:bg-muted'
                )}>
                  <span>{line.replace('✅', '').trim()}</span>
                  {isCorrect && <Check className="w-4 h-4 text-emerald-900 dark:text-emerald-200" />}
                </div>
              );
            }

            return (
              <p key={idx} className="my-1 text-sm md:text-base font-medium leading-relaxed">
                {line}
              </p>
            );
          })}
        </div>
      );
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={cn('flex gap-3 md:gap-4 my-4', isUser ? 'justify-end' : 'justify-start')}
      data-testid={`message-${message.id}`}
    >
      {/* Assistant Mascot Avatar */}
      {!isUser && (
        <div className="w-10 h-10 md:w-12 md:h-12 bg-primary border-3 border-black dark:border-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-brutal-sm">
          <Sparkles className="w-6 h-6 text-black" />
        </div>
      )}

      {/* Bubble Container */}
      <div className="flex flex-col max-w-[85%] md:max-w-[75%]">
        <BrutalCard
          variant={isUser ? 'primary' : 'white'}
          shadow="sm"
          className={cn(
            'p-4 md:p-5 rounded-2xl border-3 border-black dark:border-white relative group',
            isUser ? 'bg-primary text-black font-semibold' : 'bg-white dark:bg-card text-foreground'
          )}
        >
          {/* Header metadata row */}
          <div className="flex items-center justify-between gap-2 mb-2 pb-1 border-b border-border/30 text-xs">
            <span className="font-extrabold uppercase text-[11px] tracking-wider opacity-80">
              {isUser ? 'You' : 'Aethera Tutor'}
            </span>
            {message.subject && (
              <BrutalBadge variant="accent" className="text-[10px] px-2 py-0.5 font-bold">
                {message.subject}
              </BrutalBadge>
            )}
          </div>

          {/* Uploaded Image Preview Thumbnail */}
          {message.imageUrl && (
            <div className="mb-3 rounded-xl overflow-hidden border-2 border-black bg-white dark:bg-card p-1 shadow-brutal-sm">
              <img
                src={message.imageUrl}
                alt="Uploaded Notebook / Diagram"
                className="max-h-56 max-w-full object-contain rounded-lg border border-black/20"
              />
            </div>
          )}

          {/* Formatted Content */}
          <div className="prose dark:prose-invert max-w-none text-foreground">
            {renderFormattedMarkdown(message.content)}
          </div>

          {/* Inline Visual Card Banner (PRD Feature for Assistant Responses) */}
          {!isUser && (message.content.toLowerCase().includes('photosynthesis') || message.content.toLowerCase().includes('diagram')) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 p-4 bg-muted border-2 border-black rounded-xl shadow-brutal-sm flex flex-col items-center text-center"
            >
              <div className="w-full h-32 bg-accent/20 rounded-lg border-2 border-black flex items-center justify-center mb-2">
                <BookOpen className="w-10 h-10 text-accent animate-bounce" />
              </div>
              <p className="text-xs font-bold uppercase text-foreground">Interactive Educational Visual Concept Card</p>
            </motion.div>
          )}

          {/* Action Buttons Toolbar */}
          <div className="mt-3 pt-2 border-t border-border/30 flex items-center justify-between text-xs opacity-90 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1 hover:text-primary transition-colors font-bold"
                title="Copy response"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>

              {!isUser && (
                <button
                  onClick={handleSpeak}
                  className={cn(
                    'inline-flex items-center gap-1 hover:text-primary transition-colors font-bold',
                    isSpeaking && 'text-primary animate-pulse font-extrabold'
                  )}
                  title={isSpeaking ? 'Stop speaking' : 'Listen to answer'}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{isSpeaking ? 'Speaking...' : 'Listen'}</span>
                </button>
              )}

              {!isUser && onRegenerate && isLatestAssistantMessage && (
                <button
                  onClick={onRegenerate}
                  className="inline-flex items-center gap-1 hover:text-primary transition-colors font-bold"
                  title="Regenerate response"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry</span>
                </button>
              )}

              {isUser && onEdit && (
                <button
                  onClick={() => onEdit(message.content)}
                  className="inline-flex items-center gap-1 hover:text-black transition-colors font-bold"
                  title="Edit question"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              )}
            </div>
          </div>
        </BrutalCard>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-10 h-10 md:w-12 md:h-12 bg-secondary border-3 border-black dark:border-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-brutal-sm">
          <User className="w-6 h-6 text-white" />
        </div>
      )}
    </motion.div>
  );
}
