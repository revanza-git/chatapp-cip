"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ChatMessage } from "./ChatMessage";
import { sendChatMessage } from "@/lib/api";
import { ChatMessage as ChatMessageType } from "@/lib/types";
import { Send, Shield, Bot, Loader2 } from "lucide-react";

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isClient, setIsClient] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageIdCounter = useRef(0);

  // Initialize client-side state after hydration
  useEffect(() => {
    setIsClient(true);
    setMessages([
      {
        id: "welcome-message",
        content:
          "Hello! I'm your IT Security Policy Assistant. I can help you with security questions, policy information, and onboarding guidance. Just type your question and I'll provide assistance!",
        role: "assistant",
        timestamp: new Date(),
        type: "general",
      },
    ]);
  }, []);

  const generateMessageId = () => {
    messageIdCounter.current += 1;
    return `msg-${messageIdCounter.current}-${Date.now()}`;
  };

  const chatMutation = useMutation({
    mutationFn: sendChatMessage,
    onSuccess: (response) => {
      // Remove loading message
      setMessages((prev) => prev.filter(msg => msg.id !== 'loading-message'));
      
      const assistantMessage: ChatMessageType = {
        id: generateMessageId(),
        content: response.response,
        role: "assistant",
        timestamp: new Date(),
        type: response.type || "general",
        policyFiles: response.policy_files,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    },
    onError: () => {
      // Remove loading message
      setMessages((prev) => prev.filter(msg => msg.id !== 'loading-message'));
      
      const errorMessage: ChatMessageType = {
        id: generateMessageId(),
        content:
          "Sorry, I encountered an error. Please make sure the backend server is running and try again.",
        role: "assistant",
        timestamp: new Date(),
        type: "general",
      };
      setMessages((prev) => [...prev, errorMessage]);
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage: ChatMessageType = {
      id: generateMessageId(),
      content: currentMessage,
      role: "user",
      timestamp: new Date(),
      type: "general", // Type will be auto-detected by backend
    };

    // Add loading message
    const loadingMessage: ChatMessageType = {
      id: "loading-message",
      content: "AI is thinking...",
      role: "assistant",
      timestamp: new Date(),
      type: "general",
    };

    setMessages((prev) => [...prev, userMessage, loadingMessage]);

    chatMutation.mutate({
      message: currentMessage,
      // No type provided - backend will auto-detect
    });

    setCurrentMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };


  // Don't render messages until client-side hydration is complete
  if (!isClient) {
    return (
      <div className="w-full max-w-7xl mx-auto flex flex-col h-full">
        <Card className="flex-1 flex flex-col h-full shadow-lg">
          <CardHeader className="flex-shrink-0">
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-600" />
              IT Security Policy Assistant
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">Loading...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col h-full">
      <Card className="flex-1 flex flex-col h-full shadow-lg">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            IT Security Policy Assistant
          </CardTitle>

        </CardHeader>

        <Separator />

        {/* Messages Area */}
        <CardContent className="flex-1 overflow-y-auto p-4 min-h-0">
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>

        <Separator />

        {/* Input Area */}
        <CardContent className="flex-shrink-0 p-4">
          <div className="flex gap-2">
            <Input
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about security policies, onboarding, or any IT security question..."
              disabled={chatMutation.isPending}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={
                !currentMessage.trim() || chatMutation.isPending
              }
              className="flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {chatMutation.isPending ? "Sending..." : "Send"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
