import { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { BrutalButton } from '@/components/brutal-button';
import { BrutalCard } from '@/components/brutal-card';
import { BrutalBadge } from '@/components/brutal-badge';
import { AetheraAssistant, AssistantState } from '@/components/chat/AetheraAssistant';
import { 
  MessageSquare, Brain, TrendingUp, Zap, BookOpen, Target, 
  Sparkles, CheckCircle2, ArrowRight, Star, ShieldCheck, Flame, Languages, Camera 
} from 'lucide-react';

export default function Landing() {
  const [heroMascotState, setHeroMascotState] = useState<AssistantState>('happy');

  const stats = [
    { value: '50,000+', label: 'Doubts Resolved' },
    { value: 'Grade 1–10', label: 'Curriculum Aligned' },
    { value: '99.4%', label: 'Concept Mastery Rate' },
    { value: '7+ Languages', label: 'Bilingual Multilingual Support' },
  ];

  const features = [
    {
      icon: Camera,
      title: 'Notebook & Textbook OCR',
      description: 'Snap a photo of your handwritten notebook or printed textbook page. Aethera reads equations, diagrams, and text instantly.',
      variant: 'white' as const,
      color: 'bg-primary text-black',
    },
    {
      icon: Brain,
      title: 'Step-by-Step Explanations',
      description: 'Get clear, jargon-free explanations tailored specifically to Grade 1–10 school level with analogies you actually understand.',
      variant: 'white' as const,
      color: 'bg-secondary text-white',
    },
    {
      icon: BookOpen,
      title: 'Visual Learning Cards',
      description: 'Every complex concept is accompanied by clean, educational diagrams, charts, and key points for faster retention.',
      variant: 'white' as const,
      color: 'bg-accent text-white',
    },
    {
      icon: Languages,
      title: 'Multilingual & Hinglish',
      description: 'Ask questions in English, Hindi, Hinglish, Telugu, Tamil, Kannada or Malayalam. Aethera responds in bilingual clarity.',
      variant: 'primary' as const,
      color: 'bg-black text-primary',
    },
    {
      icon: Target,
      title: 'Practice Quiz Generator',
      description: 'Generate customized 3-question mini quizzes on any topic to test your knowledge before exams.',
      variant: 'accent' as const,
      color: 'bg-white text-accent',
    },
    {
      icon: Zap,
      title: 'Voice Mic Input',
      description: 'Simply speak your doubt out loud when typing feels slow. Aethera transcribes and solves your question live.',
      variant: 'secondary' as const,
      color: 'bg-white text-secondary',
    },
  ];

  const timelineSteps = [
    { step: '01', title: 'Upload or Ask Any Doubt', desc: 'Type, speak, or upload notebook images & textbook pages.' },
    { step: '02', title: 'Instant Intelligent Analysis', desc: 'Aethera fixes spelling, detects subject & grade curriculum.' },
    { step: '03', title: 'Learn with Text + Visuals', desc: 'Read simple explanations with diagrams, analogies, and quizzes.' },
    { step: '04', title: 'Master the Concept', desc: 'Track weak areas and build confidence for school exams.' },
  ];

  return (
    <div className="min-h-screen bg-background font-sans overflow-x-hidden">
      {/* Top Navbar */}
      <nav className="border-b-4 border-black dark:border-white bg-white dark:bg-card px-6 py-4 sticky top-0 z-50 shadow-brutal-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary border-3 border-black rounded-xl flex items-center justify-center font-black text-xl text-black shadow-brutal-sm">
              A
            </div>
            <span className="text-2xl font-black tracking-tight uppercase">AETHERA</span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/chat">
              <BrutalButton variant="primary" size="md" data-testid="nav-launch-app">
                <Sparkles className="w-4 h-4" />
                <span>LAUNCH APP</span>
              </BrutalButton>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative border-b-4 border-black dark:border-white bg-brutal-grid py-16 md:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Hero Left Text Column */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary border-2 border-black font-extrabold text-xs shadow-brutal-sm uppercase tracking-wider">
                <Flame className="w-4 h-4 text-red-600 animate-bounce" />
                <span>Grade 1–10 AI Learning Companion</span>
              </div>

              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight uppercase leading-[0.95]">
                EVERY DOUBT <br />
                <span className="text-primary underline decoration-black decoration-wavy decoration-2">DESERVES CLARITY.</span>
              </h1>

              <p className="text-lg md:text-2xl font-semibold leading-relaxed text-foreground/90 max-w-2xl">
                Aethera reads your handwritten notebooks, textbook photos, and voice questions. Get instant visual step-by-step explanations built for real students.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/chat">
                  <BrutalButton variant="primary" size="lg" className="text-lg py-4 px-8" data-testid="button-start-learning">
                    <span>START LEARNING NOW</span>
                    <ArrowRight className="w-5 h-5" />
                  </BrutalButton>
                </Link>
                <Link href="/history">
                  <BrutalButton variant="muted" size="lg" className="text-lg py-4 px-8" data-testid="button-view-history">
                    <span>EXPLORE DEMO</span>
                  </BrutalButton>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-success" />
                  <span>Curriculum Aligned</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>Multilingual Support</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-accent" />
                  <span>Free for Students</span>
                </div>
              </div>
            </motion.div>

            {/* Hero Right Mascot Preview Column */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-5 flex justify-center"
            >
              <BrutalCard variant="white" shadow="xl" className="p-8 max-w-md w-full bg-white dark:bg-card border-4 border-black text-center relative">
                <div className="absolute -top-4 -right-4">
                  <BrutalBadge variant="secondary" className="px-3 py-1 text-xs">
                    INTERACTIVE
                  </BrutalBadge>
                </div>

                <AetheraAssistant
                  state={heroMascotState}
                  size="xl"
                  onStateClick={() => {
                    const states: AssistantState[] = ['celebrating', 'explaining', 'happy', 'teaching'];
                    setHeroMascotState(states[Math.floor(Math.random() * states.length)]);
                  }}
                />

                <div className="mt-6 pt-4 border-t-2 border-black space-y-2">
                  <p className="text-xs font-bold uppercase text-muted-foreground">Tap mascot to switch emotion!</p>
                  <div className="flex justify-center gap-2">
                    {(['happy', 'thinking', 'celebrating', 'teaching'] as AssistantState[]).map((st) => (
                      <button
                        key={st}
                        onClick={() => setHeroMascotState(st)}
                        className="px-2 py-1 text-[10px] font-black uppercase bg-muted border border-black rounded hover:bg-primary transition-colors cursor-pointer"
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </BrutalCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Animated Statistics Bar */}
      <section className="border-b-4 border-black dark:border-white bg-primary py-8">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-3 bg-white border-3 border-black rounded-2xl shadow-brutal-sm"
            >
              <h3 className="text-3xl md:text-4xl font-black text-black">{stat.value}</h3>
              <p className="text-xs md:text-sm font-extrabold uppercase text-black/80 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Interactive Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <BrutalBadge variant="accent" className="px-3 py-1 text-xs">
            BUILT FOR REAL STUDENTS
          </BrutalBadge>
          <h2 className="text-4xl md:text-6xl font-black uppercase">How Aethera Powers Learning</h2>
          <p className="text-base md:text-xl font-semibold text-muted-foreground">
            No rigid prompts required. Ask questions your way—typed, spoken, or photographed.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <BrutalCard
                key={idx}
                variant={feat.variant}
                shadow="lg"
                hoverEffect
                className="p-8 flex flex-col justify-between"
                data-testid={`card-feature-${idx}`}
              >
                <div>
                  <div className={`w-14 h-14 ${feat.color} border-3 border-black rounded-2xl flex items-center justify-center mb-6 shadow-brutal-sm`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-black uppercase mb-3">{feat.title}</h3>
                  <p className="text-sm md:text-base font-medium leading-relaxed opacity-90">{feat.description}</p>
                </div>
              </BrutalCard>
            );
          })}
        </div>
      </section>

      {/* Step-by-Step Learning Timeline */}
      <section className="border-t-4 border-b-4 border-black dark:border-white bg-muted py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-black uppercase">4 Simple Steps to Clarity</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {timelineSteps.map((ts, idx) => (
              <BrutalCard key={idx} variant="white" shadow="md" className="p-6 relative">
                <div className="text-4xl font-black text-primary mb-3">{ts.step}</div>
                <h4 className="text-lg font-black uppercase mb-2">{ts.title}</h4>
                <p className="text-xs md:text-sm font-medium text-muted-foreground">{ts.desc}</p>
              </BrutalCard>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="bg-secondary text-white py-20 border-b-4 border-black dark:border-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 relative z-10 space-y-6">
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tight text-white drop-shadow-md">
            READY TO ACE YOUR STUDIES?
          </h2>
          <p className="text-lg md:text-2xl font-bold max-w-2xl mx-auto">
            Join thousands of Grade 1–10 students using Aethera to solve doubts and master concepts.
          </p>
          <Link href="/chat">
            <BrutalButton variant="primary" size="lg" className="text-xl py-5 px-10 text-black" data-testid="button-start-now">
              <Sparkles className="w-6 h-6" />
              <span>START LEARNING NOW — IT'S FREE</span>
            </BrutalButton>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white dark:bg-card">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary border-2 border-black rounded flex items-center justify-center font-black text-black text-xs">
              A
            </div>
            <span className="font-extrabold text-lg uppercase">AETHERA</span>
          </div>
          <p className="text-xs font-bold text-muted-foreground">
            Grade 1–10 AI Learning Companion. Powered by Neo-Brutalist Motion Design.
          </p>
        </div>
      </footer>
    </div>
  );
}
