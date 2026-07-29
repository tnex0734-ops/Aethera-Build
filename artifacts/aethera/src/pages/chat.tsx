import { useState, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { BrutalButton } from '@/components/brutal-button';
import { BrutalCard } from '@/components/brutal-card';
import { BrutalInput } from '@/components/brutal-input';
import { BrutalBadge } from '@/components/brutal-badge';
import { 
  useListSessions, 
  useCreateSession, 
  useGetSession, 
  useSendChat,
  useCreateUpload,
  getListSessionsQueryKey,
  getGetSessionQueryKey
} from '@workspace/api-client-react';
import { Menu, Plus, Send, Upload, Loader2, User, Home, History, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Chat() {
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: sessions = [], isLoading: sessionsLoading } = useListSessions();
  const { data: currentSession, isLoading: sessionLoading } = useGetSession(
    currentSessionId!,
    { query: { enabled: !!currentSessionId, queryKey: getGetSessionQueryKey(currentSessionId!) } }
  );

  const createSession = useCreateSession();
  const sendChat = useSendChat();
  const createUpload = useCreateUpload();

  const messages = currentSession?.messages || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleNewSession = () => {
    createSession.mutate(
      { data: { title: 'New Session' } },
      {
        onSuccess: (newSession) => {
          setCurrentSessionId(newSession.id);
          queryClient.invalidateQueries({ queryKey: getListSessionsQueryKey() });
        }
      }
    );
  };

  const handleSendMessage = () => {
    if (!message.trim() || !currentSessionId) return;

    const content = message;
    setMessage('');

    sendChat.mutate(
      { data: { content, sessionId: currentSessionId } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetSessionQueryKey(currentSessionId) });
          queryClient.invalidateQueries({ queryKey: getListSessionsQueryKey() });
        }
      }
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const type = file.type.startsWith('image/') ? 'image' : 'pdf';
    const storageUrl = file.name; // Mock storage URL

    createUpload.mutate(
      { data: { type, storageUrl } },
      {
        onSuccess: (upload) => {
          setIsUploading(false);
          if (currentSessionId) {
            sendChat.mutate(
              { data: { content: `Uploaded file: ${file.name}`, sessionId: currentSessionId, uploadId: upload.id } },
              {
                onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: getGetSessionQueryKey(currentSessionId) });
                  queryClient.invalidateQueries({ queryKey: getListSessionsQueryKey() });
                }
              }
            );
          }
        },
        onError: () => {
          setIsUploading(false);
        }
      }
    );

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          'flex flex-col border-r-3 border-black dark:border-white bg-sidebar transition-all',
          sidebarOpen ? 'w-80' : 'w-0 border-r-0'
        )}
      >
        <div className="p-4 border-b-3 border-black dark:border-white flex items-center justify-between">
          <Link href="/">
            <h1 className="text-2xl font-bold uppercase cursor-pointer hover:text-primary transition-colors" data-testid="link-home">
              AETHERA
            </h1>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2"
            data-testid="button-close-sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b-3 border-black dark:border-white">
          <BrutalButton
            variant="primary"
            className="w-full"
            onClick={handleNewSession}
            disabled={createSession.isPending}
            data-testid="button-new-session"
          >
            <Plus className="w-4 h-4" />
            NEW SESSION
          </BrutalButton>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {sessionsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              No sessions yet. Start one!
            </p>
          ) : (
            sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => setCurrentSessionId(session.id)}
                className={cn(
                  'w-full text-left p-3 border-2 border-black dark:border-white transition-all',
                  currentSessionId === session.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-white dark:bg-card hover:bg-muted'
                )}
                data-testid={`button-session-${session.id}`}
              >
                <p className="font-bold text-sm truncate mb-1">{session.title}</p>
                <div className="flex items-center justify-between gap-2 text-xs">
                  {session.subject && (
                    <BrutalBadge variant="accent" className="text-[10px] px-1.5 py-0.5">
                      {session.subject}
                    </BrutalBadge>
                  )}
                  <span className="text-muted-foreground">{session.messageCount} msgs</span>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="p-4 border-t-3 border-black dark:border-white space-y-2">
          <Link href="/history" className="block">
            <BrutalButton variant="muted" className="w-full" data-testid="button-nav-history">
              <History className="w-4 h-4" />
              HISTORY
            </BrutalButton>
          </Link>
          <Link href="/profile" className="block">
            <BrutalButton variant="muted" className="w-full" data-testid="button-nav-profile">
              <UserCircle className="w-4 h-4" />
              PROFILE
            </BrutalButton>
          </Link>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="p-4 border-b-3 border-black dark:border-white flex items-center gap-4">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2"
              data-testid="button-open-sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <div className="flex-1">
            {currentSession ? (
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold uppercase">{currentSession.title}</h2>
                {currentSession.subject && (
                  <BrutalBadge variant="primary" data-testid="badge-subject">
                    {currentSession.subject}
                  </BrutalBadge>
                )}
              </div>
            ) : (
              <h2 className="text-xl font-bold uppercase text-muted-foreground">
                SELECT A SESSION OR START A NEW ONE
              </h2>
            )}
          </div>
          <Link href="/">
            <BrutalButton variant="muted" size="sm" data-testid="button-home">
              <Home className="w-4 h-4" />
            </BrutalButton>
          </Link>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!currentSessionId ? (
            <div className="h-full flex items-center justify-center">
              <BrutalCard variant="muted" shadow="lg" className="p-12 max-w-md text-center">
                <h3 className="text-2xl font-bold mb-4 uppercase">Ready to Learn?</h3>
                <p className="mb-6">Create a new session or select one from the sidebar to start chatting with Aethera.</p>
                <BrutalButton variant="primary" onClick={handleNewSession} disabled={createSession.isPending} data-testid="button-start-session">
                  <Plus className="w-4 h-4" />
                  START SESSION
                </BrutalButton>
              </BrutalCard>
            </div>
          ) : sessionLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <BrutalCard variant="white" shadow="md" className="p-8 max-w-md text-center">
                <p className="text-lg font-medium">Start the conversation! Ask anything.</p>
              </BrutalCard>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    'flex gap-4',
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                  data-testid={`message-${msg.id}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-10 h-10 bg-accent border-3 border-black dark:border-white flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-lg">A</span>
                    </div>
                  )}
                  <BrutalCard
                    variant={msg.role === 'user' ? 'primary' : 'white'}
                    shadow="sm"
                    className={cn(
                      'p-4 max-w-2xl',
                      msg.role === 'user' ? 'text-primary-foreground' : ''
                    )}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    {msg.subject && msg.role === 'assistant' && (
                      <div className="mt-3">
                        <BrutalBadge variant="accent" className="text-[10px]">
                          {msg.subject}
                        </BrutalBadge>
                      </div>
                    )}
                  </BrutalCard>
                  {msg.role === 'user' && (
                    <div className="w-10 h-10 bg-secondary border-3 border-black dark:border-white flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-black" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        {currentSessionId && (
          <div className="p-4 border-t-3 border-black dark:border-white">
            <div className="flex gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                className="hidden"
                data-testid="input-file"
              />
              <BrutalButton
                variant="muted"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                data-testid="button-upload"
              >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              </BrutalButton>
              <BrutalInput
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask anything..."
                disabled={sendChat.isPending}
                className="flex-1"
                data-testid="input-message"
              />
              <BrutalButton
                variant="primary"
                onClick={handleSendMessage}
                disabled={!message.trim() || sendChat.isPending}
                data-testid="button-send"
              >
                {sendChat.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </BrutalButton>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
