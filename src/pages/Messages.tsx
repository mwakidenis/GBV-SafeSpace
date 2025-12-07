import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Send, UserCircle, Shield, Video } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import VideoCallInterface from "@/components/VideoCallInterface";

interface Conversation {
  id: string;
  participant_1_id: string;
  participant_2_id: string;
  is_anonymous: boolean;
  updated_at: string;
  unread_count?: number;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

const Messages = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [showVideoCall, setShowVideoCall] = useState(false);

  useEffect(() => {
    // Wait for auth to finish loading before checking user
    if (authLoading) return;
    
    if (!user) {
      navigate("/auth");
      return;
    }
    loadConversations();
    setupRealtimeSubscription();
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
      markMessagesAsRead(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel("private-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "private_messages",
        },
        (payload) => {
          const newMsg = payload.new as Message;
          if (selectedConversation?.id === newMsg.conversation_id) {
            setMessages((prev) => [...prev, newMsg]);
            markMessagesAsRead(newMsg.conversation_id);
          }
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const loadConversations = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)
      .order("updated_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
      return;
    }

    // Load unread counts
    const conversationsWithUnread = await Promise.all(
      (data || []).map(async (conv) => {
        const { count } = await supabase
          .from("private_messages")
          .select("*", { count: "exact", head: true })
          .eq("conversation_id", conv.id)
          .eq("is_read", false)
          .neq("sender_id", user.id);

        return { ...conv, unread_count: count || 0 };
      })
    );

    setConversations(conversationsWithUnread);
    setLoading(false);
  };

  const loadMessages = async (conversationId: string) => {
    const { data, error } = await supabase
      .from("private_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
      return;
    }

    setMessages(data || []);
  };

  const markMessagesAsRead = async (conversationId: string) => {
    if (!user) return;

    await supabase
      .from("private_messages")
      .update({ is_read: true })
      .eq("conversation_id", conversationId)
      .neq("sender_id", user.id)
      .eq("is_read", false);
  };

  const handleSendMessage = async () => {
    if (!user || !selectedConversation || !newMessage.trim()) return;

    const { error } = await supabase.from("private_messages").insert({
      conversation_id: selectedConversation.id,
      sender_id: user.id,
      content: newMessage,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
      return;
    }

    // Update conversation timestamp
    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", selectedConversation.id);

    setNewMessage("");
    loadConversations();
  };

  const getOtherParticipantId = (conv: Conversation) => {
    return conv.participant_1_id === user?.id
      ? conv.participant_2_id
      : conv.participant_1_id;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading messages...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <MessageCircle className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Private Messages</h1>
          </div>
          <p className="text-muted-foreground">
            Connect with others in a safe, anonymous space
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 h-[600px]">
          {/* Conversations List */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Conversations</CardTitle>
              <CardDescription>Your private chats</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[480px]">
                {conversations.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No conversations yet. Start by messaging someone from the forum!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {conversations.map((conv) => (
                      <div
                        key={conv.id}
                        onClick={() => setSelectedConversation(conv)}
                        className={`p-3 rounded-lg cursor-pointer transition-all ${
                          selectedConversation?.id === conv.id
                            ? "bg-primary/10 border-primary"
                            : "hover:bg-muted"
                        } border`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            {conv.is_anonymous ? (
                              <>
                                <UserCircle className="h-4 w-4" />
                                <span className="text-sm font-medium">Anonymous User</span>
                              </>
                            ) : (
                              <span className="text-sm font-medium">Community Member</span>
                            )}
                          </div>
                          {conv.unread_count! > 0 && (
                            <Badge variant="default" className="h-5 w-5 p-0 flex items-center justify-center">
                              {conv.unread_count}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(conv.updated_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Messages Area */}
          <Card className="md:col-span-2">
            {selectedConversation ? (
              <>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {selectedConversation.is_anonymous ? (
                        <>
                          <Shield className="h-5 w-5 text-primary" />
                          <CardTitle>Anonymous Conversation</CardTitle>
                        </>
                      ) : (
                        <CardTitle>Private Conversation</CardTitle>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowVideoCall(true)}
                      className="gap-2"
                    >
                      <Video className="h-4 w-4" />
                      Video Call
                    </Button>
                  </div>
                  <CardDescription>
                    End-to-end privacy • No identifying information shared
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col h-[480px]">
                  <ScrollArea className="flex-1 pr-4">
                    <div className="space-y-4">
                      {messages.map((msg) => {
                        const isOwn = msg.sender_id === user?.id;
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[80%] p-3 rounded-lg ${
                                isOwn
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              <p className="text-sm">{msg.content}</p>
                              <p className="text-xs opacity-70 mt-1">
                                {new Date(msg.created_at).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    />
                    <Button onClick={handleSendMessage} size="icon">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">
                  Select a conversation to start messaging
                </p>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
      
      {showVideoCall && selectedConversation && (
        <VideoCallInterface
          conversationId={selectedConversation.id}
          onClose={() => setShowVideoCall(false)}
        />
      )}
    </div>
  );
};

export default Messages;