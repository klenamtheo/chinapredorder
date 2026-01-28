"use client";

import Link from "next/link";
import { Package, ShoppingCart, Sun, Moon, User, Menu, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useTheme } from "@/context/ThemeContext";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";

export function Navbar() {
    const { cartCount } = useCart();
    const { theme, toggleTheme } = useTheme();
    const [user, setUser] = useState<any>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
        });
        return () => unsubscribe();
    }, []);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
                <Link className="flex items-center gap-2 font-bold text-xl group" href="/">
                    <Package className="h-6 w-6 text-primary transition-transform group-hover:scale-110" />
                    <span className="tracking-tight text-foreground">PreOrder<span className="text-primary transition-colors">GH</span></span>
                </Link>
                <nav className="hidden md:flex gap-8 items-center">
                    <Link className="text-sm font-semibold hover:text-primary transition-colors text-foreground/80" href="/">
                        Home
                    </Link>
                    <Link className="text-sm font-semibold hover:text-primary transition-colors text-foreground/80" href="/shop">
                        Shop
                    </Link>
                    <Link className="text-sm font-semibold hover:text-primary transition-colors text-foreground/80" href="/track">
                        Track Order
                    </Link>
                </nav>
                <div className="flex items-center gap-2 md:gap-4">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full hover:bg-muted transition-colors text-foreground/70 hover:text-primary"
                        aria-label="Toggle theme"
                    >
                        {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                    </button>
                    <Link href="/cart" className="relative group p-2">
                        <ShoppingCart className="h-6 w-6 text-foreground/70 group-hover:text-primary transition-colors" />
                        {cartCount > 0 && (
                            <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-in zoom-in ring-2 ring-background">
                                {cartCount}
                            </span>
                        )}
                    </Link>
                    <Link href={user ? "/account" : "/login"} className="p-2 rounded-full hover:bg-muted transition-colors text-foreground/70 hover:text-primary">
                        <User className="h-6 w-6" />
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-foreground/70 hover:text-primary transition-colors"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Mobile Navigation */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-border bg-background/95 backdrop-blur p-4 flex flex-col gap-4 animate-in slide-in-from-top-5">
                    <Link
                        className="text-sm font-semibold hover:text-primary transition-colors text-foreground/80 py-2"
                        href="/"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Home
                    </Link>
                    <Link
                        className="text-sm font-semibold hover:text-primary transition-colors text-foreground/80 py-2"
                        href="/shop"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Shop
                    </Link>
                    <Link
                        className="text-sm font-semibold hover:text-primary transition-colors text-foreground/80 py-2"
                        href="/track"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Track Order
                    </Link>
                </div>
            )}
        </header>
    );
}
