import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export function AIChatbot() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  // Não mostrar o chatbot nas páginas de auth e public-report
  const hiddenPaths = ['/auth', '/reset-password', '/public-report'];
  const shouldShow = !hiddenPaths.includes(location.pathname);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Olá! Sou seu assistente de IA integrado com Gemini. Posso responder sobre atividades, comentários, fotos e relatórios do projeto. Como posso ajudá-lo?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = inputValue;
    setInputValue('');
    setIsTyping(true);

    try {
      // Enviar mensagem para a edge function com Gemini AI
      console.log('Enviando mensagem para AI...');
      
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { 
          messages: [
            { role: 'user', content: messageText }
          ]
        }
      });

      console.log('Resposta recebida:', { data, error });

      if (error) {
        console.error('Erro da função:', error);
        throw error;
      }

      let aiResponseText = data?.response || 'Desculpe, não consegui processar sua mensagem.';
      
      // Verificar se há erro de rate limit ou créditos
      if (data?.error) {
        aiResponseText = data.error;
      }

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      
      // Mensagem mais específica para ajudar no debug
      let errorMessage = 'Desculpe, ocorreu um erro ao processar sua mensagem.';
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = 'A função de IA ainda está sendo configurada. Por favor, aguarde alguns instantes e tente novamente.';
        } else {
          errorMessage = `Erro: ${error.message}`;
        }
      }
      
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: errorMessage,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!shouldShow) return null;

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <Card className={cn(
          "fixed w-80 h-96 shadow-lg border animate-fade-in z-40",
          "bottom-20 right-4 md:bottom-4 md:right-4",
          "flex flex-col"
        )}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground rounded-t-lg">
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary-foreground text-primary">
                  <Bot className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-sm">Assistente IA</h3>
                <p className="text-xs opacity-90">Online</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-2",
                    message.isUser ? "justify-end" : "justify-start"
                  )}
                >
                  {!message.isUser && (
                    <Avatar className="w-6 h-6 mt-1">
                      <AvatarFallback className="bg-muted">
                        <Bot className="w-3 h-3" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "max-w-[70%] rounded-lg p-3 text-sm",
                      message.isUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <p className="leading-relaxed">{message.text}</p>
                    <p className={cn(
                      "text-xs mt-1 opacity-70",
                      message.isUser ? "text-right" : "text-left"
                    )}>
                      {message.timestamp.toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  {message.isUser && (
                    <Avatar className="w-6 h-6 mt-1">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <User className="w-3 h-3" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className="flex gap-2 justify-start">
                  <Avatar className="w-6 h-6 mt-1">
                    <AvatarFallback className="bg-muted">
                      <Bot className="w-3 h-3" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg p-3 text-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-100"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-200"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                placeholder="Digite sua mensagem..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                size="sm"
                className="px-3"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Float Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed w-12 h-12 rounded-full shadow-lg z-50 animate-scale-in",
          "bottom-20 right-4 md:bottom-6 md:right-6",
          "bg-primary hover:bg-primary/90 text-primary-foreground"
        )}
        size="sm"
      >
        {isOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <MessageCircle className="w-5 h-5" />
        )}
      </Button>
    </>
  );
}