"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { createUserProfile } from "@/lib/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, UserPlus, Mail, Lock, User, ArrowRight, Package, Eye, EyeOff, Phone } from "lucide-react";

export default function SignupPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [fullName, setFullName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Name validation (at least two words)
        const nameParts = fullName.trim().split(/\s+/);
        if (nameParts.length < 2) {
            setError("Please enter your full name (First and Last name)");
            setLoading(false);
            return;
        }

        // Phone validation
        if (phoneNumber.length < 10) {
            setError("Please enter a valid phone number (at least 10 digits)");
            setLoading(false);
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address");
            setLoading(false);
            return;
        }

        // Password validation
        if (password.length < 6) {
            setError("Password must be at least 6 characters long");
            setLoading(false);
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await updateProfile(user, { displayName: fullName });

            // Create profile in Firestore
            await createUserProfile(user.uid, {
                email: email,
                displayName: fullName,
                phoneNumber: phoneNumber,
                role: "customer",
                createdAt: new Date().toISOString()
            } as any);

            router.push("/account");
        } catch (err: any) {
            console.error("Signup Error:", err);
            setError(err.message || "Failed to create account");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-0 -left-20 w-72 h-72 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 -right-20 w-72 h-72 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-md z-10">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-black text-foreground tracking-tight">Create your <span className="text-primary">Account</span></h1>
                    <p className="text-muted-foreground font-medium mt-2">Join us for a faster and smoother shopping experience.</p>
                </div>

                <div className="bg-card border border-border rounded-[40px] p-10 shadow-2xl shadow-black/10">
                    <form onSubmit={handleSignup} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                                <input
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="John Doe"
                                    className="w-full h-12 bg-muted/50 border border-border rounded-2xl pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                                <input
                                    type="tel"
                                    required
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="055 123 4567"
                                    className="w-full h-12 bg-muted/50 border border-border rounded-2xl pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full h-12 bg-muted/50 border border-border rounded-2xl pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                                />
                            </div>
                            <p className="text-[10px] text-amber-500 font-bold pl-1 flex items-center gap-1.5 pt-1">
                                <span className="h-3 w-3 bg-amber-500 rounded-full flex items-center justify-center text-[8px] text-white font-bold shrink-0">!</span>
                                Please use a valid email for password recovery.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full h-12 bg-muted/50 border border-border rounded-2xl pl-12 pr-12 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-3.5 text-muted-foreground hover:text-primary transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl text-xs font-bold text-destructive">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-primary text-primary-foreground rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    Sign Up
                                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-border text-center">
                        <p className="text-sm font-medium text-muted-foreground">
                            Already have an account?{" "}
                            <Link href="/login" className="text-primary font-black hover:underline underline-offset-4">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="text-center text-[10px] font-medium text-muted-foreground mt-8 px-6">
                    By creating an account, you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>
        </div>
    );
}
