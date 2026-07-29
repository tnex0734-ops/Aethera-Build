import { Link } from 'wouter';
import { BrutalButton } from '@/components/brutal-button';
import { BrutalCard } from '@/components/brutal-card';
import { Brain, MessageSquare, TrendingUp, Zap, BookOpen, Target } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b-3 border-black dark:border-white">
        <div className="absolute inset-0 bg-primary opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-32">
          <div className="max-w-4xl">
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-6 leading-none">
              YOUR AI TUTOR.
              <br />
              <span className="text-primary">NO LIMITS.</span>
            </h1>
            <p className="text-xl md:text-2xl font-medium mb-10 max-w-2xl leading-relaxed">
              Aethera is your personal AI learning companion. Ask questions, upload homework, get instant help. Built for students who refuse to settle.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/chat">
                <BrutalButton variant="primary" size="lg" data-testid="button-start-learning">
                  START LEARNING NOW
                </BrutalButton>
              </Link>
              <Link href="/history">
                <BrutalButton variant="accent" size="lg" data-testid="button-view-history">
                  VIEW HISTORY
                </BrutalButton>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-4xl md:text-5xl font-bold mb-12 uppercase">
          How it works
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <BrutalCard variant="white" shadow="md" className="p-8" data-testid="card-feature-ask">
            <div className="w-14 h-14 bg-primary border-3 border-black dark:border-white flex items-center justify-center mb-6">
              <MessageSquare className="w-7 h-7 text-black" />
            </div>
            <h3 className="text-2xl font-bold mb-3 uppercase">Ask Anything</h3>
            <p className="text-base leading-relaxed">
              Type your question, upload an image of your homework, or drop a PDF. Aethera understands it all.
            </p>
          </BrutalCard>

          <BrutalCard variant="white" shadow="md" className="p-8" data-testid="card-feature-learn">
            <div className="w-14 h-14 bg-accent border-3 border-black dark:border-white flex items-center justify-center mb-6">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3 uppercase">Get Smart Answers</h3>
            <p className="text-base leading-relaxed">
              AI breaks down complex topics into clear explanations. No jargon, no confusion — just learning.
            </p>
          </BrutalCard>

          <BrutalCard variant="white" shadow="md" className="p-8" data-testid="card-feature-track">
            <div className="w-14 h-14 bg-secondary border-3 border-black dark:border-white flex items-center justify-center mb-6">
              <TrendingUp className="w-7 h-7 text-black" />
            </div>
            <h3 className="text-2xl font-bold mb-3 uppercase">Track Progress</h3>
            <p className="text-base leading-relaxed">
              Aethera remembers what you're good at and what needs work. Your learning path adapts to you.
            </p>
          </BrutalCard>

          <BrutalCard variant="primary" shadow="md" className="p-8" data-testid="card-feature-subjects">
            <div className="w-14 h-14 bg-black border-3 border-black flex items-center justify-center mb-6">
              <BookOpen className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-3 uppercase">All Subjects</h3>
            <p className="text-base leading-relaxed">
              Math, science, history, languages — if you're learning it, Aethera can teach it.
            </p>
          </BrutalCard>

          <BrutalCard variant="accent" shadow="md" className="p-8" data-testid="card-feature-instant">
            <div className="w-14 h-14 bg-white border-3 border-white flex items-center justify-center mb-6">
              <Zap className="w-7 h-7 text-accent" />
            </div>
            <h3 className="text-2xl font-bold mb-3 uppercase text-white">Instant Help</h3>
            <p className="text-base leading-relaxed text-white">
              No waiting. No scheduling. Get answers the moment you need them.
            </p>
          </BrutalCard>

          <BrutalCard variant="secondary" shadow="md" className="p-8" data-testid="card-feature-quizzes">
            <div className="w-14 h-14 bg-white border-3 border-black flex items-center justify-center mb-6">
              <Target className="w-7 h-7 text-secondary" />
            </div>
            <h3 className="text-2xl font-bold mb-3 uppercase">Test Yourself</h3>
            <p className="text-base leading-relaxed">
              Generate custom quizzes on any topic. Practice until you master it.
            </p>
          </BrutalCard>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t-3 border-black dark:border-white bg-muted">
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 uppercase">
            Ready to learn?
          </h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto">
            Join thousands of students using Aethera to ace their classes.
          </p>
          <Link href="/chat">
            <BrutalButton variant="primary" size="lg" data-testid="button-start-now">
              START NOW — IT'S FREE
            </BrutalButton>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-3 border-black dark:border-white py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-bold text-lg">AETHERA</p>
            <p className="text-sm text-muted-foreground">
              Built for students. Powered by AI.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
