"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProductRealtime } from "@/lib/firestore";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { Loader2, ArrowLeft, ShoppingCart, ChevronLeft, ChevronRight, CheckCircle, ShieldCheck, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function ProductDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { addToCart } = useCart();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        if (!id) return;
        const unsubscribe = getProductRealtime(id as string, (data) => {
            setProduct(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
                <h1 className="text-2xl font-black text-foreground mb-4">Product Not Found</h1>
                <Link href="/shop" className="text-primary font-black hover:underline uppercase tracking-widest text-xs">Back to Shop</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="container mx-auto px-6 pt-12">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-black text-[10px] uppercase tracking-[0.2em] mb-12 group">
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back
                </button>

                <div className="grid lg:grid-cols-2 gap-16 items-start">
                    {/* Image Gallery */}
                    <div className="space-y-6">
                        <div className="aspect-square bg-card border border-border rounded-[40px] overflow-hidden relative group/hero shadow-2xl shadow-black/10">
                            {product.images?.[currentImageIndex] ? (
                                <Image
                                    src={product.images[currentImageIndex]}
                                    alt={product.name}
                                    fill
                                    className="object-cover transition-all duration-700"
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-muted-foreground/30 font-black uppercase tracking-widest">No Image</div>
                            )}

                            {product.images && product.images.length > 1 && (
                                <div className="absolute inset-0 flex items-center justify-between p-6 opacity-0 group-hover/hero:opacity-100 transition-all">
                                    <button
                                        onClick={() => setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length)}
                                        className="h-12 w-12 rounded-full bg-background/80 backdrop-blur-md border border-border flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-xl"
                                    >
                                        <ChevronLeft className="h-6 w-6" />
                                    </button>
                                    <button
                                        onClick={() => setCurrentImageIndex((prev) => (prev + 1) % product.images.length)}
                                        className="h-12 w-12 rounded-full bg-background/80 backdrop-blur-md border border-border flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-xl"
                                    >
                                        <ChevronRight className="h-6 w-6" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {product.images && product.images.length > 1 && (
                            <div className="flex gap-4">
                                {product.images.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentImageIndex(i)}
                                        className={`h-24 w-24 rounded-2xl border-2 overflow-hidden transition-all ${i === currentImageIndex ? 'border-primary scale-105 shadow-lg shadow-primary/20' : 'border-border grayscale hover:grayscale-0'}`}
                                    >
                                        <img src={img} className="h-full w-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="space-y-10">
                        <div>
                            <span className="px-3 py-1 bg-primary/10 rounded-full text-[10px] font-black text-primary uppercase tracking-widest border border-primary/20">{product.category}</span>
                            <h1 className="text-5xl font-black text-foreground tracking-tighter mt-4 leading-tight">{product.name}</h1>
                            <p className="text-3xl font-black text-primary mt-4 tracking-tight">{product.currency} {product.price.toFixed(2)}</p>
                        </div>

                        <div className="prose prose-invert">
                            <p className="text-muted-foreground font-medium leading-relaxed text-lg">
                                {product.description || "No description available for this product. High-quality premium item available for immediate purchase at Nocta."}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-card border border-border rounded-3xl flex items-center gap-3">
                                <ShieldCheck className="h-6 w-6 text-primary" />
                                <div>
                                    <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Quality Guaranteed</p>
                                    <p className="text-xs text-muted-foreground font-medium">Verified Quality</p>
                                </div>
                            </div>
                            <div className="p-4 bg-card border border-border rounded-3xl flex items-center gap-3">
                                <Truck className="h-6 w-6 text-primary" />
                                <div>
                                    <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Fast Delivery</p>
                                    <p className="text-xs text-muted-foreground font-medium">Across Ghana</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => addToCart(product)}
                            className="w-full h-16 bg-primary text-primary-foreground rounded-3xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-primary/30 hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
                        >
                            <ShoppingCart className="h-5 w-5 group-hover:-translate-y-1 transition-transform" />
                            Add to Cart
                        </button>

                        <div className="p-6 bg-muted/30 rounded-[32px] border border-border border-dashed space-y-4">
                            <h4 className="text-[10px] font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" /> Store Information
                            </h4>
                            <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                                This item is in stock and ready for delivery. Estimated delivery time is 1-3 business days depending on your location in Ghana. You will receive a tracking code once the item is dispatched.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
