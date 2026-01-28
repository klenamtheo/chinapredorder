"use client";

import { useState, useEffect } from "react";
import { getSupportMessagesRealtime } from "@/lib/firestore";
import { SupportMessage } from "@/types";
import { Mail, MessageSquare, Clock, Search, ArrowUpRight, CheckCircle2, AlertCircle } from "lucide-react";

export default function SupportPage() {
    const [messages, setMessages] = useState<SupportMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const unsubscribe = getSupportMessagesRealtime((data) => {
            setMessages(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const filteredMessages = messages.filter(msg =>
        msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.message.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Support</h1>
                    <p className="text-muted-foreground mt-1">Manage and respond to customer inquiries.</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search messages..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-10 w-full md:w-64 rounded-xl border border-border bg-card text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    />
                </div>
            </div>

            <div className="grid gap-4">
                {messages.length === 0 && !loading ? (
                    <div className="h-64 flex flex-col items-center justify-center text-center border-2 border-dashed border-border rounded-3xl">
                        <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                            <MessageSquare className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                        <h3 className="font-bold text-foreground">No messages yet</h3>
                        <p className="text-sm text-muted-foreground">Customer inquiries will appear here.</p>
                    </div>
                ) : (
                    filteredMessages.map((msg) => (
                        <div key={msg.id} className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group animate-in slide-in-from-bottom-2 duration-300">
                            <div className="flex gap-4 items-start">
                                <div className="h-12 w-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 font-black text-lg">
                                    {msg.name[0].toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                                        <div>
                                            <h3 className="font-bold text-lg text-foreground truncate">{msg.name}</h3>
                                            <a href={`mailto:${msg.email}`} className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 w-fit">
                                                {msg.email}
                                            </a>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground bg-muted px-3 py-1 rounded-full whitespace-nowrap">
                                            <Clock className="h-3 w-3" />
                                            {new Date(msg.createdAt).toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="bg-muted/30 rounded-xl p-4 text-sm text-foreground leading-relaxed border border-border/50">
                                        {msg.message}
                                    </div>
                                    <div className="mt-4 flex items-center gap-2">
                                        <a
                                            href={`mailto:${msg.email}?subject=Re: Support Inquiry from ${msg.name}&body=Hi ${msg.name},%0D%0A%0D%0AThank you for contacting us regarding: "${msg.message.substring(0, 50)}..."`}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                                        >
                                            <Mail className="h-4 w-4" />
                                            Reply via Email
                                        </a>
                                        <div className="ml-auto flex items-center gap-2">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${msg.status === 'new' ? 'bg-blue-500/10 text-blue-600' : 'bg-green-500/10 text-green-600'
                                                }`}>
                                                <span className={`h-2 w-2 rounded-full ${msg.status === 'new' ? 'bg-blue-500' : 'bg-green-500'}`} />
                                                {msg.status.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
