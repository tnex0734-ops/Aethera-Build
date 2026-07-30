import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Upload, Mic, MicOff, Image, FileText, Camera, BookOpen, 
  X, Loader2, Sparkles, Paperclip, ChevronUp
} from 'lucide-react';
import { BrutalButton } from '@/components/brutal-button';
import { AutocompletePills } from './AutocompletePills';
import { cn } from '@/lib/utils';

export type SubjectFilter = 'All' | 'Math' | 'Science' | 'English' | 'Social' | 'CS';

interface ChatInputProps {
  onSendMessage: (message: string, subject?: string, file?: File) => void;
  onFileUpload: (file: File) => void;
  isLoading?: boolean;
  disabled?: boolean;
  selectedLanguage?: string;
}

export function ChatInput({ onSendMessage, onFileUpload, isLoading = false, disabled = false, selectedLanguage = 'en' }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<SubjectFilter>('All');
  const [isRecording, setIsRecording] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showSubjectMenu, setShowSubjectMenu] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Real Speech Recognition handler with language support
  const toggleVoiceRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
    } else {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognitionRef.current = recognition;

          const langMap: Record<string, string> = {
            en: 'en-IN',
            hi: 'hi-IN',
            te: 'te-IN',
            ta: 'ta-IN',
            kn: 'kn-IN',
            ml: 'ml-IN'
          };

          recognition.lang = langMap[selectedLanguage] || 'en-IN';
          recognition.interimResults = true;

          recognition.onstart = () => {
            setIsRecording(true);
          };

          recognition.onresult = (event: any) => {
            const transcript = Array.from(event.results)
              .map((result: any) => result[0].transcript)
              .join('');
            setMessage(transcript);
          };

          recognition.onerror = () => {
            setIsRecording(false);
          };

          recognition.onend = () => {
            setIsRecording(false);
          };

          recognition.start();
        } catch (err) {
          console.error("Speech recognition error:", err);
          setIsRecording(false);
        }
      } else {
        // Fallback for browsers without Web Speech API
        setIsRecording(true);
        setTimeout(() => {
          setMessage('Explain photosynthesis simply');
          setIsRecording(false);
        }, 1500);
      }
    }
  };
  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSend = () => {
    if ((!message.trim() && !selectedFile) || isLoading || disabled) return;
    const msgText = message.trim() || `Uploaded file: ${selectedFile?.name || 'document'}`;
    const subj = selectedSubject !== 'All' ? selectedSubject : undefined;
    if (selectedFile) {
      onSendMessage(msgText, subj, selectedFile);
      setSelectedFile(null);
    } else {
      onSendMessage(msgText, subj);
    }
    setMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const subjectBadges: { id: SubjectFilter; label: string; color: string }[] = [
    { id: 'All', label: 'All Subjects', color: 'bg-muted text-foreground' },
    { id: 'Math', label: '📐 Math', color: 'bg-[#FFD166] text-black' },
    { id: 'Science', label: '🧪 Science', color: 'bg-[#06D6A0] text-black' },
    { id: 'English', label: '📖 English', color: 'bg-[#FF70A6] text-black' },
    { id: 'Social', label: '🌍 Social', color: 'bg-[#9D4EDD] text-white' },
    { id: 'CS', label: '💻 CS', color: 'bg-[#118AB2] text-white' },
  ];

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        'relative bg-white dark:bg-card border-t-4 border-black dark:border-white p-3 md:p-4 transition-all',
        isDragging && 'bg-primary/20 border-dashed border-4 border-primary'
      )}
    >
      {/* Drag Overlay Banner */}
      {isDragging && (
        <div className="absolute inset-0 bg-primary/90 z-40 flex flex-col items-center justify-center font-bold text-lg text-black border-4 border-dashed border-black">
          <Upload className="w-10 h-10 mb-2 animate-bounce" />
          <p>Drop your Notebook photo, Textbook page, or PDF here! 🚀</p>
        </div>
      )}

      {/* Selected File Chip Preview */}
      {selectedFile && (
        <div className="mb-3 flex items-center justify-between bg-muted border-2 border-black p-2 rounded-xl text-xs font-bold shadow-brutal-sm">
          <div className="flex items-center gap-2 truncate">
            {selectedFile.type.startsWith('image/') ? (
              <Camera className="w-4 h-4 text-primary" />
            ) : (
              <FileText className="w-4 h-4 text-accent" />
            )}
            <span className="truncate">{selectedFile.name}</span>
            <span className="text-[10px] bg-background px-1.5 py-0.5 rounded border border-black">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </span>
          </div>
          <button
            onClick={() => setSelectedFile(null)}
            className="p-1 hover:bg-destructive hover:text-white rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Autocomplete Suggestion Pills */}
      <AutocompletePills
        filterText={message}
        onSelectSuggestion={(prefix) => {
          setMessage((prev) => (prev.startsWith(prefix) ? prev : `${prefix}${prev}`));
          textareaRef.current?.focus();
        }}
      />

      {/* Main Input Box Container */}
      <div className="relative border-3 border-black dark:border-white bg-background rounded-2xl p-2 shadow-brutal flex flex-col gap-2">
        {/* Top Utility Bar: Subject selector & Voice status */}
        <div className="flex items-center justify-between px-2 pt-1 border-b border-border/50 pb-2">
          {/* Subject Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider mr-1">
              Subject:
            </span>
            {subjectBadges.map((sb) => (
              <button
                key={sb.id}
                onClick={() => setSelectedSubject(sb.id)}
                className={cn(
                  'px-2.5 py-0.5 rounded-full text-[11px] font-bold border-2 border-black dark:border-white transition-all cursor-pointer',
                  sb.color,
                  selectedSubject === sb.id ? 'ring-2 ring-black dark:ring-white scale-105 shadow-brutal-sm' : 'opacity-80 hover:opacity-100'
                )}
              >
                {sb.label}
              </button>
            ))}
          </div>

          {/* Voice Indicator Badge */}
          {isRecording && (
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="flex items-center gap-1 bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full border border-black"
            >
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              Listening...
            </motion.div>
          )}
        </div>

        {/* Text Area Input */}
        <div className="flex items-end gap-2 px-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading || disabled}
            placeholder={
              isRecording
                ? 'Speak now... Aethera is transcribing your doubt...'
                : 'Ask any question, paste homework, or drag & drop notebook photos...'
            }
            rows={1}
            className="flex-1 bg-transparent text-sm md:text-base font-medium resize-none outline-none py-2 px-1 placeholder:text-muted-foreground/70 min-h-[44px]"
          />

          {/* Action Buttons Row */}
          <div className="flex items-center gap-1.5 pb-1">
            {/* File Upload Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
            />
            <BrutalButton
              variant="muted"
              size="sm"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || disabled}
              data-cursor="Upload Notebook"
              title="Upload Homework / Textbook Page / PDF"
              className="p-2 h-10 w-10"
            >
              <Paperclip className="w-4 h-4" />
            </BrutalButton>

            {/* Simulated Voice Mic Button */}
            <BrutalButton
              variant={isRecording ? 'destructive' : 'accent'}
              size="sm"
              type="button"
              onClick={toggleVoiceRecording}
              disabled={isLoading || disabled}
              data-cursor="Voice Mic"
              title="Voice Input"
              className="p-2 h-10 w-10"
            >
              {isRecording ? <MicOff className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
            </BrutalButton>

            {/* Send Button */}
            <BrutalButton
              variant="primary"
              size="sm"
              type="button"
              onClick={handleSend}
              disabled={(!message.trim() && !selectedFile) || isLoading || disabled}
              data-cursor="Send Question"
              className="px-4 h-10"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline font-bold">ASK</span>
                </>
              )}
            </BrutalButton>
          </div>
        </div>
      </div>
    </div>
  );
}
