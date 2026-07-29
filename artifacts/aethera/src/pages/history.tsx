import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { BrutalButton } from '@/components/brutal-button';
import { BrutalCard } from '@/components/brutal-card';
import { BrutalBadge } from '@/components/brutal-badge';
import { useListSessions, useDeleteSession, getListSessionsQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, MessageSquare, Trash2, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function History() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data: sessions = [], isLoading } = useListSessions();
  const deleteSession = useDeleteSession();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = (id: number) => {
    setDeletingId(id);
    deleteSession.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListSessionsQueryKey() });
          setDeletingId(null);
        },
        onError: () => {
          setDeletingId(null);
        }
      }
    );
  };

  const sortedSessions = [...sessions].sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

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
            <h1 className="text-4xl font-bold uppercase">Session History</h1>
          </div>
          <Link href="/">
            <BrutalButton variant="primary" data-testid="button-home">
              HOME
            </BrutalButton>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin" />
          </div>
        ) : sortedSessions.length === 0 ? (
          <BrutalCard variant="muted" shadow="lg" className="p-12 text-center max-w-2xl mx-auto">
            <MessageSquare className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-4 uppercase">No Sessions Yet</h2>
            <p className="text-lg mb-8">Start a conversation with Aethera to see your history here.</p>
            <Link href="/chat">
              <BrutalButton variant="primary" data-testid="button-start-chat">
                START CHATTING
              </BrutalButton>
            </Link>
          </BrutalCard>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sortedSessions.map((session) => (
              <BrutalCard
                key={session.id}
                variant="white"
                shadow="md"
                className="p-6 flex flex-col"
                data-testid={`card-session-${session.id}`}
              >
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-3 uppercase truncate">{session.title}</h3>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {session.subject && (
                      <BrutalBadge variant="accent" data-testid={`badge-subject-${session.id}`}>
                        {session.subject}
                      </BrutalBadge>
                    )}
                    <BrutalBadge variant="muted" data-testid={`badge-count-${session.id}`}>
                      {session.messageCount} MESSAGES
                    </BrutalBadge>
                  </div>

                  <p className="text-sm text-muted-foreground mb-6">
                    Last updated {formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true })}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setLocation('/chat')}
                    className="flex-1"
                  >
                    <BrutalButton variant="primary" className="w-full" data-testid={`button-open-${session.id}`}>
                      OPEN
                    </BrutalButton>
                  </button>
                  <BrutalButton
                    variant="destructive"
                    onClick={() => handleDelete(session.id)}
                    disabled={deletingId === session.id}
                    data-testid={`button-delete-${session.id}`}
                  >
                    {deletingId === session.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </BrutalButton>
                </div>
              </BrutalCard>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
