"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { LayoutDashboard, Package, ShoppingBag, Users, Settings, LogOut, X, Sun, Moon, MessageSquare } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (authUser) => {
            if (!authUser) {
                router.push("/admin/login");
                setLoading(false);
            } else {
                try {
                    // Check admin role
                    const userDoc = await getDoc(doc(db, "users", authUser.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        if (userData.role === 'admin' || userData.role === 'super_admin') {
                            setUser(authUser);
                        } else {
                            console.error("Access denied: User is not an admin.");
                            router.push("/"); // Redirect non-admins to home
                        }
                    } else {
                        console.error("User profile not found.");
                        router.push("/admin/login");
                    }
                } catch (error) {
                    console.error("Error verifying admin role:", error);
                    router.push("/admin/login");
                } finally {
                    setLoading(false);
                }
            }
        });

        return () => unsubscribeAuth();
    }, [router]);

    const handleLogout = async () => {
        await auth.signOut();
        router.push("/admin/login");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/30">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) return null; // Should redirect

    const navItems = [
        { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { href: "/admin/orders", icon: ShoppingBag, label: "Orders" },
        { href: "/admin/products", icon: Package, label: "Products" },
        { href: "/admin/customers", icon: Users, label: "Customers" },
        { href: "/admin/support", icon: MessageSquare, label: "Support" },
        { href: "/admin/settings", icon: Settings, label: "Settings" },
    ];

    return (
        <div className="min-h-screen flex bg-muted/30 text-foreground font-sans">
            {/* Sidebar */}
            <aside className="w-72 border-r border-border bg-card hidden md:flex flex-col sticky top-0 h-screen shadow-xl shadow-black/5">
                <div className="h-20 flex items-center px-8 border-b border-border">
                    <Link href="/" className="flex items-center gap-2 font-black text-xl tracking-tighter">
                        <Package className="h-6 w-6 text-primary" />
                        <span>PreOrder<span className="text-primary">GH</span></span>
                    </Link>
                </div>
                <div className="p-6">
                    <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-2xl border border-border mb-8">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">A</div>
                        <div>
                            <p className="text-xs font-bold text-foreground truncate max-w-[140px] uppercase tracking-wider">{user.email?.split('@')[0]}</p>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none mt-1">Admin</p>
                        </div>
                    </div>
                    <nav className="space-y-1.5">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            // Update active check logic to be more inclusive for sub-routes if needed, 
                            // or exact match for now. `startsWith` is usually better for sections.
                            const isActive = pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group ${isActive
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                        }`}
                                >
                                    <Icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
                <div className="mt-auto p-6 border-t border-border space-y-2">
                    <button
                        onClick={toggleTheme}
                        className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-xl text-sm font-bold text-muted-foreground hover:bg-muted transition-all group"
                    >
                        {theme === 'light' ? (
                            <Moon className="h-5 w-5 transition-transform group-hover:scale-110" />
                        ) : (
                            <Sun className="h-5 w-5 transition-transform group-hover:scale-110" />
                        )}
                        {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-xl text-sm font-bold text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all group"
                    >
                        <LogOut className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-20 border-b border-border bg-card flex items-center px-8 justify-between md:hidden">
                    <span className="font-black tracking-tighter">PreOrder<span className="text-primary">GH</span></span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleTheme}
                            className="h-10 w-10 flex items-center justify-center rounded-xl bg-muted text-muted-foreground hover:text-primary transition-colors"
                        >
                            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                        </button>
                        <button
                            className="h-10 w-10 flex items-center justify-center rounded-xl bg-muted"
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            <LayoutDashboard className="h-5 w-5" />
                        </button>
                    </div>
                </header>
                <main className="flex-1 p-8 overflow-auto">
                    {children}
                </main>
            </div>

            {/* Mobile Sidebar Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 flex md:hidden">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
                    <aside className="relative w-72 bg-card h-full shadow-2xl flex flex-col animate-in slide-in-from-left">
                        <div className="h-20 flex items-center justify-between px-8 border-b border-border">
                            <Link href="/" className="flex items-center gap-2 font-black text-xl tracking-tighter">
                                <Package className="h-6 w-6 text-primary" />
                                <span>PreOrder<span className="text-primary">GH</span></span>
                            </Link>
                            <button onClick={() => setMobileMenuOpen(false)} className="h-8 w-8 flex items-center justify-center rounded-lg bg-muted hover:text-destructive transition-colors">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-2xl border border-border mb-8">
                                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">A</div>
                                <div>
                                    <p className="text-xs font-bold text-foreground truncate max-w-[140px] uppercase tracking-wider">{user.email?.split('@')[0]}</p>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none mt-1">Administrator</p>
                                </div>
                            </div>
                            <nav className="space-y-1.5">
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = pathname.startsWith(item.href);
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group ${isActive
                                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                                : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                                }`}
                                        >
                                            <Icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`} />
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                        <div className="mt-auto p-6 border-t border-border space-y-2">
                            <button
                                onClick={toggleTheme}
                                className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-xl text-sm font-bold text-muted-foreground hover:bg-muted transition-all group"
                            >
                                {theme === 'light' ? (
                                    <Moon className="h-5 w-5 transition-transform group-hover:scale-110" />
                                ) : (
                                    <Sun className="h-5 w-5 transition-transform group-hover:scale-110" />
                                )}
                                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-xl text-sm font-bold text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all group"
                            >
                                <LogOut className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                                Logout
                            </button>
                        </div>
                    </aside>
                </div>
            )}
        </div>
    );
}
