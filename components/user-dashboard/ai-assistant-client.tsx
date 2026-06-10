"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Rocket, Sparkles, Loader2, CheckCircle2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Agent = {
  id: string;
  name: string;
  description: string | null;
};

type LaunchConfig = {
  action: string;
  niche?: string;
  audience?: string;
  location?: string;
  subject?: string;
  body?: string;
};

function getAgentEmoji(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("job") || n.includes("apply")) return "💼";
  if (n.includes("real estate") || n.includes("property")) return "🏠";
  if (n.includes("ecommerce") || n.includes("store") || n.includes("e-commerce")) return "🛒";
  if (n.includes("marketing")) return "📣";
  return "🤖";
}

function getAgentSuggestions(name: string): string[] {
  const n = name.toLowerCase();
  if (n.includes("job") || n.includes("apply")) {
    return [
      "Help me write a cold email to a recruiter at a tech startup",
      "What subject line works best for job application outreach?",
      "Launch a campaign targeting software engineering recruiters in San Francisco",
    ];
  }
  if (n.includes("real estate") || n.includes("property")) {
    return [
      "Write an outreach email to property managers in New York",
      "Help me target real estate agents in Austin, TX",
      "Launch a campaign for property buyers in Dubai",
    ];
  }
  if (n.includes("ecommerce") || n.includes("store")) {
    return [
      "Write a supplier outreach email for Shopify store owners",
      "Help me find dropshipping contacts in Los Angeles",
      "Launch a campaign targeting Amazon sellers in the UK",
    ];
  }
  return [
    "Help me write a cold email campaign for my SaaS product",
    "Find marketing directors to reach out to in London",
    "Launch a campaign targeting restaurant owners in New York",
  ];
}

