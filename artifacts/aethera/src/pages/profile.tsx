import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { BrutalButton } from '@/components/brutal-button';
import { BrutalCard } from '@/components/brutal-card';
import { BrutalInput } from '@/components/brutal-input';
import { BrutalBadge } from '@/components/brutal-badge';
import {
  useGetProfile,
  useUpdateProfile,
  useGetMemory,
  useGetDashboardSummary,
  useGetRecentActivity,
  getGetProfileQueryKey,
  getGetMemoryQueryKey,
  getGetDashboardSummaryQueryKey
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2, TrendingUp, MessageSquare, Target, Award } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Profile() {
  const queryClient = useQueryClient();
  const { data: profile, isLoading: profileLoading } = useGetProfile();
  const { data: memory, isLoading: memoryLoading } = useGetMemory();
  const { data: summary, isLoading: summaryLoading } = useGetDashboardSummary();
  const { data: activity = [], isLoading: activityLoading } = useGetRecentActivity();
  const updateProfile = useUpdateProfile();

  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setGrade(profile.grade || '');
    }
  }, [profile]);

  const handleSave = () => {
    updateProfile.mutate(
      { data: { name, grade } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
        }
      }
    );
  };

  const grades = [
    'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
    'Grade 11', 'Grade 12', 'College'
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b-3 border-black dark:border-white">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/chat">
              <BrutalButton variant="muted" size="sm" data-testid="button-back">
                <ArrowLeft className="w-4 h-4" />
              </BrutalButton>
            </Link>
            <h1 className="text-4xl font-bold uppercase">Profile</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        {/* Profile Info */}
        <BrutalCard variant="white" shadow="lg" className="p-8">
          <h2 className="text-2xl font-bold mb-6 uppercase">Your Info</h2>
          {profileLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold mb-2 uppercase" htmlFor="name">
                  Name
                </label>
                <BrutalInput
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  data-testid="input-name"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 uppercase" htmlFor="grade">
                  Grade
                </label>
                <select
                  id="grade"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-4 py-3 border-3 border-black dark:border-white bg-white dark:bg-card text-foreground font-medium focus:outline-none focus:ring-3 focus:ring-black dark:focus:ring-white focus:ring-offset-2"
                  data-testid="select-grade"
                >
                  <option value="">Select grade</option>
                  {grades.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <BrutalButton
                  variant="primary"
                  onClick={handleSave}
                  disabled={updateProfile.isPending}
                  data-testid="button-save"
                >
                  {updateProfile.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      SAVING...
                    </>
                  ) : (
                    'SAVE CHANGES'
                  )}
                </BrutalButton>
              </div>
            </div>
          )}
        </BrutalCard>

        {/* Dashboard Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {summaryLoading ? (
            <div className="col-span-full flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : summary ? (
            <>
              <BrutalCard variant="primary" shadow="md" className="p-6" data-testid="card-stat-sessions">
                <div className="w-12 h-12 bg-black border-3 border-black flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <p className="text-4xl font-bold mb-1">{summary.totalSessions}</p>
                <p className="text-sm font-medium uppercase">Sessions</p>
              </BrutalCard>

              <BrutalCard variant="accent" shadow="md" className="p-6 text-white" data-testid="card-stat-messages">
                <div className="w-12 h-12 bg-white border-3 border-white flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-accent" />
                </div>
                <p className="text-4xl font-bold mb-1">{summary.totalMessages}</p>
                <p className="text-sm font-medium uppercase">Messages</p>
              </BrutalCard>

              <BrutalCard variant="secondary" shadow="md" className="p-6" data-testid="card-stat-quizzes">
                <div className="w-12 h-12 bg-white border-3 border-black flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-secondary" />
                </div>
                <p className="text-4xl font-bold mb-1">{summary.quizzesCompleted}</p>
                <p className="text-sm font-medium uppercase">Quizzes</p>
              </BrutalCard>

              <BrutalCard variant="white" shadow="md" className="p-6" data-testid="card-stat-streak">
                <div className="w-12 h-12 bg-primary border-3 border-black dark:border-white flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-black" />
                </div>
                <p className="text-4xl font-bold mb-1">{summary.learningStreak}</p>
                <p className="text-sm font-medium uppercase">Day Streak</p>
              </BrutalCard>
            </>
          ) : null}
        </div>

        {/* Learning Memory */}
        <BrutalCard variant="white" shadow="lg" className="p-8">
          <h2 className="text-2xl font-bold mb-6 uppercase">Learning Memory</h2>
          {memoryLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : memory ? (
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-bold mb-4 uppercase text-accent">Strong Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {memory.strongTopics.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No strong topics yet. Keep learning!</p>
                  ) : (
                    memory.strongTopics.map((topic, idx) => (
                      <BrutalBadge key={idx} variant="accent" data-testid={`badge-strong-${idx}`}>
                        {topic}
                      </BrutalBadge>
                    ))
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-4 uppercase text-secondary">Needs Practice</h3>
                <div className="flex flex-wrap gap-2">
                  {memory.weakTopics.length === 0 ? (
                    <p className="text-sm text-muted-foreground">All caught up!</p>
                  ) : (
                    memory.weakTopics.map((topic, idx) => (
                      <BrutalBadge key={idx} variant="secondary" data-testid={`badge-weak-${idx}`}>
                        {topic}
                      </BrutalBadge>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </BrutalCard>

        {/* Recent Activity */}
        <BrutalCard variant="white" shadow="lg" className="p-8">
          <h2 className="text-2xl font-bold mb-6 uppercase">Recent Activity</h2>
          {activityLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : activity.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No recent activity.</p>
          ) : (
            <div className="space-y-4">
              {activity.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border-2 border-black dark:border-white"
                  data-testid={`activity-${item.id}`}
                >
                  <div className="flex-1">
                    <p className="font-bold">{item.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <BrutalBadge variant="muted" className="text-[10px] px-1.5 py-0.5">
                        {item.type.toUpperCase()}
                      </BrutalBadge>
                      {item.subject && (
                        <BrutalBadge variant="accent" className="text-[10px] px-1.5 py-0.5">
                          {item.subject}
                        </BrutalBadge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {item.score !== null && item.score !== undefined && (
                      <p className="font-bold text-lg">{item.score}%</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </BrutalCard>
      </main>
    </div>
  );
}
