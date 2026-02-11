import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Bot, User, Zap, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AIMessage, MicroWin } from '@/types/gamification';
import { MicroWinCard } from './MicroWinCard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AIChatProps {
  messages: AIMessage[];
  onSendMessage: (message: string) => void;
  onMicroWinComplete?: (microWin: MicroWin) => void;
  isLoading?: boolean;
  className?: string;
}

export const AIChat: React.FC<AIChatProps> = ({
  messages: propMessages,
  onSendMessage,
  onMicroWinComplete,
  isLoading: propIsLoading = false,
  className
}) => {
  const [inputValue, setInputValue] = useState('');
  const [history, setHistory] = useState<AIMessage[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Combine prop messages (new ones) with history
  // In a real app, parent should probably manage all this, but we'll merge here for now
  const allMessages = [...history, ...propMessages];

  // Load chat history on mount
  useEffect(() => {
    const loadHistory = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsLoadingHistory(false);
        return;
      }

      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) {
        console.error('Error loading chat history:', error);
      } else if (data) {
        const historyMessages: AIMessage[] = data.map(msg => ({
          id: msg.id,
          text: msg.content,
          sender: msg.role === 'assistant' ? 'ai' : 'user',
          timestamp: new Date(msg.created_at)
        }));
        setHistory(historyMessages);
      }
      setIsLoadingHistory(false);
    };

    loadHistory();
  }, []);

  // Save NEW messages to DB (propMessages changes)
  useEffect(() => {
    const saveLastMessage = async () => {
      const lastMsg = propMessages[propMessages.length - 1];
      if (!lastMsg) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Check if we already saved this ID to avoid dupes (simple check)
      const isAlreadyInHistory = history.some(h => h.id === lastMsg.id);
      if (isAlreadyInHistory) return;

      const role = lastMsg.sender === 'ai' ? 'assistant' : 'user';

      const { error } = await supabase
        .from('chat_history')
        .insert({
          user_id: session.user.id,
          role,
          content: lastMsg.text,
          metadata: { xpEarned: lastMsg.xpEarned }
        });

      if (error) {
        console.error('Error saving chat:', error);
      }
    };

    saveLastMessage();
  }, [propMessages, history]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [allMessages, isLoadingHistory, propIsLoading]);

  const handleSend = () => {
    if (inputValue.trim() && !propIsLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className={cn('flex flex-col h-full shadow-card', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <div className="relative">
            <Bot className="h-5 w-5 text-primary" />
            <div className="absolute -top-1 -right-1 h-2 w-2 bg-energy-high rounded-full animate-pulse" />
          </div>
          <span>Elite AI Coach</span>
          <div className="ml-auto text-xs bg-gradient-primary text-primary-foreground px-2 py-1 rounded-full">
            Dubai Executive
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-4 space-y-4">
        {/* Messages Area */}
        <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {isLoadingHistory ? (
              <div className="text-center text-sm text-muted-foreground py-4">
                Decrypting secure history...
              </div>
            ) : allMessages.length === 0 ? (
               <div className="text-center py-8 space-y-3">
                <Bot className="h-12 w-12 text-primary mx-auto" />
                <div>
                  <h3 className="font-semibold text-foreground">Ready to elevate your energy?</h3>
                  <p className="text-sm text-muted-foreground">
                    I'm your AI coach, trained on 15 years of Dubai executive transformations.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {[
                    "I need energy for my 3 PM meeting",
                    "Quick 2-minute desk workout?",
                    "Best time to exercise in Dubai heat?"
                  ].map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      size="sm"
                      onClick={() => onSendMessage(suggestion)}
                      className="text-xs"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
                allMessages.map((message) => (
              <div key={message.id || Math.random()} className="space-y-3">
                {/* Message Bubble */}
                <div className={cn(
                  'flex gap-3',
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                )}>
                  {message.sender === 'ai' && (
                    <Avatar className="h-8 w-8 bg-gradient-primary">
                      <AvatarFallback>
                        <Bot className="h-4 w-4 text-primary-foreground" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className={cn(
                    'max-w-[80%] p-3 rounded-lg',
                    message.sender === 'user' 
                      ? 'bg-primary text-primary-foreground ml-auto' 
                      : 'bg-secondary text-secondary-foreground'
                  )}>
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    
                    {/* XP Earned Badge */}
                    {message.xpEarned && (
                      <div className="flex items-center gap-1 mt-2 text-xs">
                        <Star className="h-3 w-3 text-xp" />
                        <span className="text-xp font-bold">+{message.xpEarned} XP</span>
                      </div>
                    )}
                  </div>

                  {message.sender === 'user' && (
                    <Avatar className="h-8 w-8 bg-gradient-success">
                      <AvatarFallback>
                        <User className="h-4 w-4 text-foreground" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>

                {/* Micro Win Card */}
                {message.microWin && (
                  <MicroWinCard 
                    microWin={message.microWin}
                    onComplete={(microWin) => onMicroWinComplete?.(microWin)}
                  />
                )}
              </div>
            )))}

            {/* Loading indicator */}
            {propIsLoading && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 bg-gradient-primary">
                  <AvatarFallback>
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-secondary text-secondary-foreground p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 bg-primary rounded-full animate-bounce" />
                      <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                    <span className="text-xs text-muted-foreground">Analyzing your energy...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask your AI coach anything..."
            disabled={propIsLoading}
            className="flex-1"
          />
          <Button 
            onClick={handleSend}
            disabled={!inputValue.trim() || propIsLoading}
            size="icon"
            className="shrink-0"
          >
            {propIsLoading ? (
              <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
