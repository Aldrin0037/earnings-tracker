"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  MessageCircle,
  X,
  Send,
  Mic,
  MicOff,
  Loader2,
  Trash2,
  Bot,
  User
} from "lucide-react";
import {
  sendMessageToGemini,
  parseAIAction,
  isGeminiConfigured,
  ChatMessage as GeminiChatMessage
} from "@/lib/gemini";
import {
  getChatHistory,
  addChatMessage,
  clearChatHistory
} from "@/lib/chatStorage";
import {
  listRecords,
  saveRecord,
  deleteRecord,
  DailyRecord
} from "@/lib/storage";
import { calculateBookingPay, calculateTotalEarnings } from "@/lib/calculations";

interface AIChatProps {
  onRecordAdded?: () => void;
  onRecordDeleted?: () => void;
}

export function AIChat({ onRecordAdded, onRecordDeleted }: AIChatProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<GeminiChatMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isListening, setIsListening] = React.useState(false);
  const [pendingAction, setPendingAction] = React.useState<any>(null);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const recognitionRef = React.useRef<any>(null);

  // Load chat history on mount (client-side only)
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const history = getChatHistory();
      setMessages(history);
    }
  }, []);

  // Auto-scroll to bottom
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize speech recognition
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setIsListening(false);
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    if (!isGeminiConfigured()) {
      alert("Gemini AI is not configured. Please add your NEXT_PUBLIC_GEMINI_API_KEY to .env.local file.");
      return;
    }

    const userMessage = input.trim();
    setInput("");

    // Add user message
    const userMsg = addChatMessage({
      role: "user",
      content: userMessage,
    });
    setMessages(prev => [...prev, userMsg]);

    setIsLoading(true);

    try {
      // Get all records for context
      const records = await listRecords();

      // Send to Gemini
      const response = await sendMessageToGemini(userMessage, records, messages);

      // Parse for actions
      const parsed = parseAIAction(response);

      // Add AI response
      const aiMsg = addChatMessage({
        role: "assistant",
        content: parsed.cleanResponse || parsed.message,
      });
      setMessages(prev => [...prev, aiMsg]);

      // Handle actions
      if (parsed.hasAction && parsed.action) {
        if (parsed.action.needsConfirmation) {
          setPendingAction(parsed.action);
        } else {
          await executeAction(parsed.action);
        }
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      const errorMsg = addChatMessage({
        role: "assistant",
        content: `Sorry, I encountered an error: ${error.message || "Unknown error"}. Please try again.`,
      });
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const executeAction = async (action: any) => {
    try {
      if (action.type === "add_record") {
        // Add record
        const { date, bookings, notes } = action.data;
        const settings = await import("@/lib/storage").then(m => m.getSettings());

        const bookingPay = calculateBookingPay(bookings, settings.perBooking);
        const inquiryPay = settings.basePay;
        const totalEarnings = calculateTotalEarnings(settings.basePay, bookingPay, 0);

        const record: Omit<DailyRecord, "id" | "createdAt"> = {
          date,
          basePay: settings.basePay,
          bookings,
          bookingPay,
          inquiryPay,
          totalEarnings,
          advanceUsed: 0,
          remaining: 0,
          notes: notes || "",
          action: "",
        };

        await saveRecord(record);

        const confirmMsg = addChatMessage({
          role: "assistant",
          content: `✅ Record added successfully! You earned ₱${totalEarnings.toFixed(2)} on ${date}.`,
        });
        setMessages(prev => [...prev, confirmMsg]);

        if (onRecordAdded) onRecordAdded();
      } else if (action.type === "delete_record") {
        // Delete record
        const records = await listRecords();
        const recordToDelete = records.find(r => r.date === action.data.date);

        if (recordToDelete) {
          await deleteRecord(recordToDelete.id);

          const confirmMsg = addChatMessage({
            role: "assistant",
            content: `✅ Record deleted successfully from ${action.data.date}.`,
          });
          setMessages(prev => [...prev, confirmMsg]);

          if (onRecordDeleted) onRecordDeleted();
        }
      }

      setPendingAction(null);
    } catch (error: any) {
      console.error("Action execution error:", error);
      const errorMsg = addChatMessage({
        role: "assistant",
        content: `Failed to execute action: ${error.message}`,
      });
      setMessages(prev => [...prev, errorMsg]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear all chat history?")) {
      clearChatHistory();
      setMessages([]);
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg"
          onClick={() => setIsOpen(true)}
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]">
      <Card className="shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Assistant
          </CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleClearHistory}
              title="Clear chat history"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Messages */}
          <div className="h-96 overflow-y-auto space-y-3 pr-2">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <Bot className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Hi! I'm your AI assistant.</p>
                <p className="text-sm mt-2">Ask me about your earnings, or tell me to add/delete records!</p>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="flex-shrink-0">
                    <Bot className="h-6 w-6 text-primary" />
                  </div>
                )}
                <div
                  className={`rounded-lg px-3 py-2 max-w-[80%] ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p className="text-xs opacity-60 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                {msg.role === "user" && (
                  <div className="flex-shrink-0">
                    <User className="h-6 w-6" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 justify-start">
                <Bot className="h-6 w-6 text-primary" />
                <div className="bg-muted rounded-lg px-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}

            {/* Pending action confirmation */}
            {pendingAction && (
              <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded-lg p-3">
                <p className="text-sm font-semibold mb-2">Confirm Action</p>
                <p className="text-sm mb-3">
                  {pendingAction.type === "delete_record"
                    ? `Delete record from ${pendingAction.data.date}?`
                    : "Proceed with this action?"}
                </p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => executeAction(pendingAction)}>
                    Confirm
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPendingAction(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <Button
              size="icon"
              variant={isListening ? "destructive" : "outline"}
              onClick={toggleListening}
              disabled={isLoading}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isListening ? "Listening..." : "Ask me anything..."}
              disabled={isLoading || isListening}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>

          {!isGeminiConfigured() && (
            <p className="text-xs text-destructive">
              ⚠️ Gemini API not configured. Add NEXT_PUBLIC_GEMINI_API_KEY to .env.local
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
