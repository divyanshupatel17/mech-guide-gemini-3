"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mic, MicOff, Volume2, VolumeX, Bot, User } from "lucide-react";

interface Message {
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

interface ChatPanelProps {
    onSendMessage: (message: string) => Promise<string>;
    voiceGuidance?: string;
    isProcessing?: boolean;
}

// Helper function to extract readable text from Gemini response
function parseResponse(response: string): string {
    // Try to extract JSON and format nicely
    try {
        // Check if response contains JSON
        const jsonMatch = response.match(/```json\n?([\s\S]*?)\n?```/) || response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const jsonStr = jsonMatch[1] || jsonMatch[0];
            const parsed = JSON.parse(jsonStr);

            // Extract voiceGuidance or create summary from diagnosis
            if (parsed.voiceGuidance) {
                return parsed.voiceGuidance;
            }
            if (parsed.diagnosis?.summary) {
                const severity = parsed.severity || parsed.diagnosis?.severity || "";
                const confidence = parsed.confidence || parsed.diagnosis?.confidence || 0;
                return `${parsed.diagnosis.summary}${severity ? ` (${severity.toUpperCase()})` : ""}${confidence ? ` - ${Math.round(confidence * 100)}% confident` : ""}`;
            }
            if (parsed.message) {
                return parsed.message;
            }
            if (parsed.response) {
                return parsed.response;
            }
        }
    } catch {
        // Not JSON, return as-is
    }

    // If it looks like raw JSON, try to sanitize it
    if (response.trim().startsWith("{") || response.trim().startsWith("```")) {
        try {
            const cleanJson = response.replace(/```json\n?/g, "").replace(/```/g, "").trim();
            const parsed = JSON.parse(cleanJson);
            return parsed.voiceGuidance || parsed.diagnosis?.summary || parsed.message || response;
        } catch {
            // Return as-is if parsing fails
        }
    }

    return response;
}

export default function ChatPanel({ onSendMessage, voiceGuidance, isProcessing }: ChatPanelProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: "Hello! I'm MechGuide, your AI repair co-pilot. Point your camera at any machinery, and I'll help you diagnose and fix it!",
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Speak voice guidance
    useEffect(() => {
        if (voiceGuidance && isSpeaking && "speechSynthesis" in window) {
            const utterance = new SpeechSynthesisUtterance(voiceGuidance);
            utterance.rate = 0.9;
            utterance.pitch = 1;
            window.speechSynthesis.speak(utterance);
        }
    }, [voiceGuidance, isSpeaking]);

    // Initialize speech recognition
    useEffect(() => {
        if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
                setIsListening(false);
            };

            recognitionRef.current.onerror = () => {
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, []);

    const toggleListening = () => {
        if (!recognitionRef.current) return;

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isProcessing) return;

        const userMessage: Message = {
            role: "user",
            content: input,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");

        try {
            const response = await onSendMessage(input);
            // Parse the response to extract readable text
            const parsedContent = parseResponse(response);
            const assistantMessage: Message = {
                role: "assistant",
                content: parsedContent,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, assistantMessage]);
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: "Sorry, I encountered an error. Please try again.",
                    timestamp: new Date(),
                },
            ]);
        }
    };

    return (
        <div className="glass-card flex flex-col h-full overflow-hidden">
            {/* Header with glow effect */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">MechGuide AI</h3>
                        <div className="flex items-center gap-1.5">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <p className="text-xs text-green-400">Online</p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => setIsSpeaking(!isSpeaking)}
                    className={`p-2 rounded-xl transition-all duration-300 ${isSpeaking
                        ? "bg-blue-500/20 text-blue-400 shadow-lg shadow-blue-500/20"
                        : "bg-white/5 text-gray-500 hover:bg-white/10"
                        }`}
                    title={isSpeaking ? "Mute voice" : "Enable voice"}
                >
                    {isSpeaking ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </button>
            </div>

            {/* Messages with animations */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                <AnimatePresence initial={false}>
                    {messages.map((message, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className={`flex items-end gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            {message.role === "assistant" && (
                                <div className="w-7 h-7 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                                    <Bot className="w-3.5 h-3.5 text-white" />
                                </div>
                            )}
                            <motion.div
                                whileHover={{ scale: 1.01 }}
                                className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === "user"
                                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20"
                                    : "bg-white/5 text-gray-100 border border-white/10 shadow-lg shadow-black/20"
                                    }`}
                            >
                                <p className="text-sm leading-relaxed">{message.content}</p>
                                <p className="text-xs opacity-40 mt-2 flex items-center gap-1">
                                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </p>
                            </motion.div>
                            {message.role === "user" && (
                                <div className="w-7 h-7 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                                    <User className="w-3.5 h-3.5 text-white" />
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Typing indicator */}
                <AnimatePresence>
                    {isProcessing && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex items-end gap-2"
                        >
                            <div className="w-7 h-7 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                                <Bot className="w-3.5 h-3.5 text-white animate-pulse" />
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                                <div className="flex gap-1.5">
                                    <motion.span
                                        animate={{ scale: [1, 1.3, 1] }}
                                        transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                                        className="w-2 h-2 bg-blue-400 rounded-full"
                                    />
                                    <motion.span
                                        animate={{ scale: [1, 1.3, 1] }}
                                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }}
                                        className="w-2 h-2 bg-purple-400 rounded-full"
                                    />
                                    <motion.span
                                        animate={{ scale: [1, 1.3, 1] }}
                                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }}
                                        className="w-2 h-2 bg-pink-400 rounded-full"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Premium Input */}
            <div className="p-4 border-t border-white/10 bg-black/20">
                <div className="flex gap-2">
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleListening}
                        className={`p-3 rounded-xl transition-all duration-300 ${isListening
                            ? "bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse"
                            : "bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10"
                            }`}
                    >
                        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </motion.button>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="Ask MechGuide anything..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                    />
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ scale: 1.02 }}
                        onClick={handleSend}
                        disabled={!input.trim() || isProcessing}
                        className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
                    >
                        <Send className="w-5 h-5 text-white" />
                    </motion.button>
                </div>
            </div>
        </div>
    );
}
