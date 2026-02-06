"use client";

import { useState, useEffect } from "react";
import { Search, Package, Truck, CheckCircle, Clock, MapPin, Loader2, ArrowLeft } from "lucide-react";
import { getOrderByCodeRealtime } from "@/lib/firestore";
import { Order } from "@/types";
import { useToast } from "@/context/ToastContext";
import Link from "next/link";
import Image from "next/image";

const STATUS_STEPS = [
    { key: "paid", label: "Paid", description: "Order confirmed and payment received", icon: Clock },
    { key: "processing", label: "Processing", description: "We are preparing your items", icon: Package },
    { key: "packed", label: "Packed", description: "Order is packed and ready for dispatch", icon: CheckCircle },
    { key: "in_transit", label: "In Transit", description: "Agent is on the way to your location", icon: Truck },
    { key: "delivered", label: "Delivered", description: "Package received safely", icon: CheckCircle },
];

export default function TrackOrderPage() {
    const [orderCode, setOrderCode] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [order, setOrder] = useState<Order | null>(null);
    const [searching, setSearching] = useState(false);
    const [hasTyped, setHasTyped] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        if (!searchQuery) return;

        setSearching(true);
        const unsubscribe = getOrderByCodeRealtime(searchQuery.trim(), (data) => {
            setOrder(data);
            setSearching(false);
            setHasTyped(true);
        });

        return () => unsubscribe();
    }, [searchQuery]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();

        const code = orderCode.trim();
        if (!code) {
            showToast("Please enter an order code", "error");
            return;
        }

        // Basic format validation
        if (!code.startsWith("ORD-GH-")) {
            showToast("Invalid format. Code starts with ORD-GH-", "error");
            return;
        }

        setSearchQuery(code);
    };

    const currentStatusIndex = order ? STATUS_STEPS.findIndex(step => step.key === order.orderStatus) : -1;

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <section className="w-full py-12 md:py-24 bg-secondary/30 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(250,204,21,0.1),transparent)]" />
                <div className="container px-4 md:px-6 mx-auto relative z-10">
                    <div className="flex flex-col items-center space-y-6 text-center">
                        <div className="space-y-3">
                            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-foreground">
                                Track Your <span className="text-primary">Order</span>
                            </h1>
                            <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl font-medium">
                                Enter your order code to see the real-time status of your delivery.
                            </p>
                        </div>
                        <form onSubmit={handleSearch} className="w-full max-w-md flex gap-3 p-1 bg-card border border-border rounded-2xl shadow-2xl focus-within:border-primary transition-colors">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="e.g. ORD-GH-2026-12345"
                                    className="w-full pl-12 pr-4 h-12 bg-transparent text-sm font-bold focus:outline-none placeholder:font-normal dark:placeholder:text-white"
                                    value={orderCode}
                                    onChange={(e) => setOrderCode(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={!orderCode || searching}
                                className="px-6 h-12 bg-primary text-primary-foreground rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-primary/20 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                            >
                                {searching ? <Loader2 className="h-5 w-5 animate-spin" /> : "Track"}
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            <section className="flex-1 py-12 md:py-20">
                <div className="container px-4 md:px-6 mx-auto max-w-5xl">
                    {!order && hasTyped && !searching && (
                        <div className="flex flex-col items-center justify-center p-12 text-center bg-card border border-border rounded-3xl animate-in fade-in slide-in-from-bottom-4">
                            <div className="h-16 w-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-4">
                                <Package className="h-8 w-8" />
                            </div>
                            <h2 className="text-xl font-bold mb-2">Order Not Found</h2>
                            <p className="text-muted-foreground font-medium mb-6">
                                We couldn't find an order with the code <span className="text-foreground font-bold">{searchQuery}</span>.
                                Please check for typos and try again.
                            </p>
                            <button onClick={() => setHasTyped(false)} className="text-primary font-bold hover:underline flex items-center gap-2">
                                <ArrowLeft className="h-4 w-4" /> Go Back
                            </button>
                        </div>
                    )}

                    {order && (
                        <div className="animate-in fade-in duration-500">
                            <div className="grid lg:grid-cols-3 gap-8">
                                {/* Left Side: Order Status Stepper */}
                                <div className="lg:col-span-2 space-y-8">
                                    <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
                                        <div className="flex flex-wrap items-center justify-between gap-4 mb-10 pb-6 border-b border-border">
                                            <div>
                                                <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Current Status</p>
                                                <h3 className="text-2xl font-extrabold capitalize text-foreground">{order.orderStatus.replace(/_/g, " ")}</h3>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Updated</p>
                                                <p className="text-sm font-bold text-foreground">
                                                    {new Date(order.updatedAt || order.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="relative space-y-8">
                                            {STATUS_STEPS.map((step, index) => {
                                                const StepIcon = step.icon;
                                                const isCompleted = index <= currentStatusIndex;
                                                const isCurrent = index === currentStatusIndex;

                                                return (
                                                    <div key={step.key} className="flex gap-6 relative group">
                                                        {/* Line connecting steps */}
                                                        {index !== STATUS_STEPS.length - 1 && (
                                                            <div className={`absolute left-[23px] top-[46px] w-[2px] h-[calc(100%-14px)] z-0 ${isCompleted ? 'bg-primary' : 'bg-border'}`} />
                                                        )}

                                                        {/* Step Indicator Dot/Icon */}
                                                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 z-10 transition-all duration-300 ${isCompleted ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30 rotate-3' : 'bg-muted text-muted-foreground'
                                                            } ${isCurrent ? 'ring-4 ring-primary/20 scale-110' : ''}`}>
                                                            {isCompleted && index < currentStatusIndex ? <CheckCircle className="h-6 w-6" /> : <StepIcon className="h-6 w-6" />}
                                                        </div>

                                                        <div className="pt-1 flex-1">
                                                            <h4 className={`text-lg font-bold transition-colors ${isCompleted ? 'text-foreground' : 'text-muted-foreground/60'}`}>
                                                                {step.label}
                                                            </h4>
                                                            <p className={`text-sm font-medium transition-colors ${isCompleted ? 'text-muted-foreground' : 'text-muted-foreground/40'}`}>
                                                                {step.description}
                                                            </p>
                                                            {isCurrent && (
                                                                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold animate-pulse">
                                                                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                                                    IN PROGRESS
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Order Summary */}
                                <div className="space-y-6">
                                    <div className="bg-card border border-border rounded-3xl p-8 shadow-sm h-fit sticky top-24">
                                        <h3 className="text-xl font-extrabold mb-6 text-foreground">Order Details</h3>

                                        <div className="space-y-4 mb-8">
                                            <div className="flex justify-between py-2 border-b border-border/50">
                                                <span className="text-sm font-medium text-muted-foreground">Order ID</span>
                                                <span className="text-sm font-bold text-foreground">{order.orderCode}</span>
                                            </div>
                                            <div className="flex justify-between py-2 border-b border-border/50">
                                                <span className="text-sm font-medium text-muted-foreground">Customer</span>
                                                <span className="text-sm font-bold text-foreground">{order.customerName}</span>
                                            </div>
                                            <div className="flex justify-between py-2">
                                                <span className="text-sm font-medium text-muted-foreground">Phone</span>
                                                <span className="text-sm font-bold text-foreground">{order.customerPhone}</span>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-xl font-extrabold text-foreground">Order Summary</h3>
                                            <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                                                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                                                <span className="text-[10px] font-black text-primary uppercase tracking-widest">Live Sync</span>
                                            </div>
                                        </div>

                                        <div className="space-y-4 mb-8">
                                            <div className="grid grid-cols-4 text-[10px] uppercase font-black text-muted-foreground tracking-widest px-2">
                                                <span className="col-span-2">Product</span>
                                                <span className="text-center">Qty</span>
                                                <span className="text-right">Price</span>
                                            </div>
                                            <div className="space-y-3 max-h-[300px] overflow-auto pr-2">
                                                {order.items.map((item, i) => (
                                                    <div key={i} className="grid grid-cols-4 items-center p-2 rounded-2xl bg-muted/20 group hover:bg-muted/40 transition-all border border-transparent hover:border-border">
                                                        <div className="col-span-2 flex items-center gap-3 min-w-0">
                                                            <div className="h-9 w-9 bg-muted rounded-xl overflow-hidden shrink-0 border border-border shadow-sm group-hover:scale-105 transition-transform">
                                                                {item.images[0] ? (
                                                                    <img src={item.images[0]} alt="" className="h-full w-full object-cover" />
                                                                ) : (
                                                                    <Package className="h-4 w-4 m-auto" />
                                                                )}
                                                            </div>
                                                            <p className="text-xs font-bold text-foreground truncate pr-2" title={item.name}>{item.name}</p>
                                                        </div>
                                                        <span className="text-xs font-black text-foreground text-center">{item.quantity}</span>
                                                        <span className="text-xs font-bold text-foreground text-right">{(item.price * item.quantity).toFixed(2)}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="mt-6 pt-6 border-t border-border space-y-4">
                                                <div className="flex justify-between items-center px-4 py-3 bg-muted/20 rounded-2xl">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Delivery Fee</span>
                                                        {order.deliveryFee > 0 && <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" title="Updated in real-time" />}
                                                    </div>
                                                    <span className="text-sm font-black text-foreground">
                                                        {order.deliveryFee > 0 ? `GHS ${order.deliveryFee.toFixed(2)}` : "Paid at Delivery"}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col gap-2 px-2">
                                                    <div className="flex justify-between items-center px-2">
                                                        <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Subtotal</span>
                                                        <span className="text-sm font-bold text-foreground">GHS {(order.totalAmount - (order.deliveryFee || 0)).toFixed(2)}</span>
                                                    </div>
                                                    <div className="border-t border-border pt-4 flex justify-between items-center px-2">
                                                        <span className="font-black text-lg text-foreground uppercase tracking-tighter italic">Total Amount</span>
                                                        <div className="text-right">
                                                            <span className="text-primary text-3xl font-black tracking-tight drop-shadow-sm">GHS {order.totalAmount.toFixed(2)}</span>
                                                            <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest mt-1">Order Verified</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-8 p-4 bg-muted/30 rounded-2xl border border-border">
                                            <div className="flex items-start gap-3">
                                                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-xs font-bold text-foreground uppercase tracking-tight">Delivery Location</p>
                                                    <p className="text-sm font-medium text-muted-foreground">{order.location}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {!order && !hasTyped && !searching && (
                        <div className="grid md:grid-cols-2 gap-8 items-center py-12">
                            <div className="space-y-6">
                                <h2 className="text-3xl font-extrabold text-foreground leading-tight">
                                    How Tracking <span className="text-primary">Works</span>
                                </h2>
                                <p className="text-muted-foreground font-medium leading-relaxed">
                                    Once your order is confirmed, our local team begins processing your items immediately.
                                    Our system updates your status automatically at every major milestone.
                                </p>
                                <ul className="space-y-4">
                                    {[
                                        "Real-time visibility from our local warehouse to your doorstep.",
                                        "Notification at every major processing milestone.",
                                        "Exact GPS tracking once our local delivery agent is assigned."
                                    ].map((item, i) => (
                                        <li key={i} className="flex gap-3 font-bold text-sm text-foreground">
                                            <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-card border border-border rounded-[40px] p-2 shadow-2xl overflow-hidden aspect-video relative">
                                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-transparent z-0" />
                                <div className="relative z-10 h-full w-full bg-muted/50 rounded-[32px] flex items-center justify-center">
                                    <Package className="h-20 w-20 text-muted-foreground/30 animate-bounce" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
