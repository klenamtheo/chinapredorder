"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, User, updateProfile, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/context/ToastContext";
import { Loader2, User as UserIcon, Lock, Moon, Sun, Bell, Shield, Mail } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function AdminSettingsPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [displayName, setDisplayName] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);
    const { showToast } = useToast();
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                setDisplayName(currentUser.displayName || "");
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleUpdateProfile = async () => {
        if (!user) return;
        if (!displayName.trim()) {
            showToast("Display name cannot be empty", "error");
            return;
        }

        setIsUpdating(true);
        try {
            await updateProfile(user, {
                displayName: displayName
            });
            showToast("Profile updated successfully!");
        } catch (error) {
            console.error(error);
            showToast("Failed to update profile", "error");
        } finally {
            setIsUpdating(false);
        }
    };

    const handlePasswordReset = async () => {
        if (!user || !user.email) return;
        try {
            await sendPasswordResetEmail(auth, user.email);
            showToast(`Password reset email sent to ${user.email}`);
        } catch (error) {
            console.error(error);
            showToast("Failed to send reset email", "error");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto pb-10">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Account <span className="text-primary">Settings</span></h1>
                <p className="text-sm text-muted-foreground font-medium mt-1">Manage your profile, security, and preferences.</p>
            </div>

            <div className="space-y-6">
                {/* Profile Section */}
                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-border bg-muted/30">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 text-primary rounded-lg">
                                <UserIcon className="h-5 w-5" />
                            </div>
                            <h2 className="font-bold text-lg text-foreground">Profile Information</h2>
                        </div>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="flex flex-col items-center gap-3">
                                <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center text-primary text-3xl font-black border-4 border-card shadow-lg">
                                    {displayName ? displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                                </div>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Administrator</p>
                            </div>
                            <div className="flex-1 space-y-4 w-full">
                                <div className="grid gap-2">
                                    <label className="text-xs font-black text-foreground uppercase tracking-widest pl-1">Display Name</label>
                                    <input
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        className="flex h-12 w-full rounded-2xl border border-border bg-background px-4 py-2 text-sm font-bold transition-all focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary"
                                        placeholder="Your Name"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-xs font-black text-foreground uppercase tracking-widest pl-1">Email Address</label>
                                    <div className="flex h-12 w-full items-center rounded-2xl border border-border bg-muted/50 px-4 text-sm font-bold text-muted-foreground cursor-not-allowed">
                                        <Mail className="mr-2 h-4 w-4" />
                                        {user.email}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground font-medium pl-1">Email cannot be changed directly for security reasons.</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end pt-4 border-t border-border">
                            <button
                                onClick={handleUpdateProfile}
                                disabled={isUpdating}
                                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>

                {/* Security Section */}
                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-border bg-muted/30">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-500/10 text-orange-500 rounded-lg">
                                <Shield className="h-5 w-5" />
                            </div>
                            <h2 className="font-bold text-lg text-foreground">Security</h2>
                        </div>
                    </div>
                    <div className="p-8">
                        <div className="flex items-center justify-between p-4 border border-border rounded-2xl bg-background">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                                    <Lock className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-foreground">Password</p>
                                    <p className="text-xs text-muted-foreground">Last changed: Never (Firebase managed)</p>
                                </div>
                            </div>
                            <button
                                onClick={handlePasswordReset}
                                className="px-4 py-2 border border-border rounded-xl text-xs font-bold hover:bg-muted transition-colors"
                            >
                                Reset Password
                            </button>
                        </div>
                    </div>
                </div>

                {/* Preferences Section */}
                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-border bg-muted/30">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
                                <SettingsIcon className="h-5 w-5" />
                            </div>
                            <h2 className="font-bold text-lg text-foreground">Preferences</h2>
                        </div>
                    </div>
                    <div className="p-8 space-y-4">
                        <div className="flex items-center justify-between p-4 border border-border rounded-2xl bg-background">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                                    {theme === 'light' ? <Sun className="h-5 w-5 text-orange-500" /> : <Moon className="h-5 w-5 text-blue-500" />}
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-foreground">Appearance</p>
                                    <p className="text-xs text-muted-foreground">Toggle between light and dark mode</p>
                                </div>
                            </div>
                            <button
                                onClick={toggleTheme}
                                className="px-4 py-2 border border-border rounded-xl text-xs font-bold hover:bg-muted transition-colors min-w-[100px]"
                            >
                                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SettingsIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}
