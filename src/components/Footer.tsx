"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, Phone } from "lucide-react";

import Image from "next/image";

export function Footer() {
    const pathname = usePathname();
    const isFooterHiddenPage = pathname === "/login" || pathname === "/signup" || pathname === "/cart" || pathname === "/checkout" || pathname?.startsWith("/order-confirmation") || pathname === "/account" || pathname === "/track";

    if (isFooterHiddenPage) return null;

    return (
        <footer className="w-full border-t border-border bg-card py-16 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    <div className="space-y-8">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <img
                                    src="/logo.png"
                                    alt="Nocta Logo"
                                    className="h-10 w-10 object-contain"
                                />
                                <h3 className="font-bold text-2xl text-foreground">Nocta<span className="text-primary">.</span></h3>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                                Your premium destination for style and quality. We bring you the best fashion and accessories, delivered with speed and reliability.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <h4 className="font-black text-xs uppercase tracking-widest text-foreground">Contact Information</h4>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-4 text-sm text-muted-foreground group">
                                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                        <Phone className="h-4 w-4" />
                                    </div>
                                    <div className="pt-1">
                                        <p className="font-bold text-foreground">Call Us</p>
                                        <span>+233 54 627 7605</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4 text-sm text-muted-foreground group">
                                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                        <Mail className="h-4 w-4" />
                                    </div>
                                    <div className="pt-1">
                                        <p className="font-bold text-foreground">Email Us</p>
                                        <span>info@nocta.com</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4 text-sm text-muted-foreground group">
                                    <a
                                        href="https://wa.me/233546277605"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-start gap-4 w-full"
                                    >
                                        <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 group-hover:bg-green-500 group-hover:text-white transition-colors">
                                            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                            </svg>
                                        </div>
                                        <div className="pt-1">
                                            <p className="font-bold text-foreground">WhatsApp Us</p>
                                            <span>Chat Instantly</span>
                                        </div>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="bg-muted/30 p-8 rounded-[32px] border border-border">
                        <h3 className="font-black text-lg text-foreground mb-2">Send us a message</h3>
                        <p className="text-xs text-muted-foreground mb-6">Have a question or concern? We're here to help.</p>
                        <ContactForm />
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-border/50 text-center">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                        © 2026 Nocta. All rights reserved
                    </p>
                    <p className="text-[9px] text-muted-foreground/50 mt-2 font-serif italic tracking-wider">
                        built by KlenamDev
                    </p>
                </div>
            </div>
        </footer>
    );
}

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { addSupportMessage } from "@/lib/firestore";

function ContactForm() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [form, setForm] = useState({ name: "", email: "", message: "" });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await addSupportMessage(form);
            setSuccess(true);
            setForm({ name: "", email: "", message: "" });
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error("Failed to send message", error);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="h-64 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in">
                <div className="h-16 w-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-4">
                    <Send className="h-8 w-8" />
                </div>
                <h4 className="font-bold text-foreground">Message Sent!</h4>
                <p className="text-sm text-muted-foreground mt-2">We'll get back to you shortly.</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <input
                    type="text"
                    required
                    placeholder="Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full h-11 bg-card border border-border rounded-xl px-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <input
                    type="email"
                    required
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full h-11 bg-card border border-border rounded-xl px-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
            </div>
            <textarea
                required
                placeholder="How can we help?"
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full bg-card border border-border rounded-xl p-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
            />
            <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Message"}
            </button>
        </form>
    );
}
