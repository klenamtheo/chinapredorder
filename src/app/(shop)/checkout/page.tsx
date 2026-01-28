"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutSchema, CheckoutCreate } from "@/lib/validators";
import { createOrder } from "@/lib/firestore";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

// Dynamic import to avoid SSR issues with Paystack
const PaymentManager = dynamic(() => import("@/components/PaymentManager"), {
    ssr: false
});

export default function CheckoutPage() {
    const { cartItems, cartTotal, clearCart } = useCart();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [user, setUser] = useState<any>(null);
    const paymentRef = useRef<any>(null);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<CheckoutCreate>({
        resolver: zodResolver(checkoutSchema) as any,
    });

    const watchedEmail = watch("email");

    // Paystack Config
    const config = {
        reference: (new Date()).getTime().toString(),
        email: watchedEmail || user?.email || "customer@preordergh.com",
        amount: Math.round(cartTotal * 100),
        publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
        currency: "GHS",
    };

    const handlePaymentSuccess = async (reference: any, data: CheckoutCreate) => {
        setLoading(true);
        try {
            const orderCode = `ORD-GH-2026-${Math.floor(10000 + Math.random() * 90000)}`;
            const orderData = {
                orderCode,
                customerName: data.fullName,
                customerPhone: data.phone,
                location: data.location,
                customerEmail: data.email || user?.email || null,
                items: cartItems,
                totalAmount: cartTotal,
                deliveryFee: 0,
                paymentStatus: 'paid' as const,
                orderStatus: 'paid' as const,
                paymentReference: reference.reference,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                customerId: user?.uid || null,
            };

            await createOrder(orderData as any);
            clearCart();
            router.push(`/order-confirmation/${orderCode}`);
        } catch (err) {
            console.error(err);
            setError("Failed to save order. Please contact support with your payment reference: " + reference.reference);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = (data: CheckoutCreate) => {
        setLoading(true);
        setError("");

        setTimeout(() => {
            if (paymentRef.current) {
                paymentRef.current.triggerPayment({
                    onSuccess: (reference: any) => handlePaymentSuccess(reference, data),
                    onClose: () => {
                        setLoading(false);
                        setError("Payment window closed.");
                    },
                });
            }
        }, 2000);
    };

    if (cartItems.length === 0) {
        return (
            <div className="container px-4 py-24 mx-auto text-center">
                <h1 className="text-2xl font-bold">Your cart is empty</h1>
                <p className="text-muted-foreground mt-2">Add items to checkout.</p>
            </div>
        );
    }

    return (
        <div className="container px-4 md:px-6 py-12 md:py-20 mx-auto">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-6 md:mb-8 text-foreground">Final <span className="text-primary">Checkout</span></h1>
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
                <div className="space-y-8">
                    <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                        <h2 className="text-xl font-bold mb-6 text-foreground flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">1</span>
                            Delivery Details
                        </h2>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="fullName" className="text-sm font-bold text-foreground">
                                        Full Name
                                    </label>
                                    <input
                                        id="fullName"
                                        type="text"
                                        className={`flex h-12 w-full rounded-xl border bg-background px-4 py-2 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary ${errors.fullName ? "border-destructive ring-destructive" : "border-border"
                                            }`}
                                        placeholder="John Doe"
                                        {...register("fullName")}
                                    />
                                    {errors.fullName && (
                                        <p className="text-xs text-destructive font-medium">{errors.fullName.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="phone" className="text-sm font-bold text-foreground">
                                        Phone Number
                                    </label>
                                    <input
                                        id="phone"
                                        type="tel"
                                        className={`flex h-12 w-full rounded-xl border bg-background px-4 py-2 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary ${errors.phone ? "border-destructive ring-destructive" : "border-border"
                                            }`}
                                        placeholder="024 XXX XXXX"
                                        {...register("phone")}
                                    />
                                    {errors.phone && (
                                        <p className="text-xs text-destructive font-medium">{errors.phone.message}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="location" className="text-sm font-bold text-foreground">
                                    Delivery Location
                                </label>
                                <input
                                    id="location"
                                    className={`flex h-12 w-full rounded-xl border bg-background px-4 py-2 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary ${errors.location ? "border-destructive ring-destructive" : "border-border"
                                        }`}
                                    placeholder="Accra, Ghana"
                                    {...register("location")}
                                />
                                {errors.location && (
                                    <p className="text-xs text-destructive font-medium">{errors.location.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-bold text-foreground">
                                    Email (Optional)
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    className={`flex h-12 w-full rounded-xl border bg-background px-4 py-2 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary ${errors.email ? "border-destructive ring-destructive" : "border-border"
                                        }`}
                                    placeholder="john@example.com"
                                    {...register("email")}
                                />
                                {errors.email && (
                                    <p className="text-xs text-destructive font-medium">{errors.email.message}</p>
                                )}
                            </div>

                            {error && <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm font-bold border border-destructive/20">{error}</div>}

                            <div className="mt-10 pt-10 border-t border-border">
                                <h2 className="text-xl font-bold mb-6 text-foreground flex items-center gap-2">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">2</span>
                                    Payment Method
                                </h2>
                                <div className="p-5 border border-primary/20 bg-primary/5 rounded-2xl flex items-center justify-between group hover:border-primary/40 transition-all cursor-default">
                                    <div>
                                        <p className="text-base font-bold text-foreground group-hover:text-primary transition-colors">Paystack (MoMo / Card)</p>
                                        <p className="text-xs text-muted-foreground font-medium">
                                            Trusted secure payment infrastructure.
                                        </p>
                                    </div>
                                    <div className="h-6 w-6 rounded-full border-4 border-primary bg-primary-foreground ring-1 ring-primary" />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full inline-flex h-14 items-center justify-center rounded-xl bg-primary px-8 text-base font-bold text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-[1.01] active:scale-95 disabled:opacity-50 mt-4"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        Complete Payment - GHS {cartTotal.toFixed(2)}
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                <div>
                    <div className="bg-card border border-border rounded-2xl p-8 sticky top-24 shadow-xl shadow-black/5">
                        <h2 className="text-xl font-bold mb-6 text-foreground">Order Summary</h2>
                        <div className="space-y-4 mb-8">
                            <div className="grid grid-cols-4 pb-2 border-b border-border text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                                <span className="col-span-2">Product</span>
                                <span className="text-center">Qty</span>
                                <span className="text-right">Price</span>
                            </div>
                            <div className="space-y-3 max-h-[300px] overflow-auto pr-2">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="grid grid-cols-4 items-center group">
                                        <span className="col-span-2 text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate pr-2" title={item.name}>{item.name}</span>
                                        <span className="text-sm font-bold text-foreground text-center">{item.quantity}</span>
                                        <span className="text-sm font-bold text-foreground text-right">{(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-6 border-t border-border space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-muted-foreground">Subtotal</span>
                                    <span className="text-sm font-bold text-foreground">GHS {cartTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-muted-foreground">Delivery Fee</span>
                                    <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded uppercase text-[10px]">Calculated at Delivery</span>
                                </div>
                                <div className="border-t border-border pt-4 mt-4 flex justify-between items-center">
                                    <span className="font-extrabold text-lg text-foreground">Total Amount</span>
                                    <span className="text-primary text-2xl font-black">GHS {cartTotal.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-xl border border-border shadow-inner">
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest text-center">Secure Checkout & Fast Delivery</p>
                        </div>
                    </div>
                </div>

            </div>
            <PaymentManager ref={paymentRef} config={config} />
        </div >
    );
}
