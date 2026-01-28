"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginCreate } from "@/lib/validators";
import { FirebaseError } from "firebase/app";

export default function AdminLoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [authError, setAuthError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginCreate>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginCreate) => {
        setLoading(true);
        setAuthError("");

        try {
            await signInWithEmailAndPassword(auth, data.email, data.password);
            router.push("/admin/dashboard");
        } catch (err: any) {
            console.error("Login error:", err);
            if (err instanceof FirebaseError || err.code) {
                switch (err.code) {
                    case "auth/invalid-credential":
                        setAuthError("Invalid email or password.");
                        break;
                    case "auth/user-not-found":
                        setAuthError("No admin account found with this email.");
                        break;
                    case "auth/wrong-password":
                        setAuthError("Incorrect password.");
                        break;
                    case "auth/too-many-requests":
                        setAuthError("Too many attempts. Please try again later.");
                        break;
                    default:
                        setAuthError("An error occurred during login. Please check console.");
                }
            } else {
                setAuthError("Connection error. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4">
            <div className="w-full max-w-sm space-y-8 bg-card p-8 md:p-10 rounded-2xl border border-border shadow-xl shadow-black/5">
                <div className="flex flex-col items-center space-y-2 text-center">
                    <div className="p-4 bg-primary/10 rounded-full mb-2">
                        <Lock className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight">Admin Login</h1>
                    <p className="text-sm text-muted-foreground font-medium">
                        Enter your credentials access dashboard.
                    </p>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            className={`flex h-12 w-full rounded-xl border bg-background px-4 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-all ${errors.email ? "border-destructive ring-destructive" : "border-input file:border-0 focus-visible:ring-primary/20 focus-visible:border-primary"
                                }`}
                            placeholder="admin@example.com"
                            {...register("email")}
                        />
                        {errors.email && (
                            <p className="text-xs text-destructive font-bold ml-1">{errors.email.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="password" className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                className={`flex h-12 w-full rounded-xl border bg-background px-4 py-2 pr-12 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-all ${errors.password ? "border-destructive ring-destructive" : "border-input file:border-0 focus-visible:ring-primary/20 focus-visible:border-primary"
                                    }`}
                                {...register("password")}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-3 text-muted-foreground hover:text-primary transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-xs text-destructive font-bold ml-1">{errors.password.message}</p>
                        )}
                    </div>

                    {authError && (
                        <div className="p-4 bg-destructive/10 text-destructive text-sm rounded-xl font-bold text-center border border-destructive/20">
                            {authError}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-sm font-black text-primary-foreground uppercase tracking-widest shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In"}
                    </button>
                </form>
            </div>
        </div>
    );
}
