"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2, Minus, Plus, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
    const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();

    if (cartItems.length === 0) {
        return (
            <div className="container px-4 md:px-6 py-12 md:py-24 mx-auto min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
                <div className="p-6 bg-muted rounded-full">
                    <Trash2 className="h-10 w-10 text-muted-foreground" />
                </div>
                <h1 className="text-2xl font-bold">Your cart is empty</h1>
                <p className="text-muted-foreground max-w-[500px]">
                    Looks like you haven't added anything to your cart yet. Browse our products and find something you love.
                </p>
                <Link
                    href="/shop"
                    className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="container px-4 md:px-6 py-12 md:py-20 mx-auto">
            <h1 className="text-4xl font-extrabold tracking-tight mb-8 text-foreground">Shopping <span className="text-primary">Cart</span></h1>
            <div className="grid lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-6">
                    <div className="border border-border rounded-2xl bg-card overflow-hidden shadow-sm">
                        {cartItems.map((item) => (
                            <div
                                key={item.id}
                                className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-4 sm:p-6 border-b last:border-0 border-border hover:bg-muted/30 transition-colors group"
                            >
                                <div className="relative h-24 w-24 bg-muted rounded-xl overflow-hidden shrink-0 border border-border group-hover:border-primary/50 transition-colors">
                                    {item.images[0] && (
                                        <Image
                                            src={item.images[0]}
                                            alt={item.name}
                                            fill
                                            className="object-cover transition-transform group-hover:scale-110"
                                        />
                                    )}
                                </div>
                                <div className="flex-1 space-y-1 text-center sm:text-left">
                                    <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{item.name}</h3>
                                    <p className="text-sm text-muted-foreground font-medium">
                                        {item.currency} {item.price.toFixed(2)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 bg-muted/50 p-1.5 rounded-xl border border-border">
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        className="p-1.5 h-8 w-8 rounded-lg border border-border bg-background flex items-center justify-center hover:text-primary hover:border-primary transition-all disabled:opacity-30"
                                        disabled={item.quantity <= 1}
                                    >
                                        <Minus className="h-4 w-4" />
                                    </button>
                                    <span className="w-8 text-center font-bold text-foreground">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        className="p-1.5 h-8 w-8 rounded-lg border border-border bg-background flex items-center justify-center hover:text-primary hover:border-primary transition-all"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="text-right min-w-[100px]">
                                    <div className="font-extrabold text-foreground">
                                        {item.currency} {(item.price * item.quantity).toFixed(2)}
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="p-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
                                    title="Remove item"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end">
                        <button
                            onClick={clearCart}
                            className="text-sm font-bold text-muted-foreground hover:text-destructive hover:underline transition-colors"
                        >
                            Clear Cart
                        </button>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-card border border-border rounded-2xl p-8 sticky top-24 shadow-xl shadow-black/5">
                        <h2 className="text-xl font-bold mb-6 text-foreground">Order Summary</h2>
                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground font-medium">Subtotal</span>
                                <span className="font-bold text-foreground">GHS {cartTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground font-medium">Delivery</span>
                                <span className="text-primary font-bold bg-primary/10 px-2 py-0.5 rounded text-[10px] uppercase">Calculated at checkout</span>
                            </div>
                            <div className="border-t border-border pt-6 mt-6 flex justify-between items-center">
                                <span className="font-bold text-lg text-foreground">Total</span>
                                <span className="font-extrabold text-2xl text-primary">GHS {cartTotal.toFixed(2)}</span>
                            </div>
                        </div>
                        <Link
                            href="/checkout"
                            className="w-full inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-95"
                        >
                            Proceed to Checkout <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
