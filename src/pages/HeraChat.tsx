import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, User, Mic, MicOff, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { useLanguage } from "@/contexts/LanguageContext";

interface Message {
  role: "user" | "assistant";
  content: string;
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

const getWelcomeMessage = (ctx: string): string => {
  switch (ctx) {
    case "support":
      return "Hello, I'm HERA, your supportive AI companion. I'm here to listen and help you navigate difficult situations. Everything you share stays confidential. How can I support you today?";
    case "detect":
      return "Hi! I'm HERA, your digital safety assistant. I can help you understand online threats, explain how our detection system works, and provide tips for staying safe online. What would you like to know?";
    default:
      return "Hello! I'm HERA, your SafeSpace assistant. I can help you with platform features, answer questions, or just chat. How can I help you today?";
  }
};

const HeraChat = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const context = (searchParams.get("context") as "support" | "general" | "detect") || "support";
  const { language, dir } = useLanguage();
  
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: getWelcomeMessage(context) },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleVoiceTranscript = useCallback((text: string) => {
    setInput((prev) => prev + (prev ? " " : "") + text);
    toast.success("Voice captured!");
  }, []);

  const { isListening, isSupported: isVoiceSupported, toggleListening } = useVoiceInput({
    onTranscript: handleVoiceTranscript,
    language: getLanguageCode(language),
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

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
          content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
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

  const getContextInfo = () => {
    switch (context) {
      case "support":
        return {
          title: "HERA Support Chat",
          subtitle: "Confidential emotional support",
          color: "bg-accent text-accent-foreground",
        };
      case "detect":
        return {
          title: "HERA Safety Assistant",
          subtitle: "Digital safety guidance",
          color: "bg-secondary text-secondary-foreground",
        };
      default:
        return {
          title: "HERA Assistant",
          subtitle: "Your SafeSpace companion",
          color: "bg-primary text-primary-foreground",
        };
    }
  };

  const contextInfo = getContextInfo();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20" dir={dir}>
      <Navigation />

      <main className="container mx-auto px-4 pt-20 pb-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="flex-shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-full ${contextInfo.color}`}>
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{contextInfo.title}</h1>
              <p className="text-sm text-muted-foreground">{contextInfo.subtitle}</p>
            </div>
          </div>
          {isLoading && (
            <Badge variant="outline" className="ml-auto animate-pulse">
              HERA is typing...
            </Badge>
          )}
        </div>

        {/* Chat Card */}
        <Card className="flex flex-col h-[calc(100vh-200px)] min-h-[400px]">
          {/* Messages */}
          <ScrollArea className="flex-1 p-4 md:p-6" ref={scrollRef}>
            <div className="space-y-4 max-w-3xl mx-auto">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex items-start gap-3 max-w-[85%] ${
                      message.role === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : contextInfo.color
                      }`}
                    >
                      {message.role === "user" ? (
                        <User className="h-5 w-5" />
                      ) : (
                        <Bot className="h-5 w-5" />
                      )}
                    </div>
                    <div
                      className={`p-4 rounded-2xl text-sm leading-relaxed ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground rounded-tr-sm"
                          : "bg-muted rounded-tl-sm"
                      }`}
                    >
                      {message.content || <span className="animate-pulse">...</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 md:p-6 border-t bg-card">
            <div className="flex gap-3 max-w-3xl mx-auto">
              <Input
                ref={inputRef}
                placeholder={isListening ? "Listening..." : "Type your message or use voice..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading || isListening}
                className="flex-1 h-12 text-base"
              />
              {isVoiceSupported && (
                <Button
                  onClick={toggleListening}
                  disabled={isLoading}
                  size="icon"
                  variant={isListening ? "destructive" : "outline"}
                  className={`h-12 w-12 ${isListening ? "animate-pulse" : ""}`}
                  title={isListening ? "Stop listening" : "Start voice input"}
                >
                  {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>
              )}
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="h-12 w-12"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              {isVoiceSupported
                ? "🔒 Confidential • 🎤 Voice & Text • 💜 Here to help"
                : "🔒 Confidential • 💬 Secure • 💜 Here to help"}
            </p>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default HeraChat;
