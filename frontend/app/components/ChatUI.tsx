"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Plus,
    Mic,
    Send,
    ChevronLeft,
    MoreHorizontal,
    Home as HomeIcon,
    MessageCircle,
    Megaphone,
    Bookmark,
    User,
    Sparkles,
    Heart
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

type View = "home" | "chats" | "chat";

export default function ChatUI() {
    const [view, setView] = useState<View>("home");
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (view === "chat") {
            scrollToBottom();
        }
    }, [messages, isLoading, view]);

    const handleSendMessage = async (customText?: string) => {
        const messageText = customText || input.trim();
        if (!messageText || isLoading) return;

        if (view !== "chat") setView("chat");

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

    const suggestions = [
        "Goodnight stories",
        "Weight loss schedule",
        "Business plan",
        "Summary of this month's work",
        "Healthy Eating Pairing"
    ];

    const topics = [
        {
            title: "AI in Healthcare",
            description: "Transforming diagnostics and treatments for improved patient outcomes.",
            icon: <Sparkles className="w-5 h-5 text-white" />,
            color: "bg-indigo-500"
        },
        {
            title: "AI and Creativity",
            description: "Empowering artists with innovative tools and endless creative possibilities.",
            icon: <Heart className="w-5 h-5 text-white" />,
            color: "bg-orange-400"
        }
    ];

    return (
        <div className="flex flex-col h-screen max-w-lg mx-auto bg-white overflow-hidden shadow-2xl md:my-4 md:h-[90vh] md:rounded-[3rem] relative font-sans">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#FDECF7] to-white pointer-events-none" />

            <AnimatePresence mode="wait">
                {view === "home" && (
                    <motion.div
                        key="home"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="relative z-10 flex flex-col h-full p-6 pt-12"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center mb-10">
                            <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                                <ChevronLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                                <MoreHorizontal className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>

                        {/* Greeting */}
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-1">Hello, Enrico</h1>
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">How can I help?</h2>
                            <div className="inline-block px-4 py-1.5 rounded-full bg-pink-100 text-pink-500 text-xs font-semibold">
                                Last Update: 10/10/2024
                            </div>
                        </div>

                        {/* Suggestions */}
                        <div className="flex flex-wrap gap-2 mb-8 justify-center">
                            {suggestions.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => handleSendMessage(s)}
                                    className="px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-700 shadow-sm hover:bg-pink-50 transition-colors"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>

                        {/* Popular Topics */}
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-gray-900">Popular topics</h3>
                                <button className="text-pink-500 text-sm font-semibold">See all</button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {topics.map((t) => (
                                    <div key={t.title} className="p-4 bg-white rounded-3xl shadow-sm border border-pink-50/50">
                                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center mb-4", t.color)}>
                                            {t.icon}
                                        </div>
                                        <h4 className="font-bold text-gray-900 text-sm mb-1">{t.title}</h4>
                                        <p className="text-gray-500 text-[10px] leading-tight line-clamp-3">
                                            {t.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Input Area (Fake on home) */}
                        <div className="mt-6 flex items-center gap-3 bg-white p-2 rounded-full shadow-lg border border-pink-50">
                            <button className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-pink-500">
                                <Plus className="w-5 h-5" />
                            </button>
                            <input
                                type="text"
                                placeholder="Type a message.."
                                className="flex-1 text-sm outline-none text-gray-700"
                                onFocus={() => setView("chat")}
                            />
                            <div className="flex items-center gap-2 pr-2">
                                <Mic className="w-5 h-5 text-gray-400" />
                            </div>
                        </div>
                    </motion.div>
                )}

                {view === "chats" && (
                    <motion.div
                        key="chats"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative z-10 flex flex-col h-full p-6 pt-12 overflow-y-auto custom-scrollbar"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-3xl font-bold text-gray-900">Chats</h2>
                            <button className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center text-white shadow-lg">
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div className="relative mb-8">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full bg-white py-3 pl-12 pr-4 rounded-full shadow-sm border border-gray-100 outline-none text-sm"
                            />
                        </div>

                        {/* Today's Suggestion */}
                        <div className="mb-8">
                            <h3 className="font-bold text-gray-900 mb-4">Today's Suggestion</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white rounded-3xl shadow-sm border border-pink-50/50">
                                    <h4 className="font-bold text-gray-900 text-sm mb-1">AI in Everyday Life:</h4>
                                    <p className="text-gray-400 text-[10px] leading-tight mb-4">Empowering daily tasks with smart automation and personalized digital assistance.</p>
                                    <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center text-pink-500 ml-auto">
                                        <HomeIcon className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="p-4 bg-white rounded-3xl shadow-sm border border-pink-50/50">
                                    <h4 className="font-bold text-gray-900 text-sm mb-1">Culinary Innovation:</h4>
                                    <p className="text-gray-400 text-[10px] leading-tight mb-4">Exploring modern food trends and the role of science in gourmet creations.</p>
                                    <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center text-pink-500 ml-auto">
                                        <Mic className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recently Chat */}
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-gray-900">Recently Chat</h3>
                                <button className="text-pink-500 text-sm font-semibold">See all</button>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { title: "Digital Detox Benefits:", sub: "Why is it important to unplug from technology?" },
                                    { title: "Financial Wellness:", sub: "How does finances affect mental health?" },
                                    { title: "Smart Home Innovations:", sub: "What are the advantages of home automation?" }
                                ].map((chat, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setView("chat")}
                                        className="w-full p-4 bg-white rounded-2xl shadow-sm border border-pink-50/50 flex items-center gap-4 hover:bg-pink-50 transition-colors text-left"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-pink-500 shrink-0">
                                            <MessageCircle className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-xs">{chat.title}</h4>
                                            <p className="text-gray-400 text-[10px]">{chat.sub}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {view === "chat" && (
                    <motion.div
                        key="chat"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="relative z-10 flex flex-col h-full"
                    >
                        {/* Chat Header */}
                        <div className="p-6 pt-12 flex items-center justify-between">
                            <button
                                onClick={() => setView("home")}
                                className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm"
                            >
                                <ChevronLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <div className="px-4 py-2 rounded-full bg-pink-50 border border-pink-100 flex items-center gap-2">
                                <span className="text-pink-500 font-bold text-sm">Get Chatia +</span>
                            </div>
                            <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                                <MoreHorizontal className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto px-6 space-y-6 custom-scrollbar">
                            {messages.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
                                    <MessageCircle className="w-12 h-12 mb-2" />
                                    <p className="text-sm font-medium">Start a new conversation</p>
                                </div>
                            )}
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={cn(
                                        "flex flex-col",
                                        msg.role === "user" ? "items-end" : "items-start"
                                    )}
                                >
                                    {msg.image && (
                                        <div className="mb-2 max-w-[200px] rounded-2xl overflow-hidden shadow-sm">
                                            <img src={msg.image} alt="attached" className="w-full h-auto object-cover" />
                                        </div>
                                    )}
                                    <div
                                        className={cn(
                                            "max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed",
                                            msg.role === "user"
                                                ? "bg-[#ec008c] text-white rounded-tr-none"
                                                : "bg-white/80 backdrop-blur-md shadow-sm border border-white/50 text-gray-800 rounded-tl-none"
                                        )}
                                    >
                                        {msg.content}
                                    </div>
                                    {msg.role === "bot" && (
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
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex flex-col items-start">
                                    <div className="bg-white/80 backdrop-blur-md p-4 rounded-3xl rounded-tl-none shadow-sm border border-white/50 w-24 flex gap-1 items-center justify-center">
                                        <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                        <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                        <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-6">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSendMessage();
                                }}
                                className="flex items-center gap-3 bg-white p-2 rounded-full shadow-lg border border-pink-50"
                            >
                                <button type="button" className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-pink-500">
                                    <Plus className="w-5 h-5" />
                                </button>
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type a message.."
                                    className="flex-1 text-sm outline-none text-gray-700"
                                    disabled={isLoading}
                                />
                                <div className="flex items-center gap-2 pr-2">
                                    <Mic className="w-5 h-5 text-gray-400" />
                                    {input.trim() && (
                                        <button
                                            type="submit"
                                            className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white"
                                        >
                                            <Send className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom Navigation */}
            <div className="h-20 bg-white/80 backdrop-blur-xl border-t border-pink-50 flex items-center justify-around px-4 z-20">
                <button
                    onClick={() => setView("home")}
                    className={cn("p-2 transition-colors", view === "home" ? "text-pink-500" : "text-gray-400 hover:text-pink-300")}
                >
                    <HomeIcon className="w-6 h-6" />
                </button>
                <button
                    onClick={() => setView("chat")}
                    className={cn("p-2 transition-colors", view === "chat" ? "text-pink-500" : "text-gray-400 hover:text-pink-300")}
                >
                    <MessageCircle className="w-6 h-6" />
                </button>
                <button className="p-2 text-gray-400 hover:text-pink-300 transition-colors">
                    <Megaphone className="w-6 h-6" />
                </button>
                <button className="p-2 text-gray-400 hover:text-pink-300 transition-colors">
                    <Bookmark className="w-6 h-6" />
                </button>
                <button className="p-2 text-gray-400 hover:text-pink-300 transition-colors">
                    <User className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
}
