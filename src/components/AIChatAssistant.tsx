import { useState, useRef, useEffect, forwardRef, useImperativeHandle, useCallback } from "react";
import { Send, X, Bot, User, Minimize2, Maximize2, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { useLanguage } from "@/contexts/LanguageContext";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIChatAssistantProps {
  context?: "support" | "general" | "detect";
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export interface AIChatAssistantRef {
  open: () => void;
  close: () => void;
}

const getLanguageCode = (lang: string): string => {
  const langMap: Record<string, string> = {
    en: "en-US",
    sw: "sw-KE",
    fr: "fr-FR",
    ar: "ar-SA",
  };
  return langMap[lang] || "en-US";
};

const AIChatAssistant = forwardRef<AIChatAssistantRef, AIChatAssistantProps>(
  ({ context = "general", className, isOpen: controlledOpen, onClose }, ref) => {
    const { language } = useLanguage();
    const [internalOpen, setInternalOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
      {
        role: "assistant",
        content: getWelcomeMessage(context),
      },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Controlled vs uncontrolled open state
    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setIsOpen = (value: boolean) => {
      if (controlledOpen !== undefined) {
        if (!value && onClose) onClose();
      } else {
        setInternalOpen(value);
      }
    };

    useImperativeHandle(ref, () => ({
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    }));

    function getWelcomeMessage(ctx: string): string {
      switch (ctx) {
        case "support":
          return "Hello, I'm HERA, your supportive AI companion. I'm here to listen and help you navigate difficult situations. Everything you share stays confidential. How can I support you today?";
        case "detect":
          return "Hi! I'm HERA, your digital safety assistant. I can help you understand online threats, explain how our detection system works, and provide tips for staying safe online. What would you like to know?";
        default:
          return "Hello! I'm HERA, your SafeSpace assistant. I can help you with platform features, answer questions, or just chat. How can I help you today?";
      }
    }

    useEffect(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, [messages]);

    // Voice input handler
    const handleVoiceTranscript = useCallback((text: string) => {
      setInput((prev) => prev + (prev ? " " : "") + text);
      toast.success("Voice captured!");
    }, []);

    const { isListening, isSupported: isVoiceSupported, toggleListening } = useVoiceInput({
      onTranscript: handleVoiceTranscript,
      language: getLanguageCode(language),
    });

    useEffect(() => {
      if (isOpen && inputRef.current) {
        inputRef.current.focus();
      }
    }, [isOpen]);

    const sendMessage = async () => {
      if (!input.trim() || isLoading) return;

      const userMessage = input.trim();
      setInput("");
      setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
      setIsLoading(true);

      let assistantContent = "";

      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({
              messages: [...messages.slice(1), { role: "user", content: userMessage }],
              context,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          if (response.status === 429) {
            toast.error("Too many requests. Please try again in a moment.");
          } else if (response.status === 402) {
            toast.error("Service temporarily unavailable.");
          }
          throw new Error(errorData.error || "Failed to get response");
        }

        if (!response.body) {
          throw new Error("No response body");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let textBuffer = "";

        // Add empty assistant message to start streaming
        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          textBuffer += decoder.decode(value, { stream: true });

          let newlineIndex: number;
          while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
            let line = textBuffer.slice(0, newlineIndex);
            textBuffer = textBuffer.slice(newlineIndex + 1);

            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (line.startsWith(":") || line.trim() === "") continue;
            if (!line.startsWith("data: ")) continue;

            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") break;

            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content as string | undefined;
              if (content) {
                assistantContent += content;
                setMessages((prev) => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = {
                    role: "assistant",
                    content: assistantContent,
                  };
                  return newMessages;
                });
              }
            } catch {
              textBuffer = line + "\n" + textBuffer;
              break;
            }
          }
        }
      } catch (error) {
        console.error("Chat error:", error);
        setMessages((prev) => [
          ...prev.filter((m) => m.content !== ""),
          {
            role: "assistant",
            content:
              "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    };

    const getContextColor = () => {
      switch (context) {
        case "support":
          return "bg-accent text-accent-foreground";
        case "detect":
          return "bg-secondary text-secondary-foreground";
        default:
          return "bg-primary text-primary-foreground";
      }
    };

    const getContextLabel = () => {
      switch (context) {
        case "support":
          return "Support Chat";
        case "detect":
          return "Safety Assistant";
        default:
          return "HERA Assistant";
      }
    };

    if (!isOpen) {
      return null;
    }

    return (
      <Card
        className={`fixed bottom-24 right-6 z-40 w-80 sm:w-96 shadow-2xl transition-all duration-300 ${
          isMinimized ? "h-14" : "h-[500px]"
        } ${className}`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-3 rounded-t-lg ${getContextColor()}`}
        >
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <span className="font-semibold text-sm">{getContextLabel()}</span>
            {isLoading && (
              <Badge variant="outline" className="text-xs animate-pulse">
                Typing...
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-inherit hover:bg-white/20"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? (
                <Maximize2 className="h-4 w-4" />
              ) : (
                <Minimize2 className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-inherit hover:bg-white/20"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <ScrollArea className="h-[380px] p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex items-start gap-2 max-w-[85%] ${
                        message.role === "user" ? "flex-row-reverse" : ""
                      }`}
                    >
                      <div
                        className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {message.role === "user" ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </div>
                      <div
                        className={`p-3 rounded-lg text-sm ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {message.content || (
                          <span className="animate-pulse">...</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-3 border-t">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  placeholder={isListening ? "Listening..." : "Type or speak..."}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading || isListening}
                  className="flex-1"
                />
                {isVoiceSupported && (
                  <Button
                    onClick={toggleListening}
                    disabled={isLoading}
                    size="icon"
                    variant={isListening ? "destructive" : "outline"}
                    className={isListening ? "animate-pulse" : ""}
                    title={isListening ? "Stop listening" : "Start voice input"}
                  >
                    {isListening ? (
                      <MicOff className="h-4 w-4" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>
                )}
                <Button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {isVoiceSupported 
                  ? "Confidential • Secure • Voice & Text"
                  : "Confidential • Secure • Here to help"
                }
              </p>
            </div>
          </>
        )}
      </Card>
    );
  }
);

AIChatAssistant.displayName = "AIChatAssistant";

export default AIChatAssistant;
