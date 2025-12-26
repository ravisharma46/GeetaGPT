"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus,
    Mic,
    Send,
    MoreHorizontal,
    MessageCircle,
    Megaphone,
    Bookmark,
    Heart,
    Sparkles
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Message {
    role: "user" | "bot";
    content: string;
    image?: string;
}

export default function ChatUI() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSendMessage = async (customText?: string) => {
        const messageText = customText || input.trim();
        if (!messageText || isLoading) return;

        const userMessage = messageText;
        setInput("");
        setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMessage }),
            });

            if (!response.ok) throw new Error("Network response was not ok");
            if (!response.body) throw new Error("No response body");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let botMessage = "";

            setMessages((prev) => [...prev, { role: "bot", content: "" }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                botMessage += chunk;

                setMessages((prev) => {
                    const newMessages = [...prev];
                    const lastMsg = newMessages[newMessages.length - 1];
                    if (lastMsg.role === "bot") {
                        lastMsg.content = botMessage;
                    }
                    return newMessages;
                });
            }
        } catch (error) {
            console.error("Error:", error);
            setMessages((prev) => [
                ...prev,
                { role: "bot", content: "I am sorry, I couldn't connect to the wisdom source right now. Please try again." },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen max-w-lg mx-auto bg-white overflow-hidden shadow-2xl md:my-4 md:h-[90vh] md:rounded-[3rem] relative font-sans">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#FDECF7] to-white pointer-events-none" />

            <div className="relative z-10 flex flex-col h-full">
                {/* Chat Header */}
                <div className="p-6 pt-12 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center text-white shadow-lg">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900 leading-tight">GeetaGPT</h2>
                            <p className="text-[10px] text-pink-500 font-semibold uppercase tracking-wider">Spiritual Guide</p>
                        </div>
                    </div>
                    <div className="px-4 py-2 rounded-full bg-pink-50 border border-pink-100 flex items-center gap-2">
                        <span className="text-pink-500 font-bold text-sm">Online</span>
                        <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                    </div>
                    <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                        <MoreHorizontal className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto px-6 space-y-6 custom-scrollbar pb-4">
                    <AnimatePresence>
                        {messages.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col items-center justify-center h-full text-center p-8"
                            >
                                <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mb-6 text-pink-500">
                                    <Sparkles className="w-10 h-10" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Seek Divine Wisdom</h3>
                                <p className="text-sm text-gray-500 leading-relaxed max-w-[240px]">
                                    Ask anything about life, duty, or spirituality grounded in the Bhagavad Gita.
                                </p>
                            </motion.div>
                        )}
                        {messages.map((msg, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={cn(
                                    "flex flex-col",
                                    msg.role === "user" ? "items-end" : "items-start"
                                )}
                            >
                                <div
                                    className={cn(
                                        "max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed shadow-sm",
                                        msg.role === "user"
                                            ? "bg-[#ec008c] text-white rounded-tr-none shadow-pink-100"
                                            : "bg-white/90 backdrop-blur-md border border-pink-50 text-gray-800 rounded-tl-none"
                                    )}
                                >
                                    {msg.content}
                                </div>
                                {msg.role === "bot" && idx === messages.length - 1 && !isLoading && (
                                    <div className="flex gap-4 mt-2 px-1">
                                        <button className="text-gray-400 hover:text-pink-500 transition-colors">
                                            <Bookmark className="w-4 h-4" />
                                        </button>
                                        <button className="text-gray-400 hover:text-pink-500 transition-colors">
                                            <Heart className="w-4 h-4" />
                                        </button>
                                        <button className="text-gray-400 hover:text-pink-500 transition-colors">
                                            <Megaphone className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {isLoading && (
                        <div className="flex flex-col items-start">
                            <div className="bg-white/80 backdrop-blur-md p-4 rounded-3xl rounded-tl-none shadow-sm border border-pink-50 w-24 flex gap-1 items-center justify-center">
                                <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-6 bg-white/50 backdrop-blur-sm border-t border-pink-50 md:rounded-b-[3rem]">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSendMessage();
                        }}
                        className="flex items-center gap-3 bg-white p-2 rounded-full shadow-lg border border-pink-100"
                    >
                        <button type="button" className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-pink-500 hover:bg-pink-100 transition-colors">
                            <Plus className="w-5 h-5" />
                        </button>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask the Gita..."
                            className="flex-1 text-sm outline-none text-gray-700 bg-transparent"
                            disabled={isLoading}
                        />
                        <div className="flex items-center gap-2 pr-2">
                            <Mic className="w-5 h-5 text-gray-400 cursor-pointer hover:text-pink-400 transition-colors" />
                            {input.trim() && (
                                <button
                                    type="submit"
                                    className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white shadow-md hover:bg-pink-600 transition-colors"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
