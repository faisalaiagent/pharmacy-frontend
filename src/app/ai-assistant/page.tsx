"use client";
// src/app/ai-assistant/page.tsx
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Search, HeartPulse, ShoppingBag, Bot, User, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/products/ProductCard";
import { aiApi } from "@/lib/api";
import type { Product } from "@/types";

interface Message {
  role: "user" | "assistant";
  content: string;
  products?: Product[];
  conversationId?: string;
}

function ChatInterface({
  title, placeholder, onSend, icon: Icon, color,
}: {
  title: string;
  placeholder: string;
  onSend: (query: string, conversationId?: string) => Promise<{ text: string; products?: Product[]; conversationId?: string }>;
  icon: React.ElementType;
  color: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const query = input.trim();
    if (!query || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: query }]);
    setLoading(true);
    try {
      const result = await onSend(query, conversationId);
      if (result.conversationId) setConversationId(result.conversationId);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: result.text, products: result.products },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I'm having trouble responding right now. Please try again shortly." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3">
            <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center`}>
              <Icon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">{title}</h3>
              <p className="text-sm text-gray-500 mt-1">{placeholder}</p>
            </div>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === "user" ? "bg-sky-500" : `${color}`
              }`}>
                {msg.role === "user" ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>
              <div className={`max-w-[80%] space-y-3 ${msg.role === "user" ? "items-end" : ""}`}>
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                  msg.role === "user"
                    ? "bg-sky-500 text-white rounded-tr-sm"
                    : "bg-white border text-gray-700 rounded-tl-sm shadow-sm"
                }`}>
                  {msg.content}
                </div>
                {msg.products && msg.products.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 w-full">
                    {msg.products.slice(0, 4).map((product) => (
                      <ProductCard key={product.id} product={product} className="text-xs" />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="flex gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${color}`}>
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white border rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            className="flex-1"
            disabled={loading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="bg-sky-500 hover:bg-sky-600 text-white shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          For educational purposes only. Always consult a licensed pharmacist or doctor.
        </p>
      </div>
    </div>
  );
}

export default function AIAssistantPage() {
  const handleMedicineSearch = async (query: string) => {
    const res = await aiApi.searchMedicine(query);
    return {
      text: res.data.data.ai_response,
      products: res.data.data.products,
      conversationId: res.data.data.conversation_id,
    };
  };

  const handleHealthInfo = async (question: string, conversationId?: string) => {
    const res = await aiApi.getHealthInfo(question, conversationId);
    return {
      text: res.data.data.answer,
      conversationId: res.data.data.conversation_id,
    };
  };

  const handleRecommendations = async (query: string) => {
    const res = await aiApi.getRecommendations(query);
    return {
      text: res.data.data.recommendations,
      products: res.data.data.products,
      conversationId: res.data.data.conversation_id,
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-teal-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border shadow-sm mb-4">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span className="text-sm font-medium text-gray-700">Powered by Groq AI</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Health Assistant</h1>
          <p className="text-gray-500 max-w-lg mx-auto text-sm">
            Search medicines in natural language, learn about side effects, and get
            personalised health product recommendations — instantly.
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <Tabs defaultValue="search">
            <TabsList className="w-full grid grid-cols-3 rounded-none border-b h-auto p-0 bg-gray-50">
              {[
                { value: "search", label: "Medicine Search", icon: Search, color: "text-sky-600" },
                { value: "health", label: "Health Info", icon: HeartPulse, color: "text-teal-600" },
                { value: "recommend", label: "Recommendations", icon: ShoppingBag, color: "text-violet-600" },
              ].map(({ value, label, icon: Icon, color }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="flex items-center gap-2 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-sky-500 data-[state=active]:bg-white"
                >
                  <Icon className={`w-4 h-4 ${color}`} />
                  <span className="hidden sm:inline text-sm">{label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="search" className="m-0">
              <ChatInterface
                title="Medicine Search"
                placeholder='Try "medicine for fever" or "what is paracetamol used for"'
                onSend={handleMedicineSearch}
                icon={Search}
                color="bg-sky-500"
              />
            </TabsContent>

            <TabsContent value="health" className="m-0">
              <ChatInterface
                title="Health Information"
                placeholder='Ask "what are the side effects of ibuprofen?" or "how to take antibiotics"'
                onSend={handleHealthInfo}
                icon={HeartPulse}
                color="bg-teal-500"
              />
            </TabsContent>

            <TabsContent value="recommend" className="m-0">
              <ChatInterface
                title="Product Recommendations"
                placeholder='Try "vitamins for immunity" or "products for diabetes management"'
                onSend={handleRecommendations}
                icon={ShoppingBag}
                color="bg-violet-500"
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Disclaimer */}
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-xs text-amber-700 text-center">
            ⚕️ <strong>Medical Disclaimer:</strong> AI responses are for informational purposes only.
            Always consult a qualified doctor or licensed pharmacist before taking any medication.
            Do not use this service to self-diagnose or self-medicate.
          </p>
        </div>
      </div>
    </div>
  );
}
