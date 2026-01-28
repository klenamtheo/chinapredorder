"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
    product: Product;
    priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
    const { addToCart } = useCart();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product);
    };

    const nextImage = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    };

    const prevImage = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    };

    return (
        <div className="group relative bg-card rounded-3xl overflow-hidden border border-border shadow-xl shadow-black/5 hover:shadow-2xl hover:border-primary/30 transition-all duration-300">
            <Link href={`/product/${product.id}`} className="block">
                <div className="aspect-square bg-muted/30 relative overflow-hidden group/img">
                    {product.images?.[currentImageIndex] ? (
                        <>
                            <Image
                                src={product.images[currentImageIndex]}
                                alt={product.name}
                                fill
                                priority={priority}
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                className="object-cover transition-all duration-500 group-hover:scale-110"
                            />
                            {product.images.length > 1 && (
                                <>
                                    <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 group-hover/img:opacity-100 transition-opacity">
                                        <button onClick={prevImage} className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-lg shadow-black/20">
                                            <ChevronLeft className="h-4 w-4" />
                                        </button>
                                        <button onClick={nextImage} className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-lg shadow-black/20">
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 px-4 pointer-events-none">
                                        {product.images.map((_, i) => (
                                            <div
                                                key={i}
                                                className={`h-1.5 rounded-full transition-all duration-300 ${i === currentImageIndex ? "w-4 bg-primary" : "w-1.5 bg-white/50"}`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground uppercase text-[10px] font-black tracking-widest">
                            No Image
                        </div>
                    )}
                </div>
            </Link>
            <div className="p-4 space-y-2">
                <Link href={`/product/${product.id}`} className="block">
                    <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                        {product.name}
                    </h3>
                </Link>
                <div className="flex items-center justify-between">
                    <span className="font-bold text-xl">
                        {product.currency} {product.price.toFixed(2)}
                    </span>
                    <button
                        onClick={handleAddToCart}
                        className="inline-flex items-center justify-center rounded-md bg-primary p-2 text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 transition-colors"
                        title="Add to Cart"
                    >
                        <ShoppingCart className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