export default function AIAssistantPage() {
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [pendingLaunch, setPendingLaunch] = useState<LaunchConfig | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    async function fetchAgents() {
      try {
        const res = await fetch("/api/agents");
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            setAgents(data);
            setSelectedAgent(data[0]);
          } else {
            const defaultAgent = { id: "default", name: "Marketing Agent", description: "Find leads and send cold emails" };
            setAgents([defaultAgent]);
            setSelectedAgent(defaultAgent);
          }
        }
      } catch (_) {}
    }
    fetchAgents();
  }, []);

  useEffect(() => {
    if (selectedAgent) {
      // Reset conversation when switching agents
      setMessages([]);
      setPendingLaunch(null);
    }
  }, [selectedAgent?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (content?: string) => {
    const text = content || input.trim();
    if (!text || loading) return;

    const userMessage: Message = { role: "user", content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          agentId: selectedAgent?.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to get AI response");
        setLoading(false);
        return;
      }

      setMessages([...newMessages, { role: "assistant", content: data.reply }]);
      if (data.launchConfig) {
        setPendingLaunch(data.launchConfig);
      }
    } catch (_) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLaunchCampaign = async () => {
    if (!pendingLaunch) return;
    setLaunching(true);

    try {
      // Generate AI email content if we don't have it
      let subject = pendingLaunch.subject || "";
      let body = pendingLaunch.body || "";

      if (!subject || !body) {
        const emailRes = await fetch("/api/ai/generate-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            niche: pendingLaunch.niche || selectedAgent?.name || "business",
            audience: pendingLaunch.audience || "business owners",
            location: pendingLaunch.location || "United States",
            isABTesting: false,
          }),
        });
        if (emailRes.ok) {
          const emailData = await emailRes.json();
          subject = emailData.subjectA || subject;
          body = emailData.contentA || body;
        }
      }

      // Launch the campaign
      const launchRes = await fetch("/api/campaigns/launch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          niche: pendingLaunch.niche || selectedAgent?.name || "business",
          audience: pendingLaunch.audience || "business owners",
          location: pendingLaunch.location || "United States",
          leadCount: 50,
          subjectA: subject,
          contentA: body,
          isABTesting: false,
        }),
      });

      const launchData = await launchRes.json();

      if (!launchRes.ok) {
        toast.error(launchData.error || "Failed to launch campaign");
        setLaunching(false);
        return;
      }

      toast.success("Campaign launched! Redirecting to tracker...");
      setPendingLaunch(null);

      // Navigate to campaigns page to see progress
      setTimeout(() => router.push("/user-dashboard/campaigns/new"), 1500);
    } catch (_) {
      toast.error("Launch failed. Please try again.");
    } finally {
      setLaunching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestions = selectedAgent ? getAgentSuggestions(selectedAgent.name) : [];
  const emoji = selectedAgent ? getAgentEmoji(selectedAgent.name) : "🤖";

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col bg-gray-50 dark:bg-gray-950">
      {/* Agent selector bar */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-3 flex items-center gap-4">
        <span className="text-sm text-gray-500 font-medium shrink-0">Active Agent:</span>
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {agents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => setSelectedAgent(agent)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
                selectedAgent?.id === agent.id
                  ? "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-200"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-emerald-400"
              }`}
            >
              <span>{getAgentEmoji(agent.name)}</span>
              <span>{agent.name}</span>
              {selectedAgent?.id === agent.id && <CheckCircle2 size={12} />}
            </button>
          ))}
        </div>
        <button
          onClick={() => { setMessages([]); setPendingLaunch(null); }}
          className="ml-auto text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-lg hover:bg-gray-100"
          title="Clear conversation"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {/* Welcome message if no messages */}
        {messages.length === 0 && selectedAgent && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-xl">
                  {emoji}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">{selectedAgent.name}</div>
                  <div className="text-xs text-gray-500">{selectedAgent.description || "AI-powered automation agent"}</div>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                Hi! I'm your <strong>{selectedAgent.name}</strong>. I can help you craft outreach emails, find your target audience, and launch automated campaigns. Just tell me what you want to achieve!
              </p>
            </div>

            {/* Suggestion chips */}
            <div className="space-y-2">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider px-1">Try asking:</p>
              {suggestions.map((s, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => sendMessage(s)}
                  className="w-full text-left px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:border-emerald-400 hover:bg-emerald-50/30 transition-all flex items-center gap-3 shadow-sm"
                >
                  <Sparkles size={14} className="text-emerald-500 shrink-0" />
                  {s}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Messages */}
        <div className="max-w-2xl mx-auto space-y-4">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-emerald-50 border border-emerald-100 text-lg"
                }`}>
                  {msg.role === "user" ? <User size={14} /> : emoji}
                </div>
                <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-tr-sm"
                    : "bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-800 rounded-tl-sm shadow-sm"
                }`}>
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-lg shrink-0">
                {emoji}
              </div>
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </motion.div>
          )}

          {/* Launch Campaign Card */}
          <AnimatePresence>
            {pendingLaunch && !loading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Rocket size={18} className="text-emerald-600" />
                  <span className="font-semibold text-gray-900 dark:text-white">Ready to Launch!</span>
                </div>
                <div className="space-y-1.5 mb-4 text-sm">
                  {pendingLaunch.niche && (
                    <div className="flex gap-2">
                      <span className="text-gray-500 w-20 shrink-0">Niche:</span>
                      <span className="font-medium text-gray-800 dark:text-gray-200">{pendingLaunch.niche}</span>
                    </div>
                  )}
                  {pendingLaunch.audience && (
                    <div className="flex gap-2">
                      <span className="text-gray-500 w-20 shrink-0">Audience:</span>
                      <span className="font-medium text-gray-800 dark:text-gray-200">{pendingLaunch.audience}</span>
                    </div>
                  )}
                  {pendingLaunch.location && (
                    <div className="flex gap-2">
                      <span className="text-gray-500 w-20 shrink-0">Location:</span>
                      <span className="font-medium text-gray-800 dark:text-gray-200">{pendingLaunch.location}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleLaunchCampaign}
                  disabled={launching}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2.5 rounded-xl transition-all shadow-md shadow-emerald-200 disabled:opacity-60"
                >
                  {launching ? (
                    <><Loader2 size={16} className="animate-spin" /> Launching Campaign...</>
                  ) : (
                    <><Rocket size={16} /> Launch Campaign Now</>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-end gap-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-400/20 transition-all">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask ${selectedAgent?.name || "your agent"} something...`}
              rows={1}
              className="flex-1 bg-transparent outline-none resize-none text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 max-h-[120px]"
              style={{ scrollbarWidth: "none" }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="w-8 h-8 flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl transition-all shrink-0 shadow-sm"
            >
              <Send size={14} />
            </button>
          </div>
          <p className="text-center text-[11px] text-gray-400 mt-2">Press Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  );
}
