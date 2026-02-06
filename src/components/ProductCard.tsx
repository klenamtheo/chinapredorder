"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";

interface ProductCardProps {
    product: Product;
    priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
    const { addToCart } = useCart();
    const { showToast } = useToast();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product);
        showToast(`Added ${product.name} to cart!`, "success");
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
        <div className="group relative bg-card rounded-2xl overflow-hidden border border-border shadow-md hover:shadow-xl transition-all duration-300">
            <Link href={`/product/${product.id}`} className="block">
                <div className="aspect-square bg-muted/30 relative overflow-hidden group/img">
                    {/* Status Tag */}
                    <div className="absolute top-3 right-3 z-10">
                        <span className="bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">
                            In Stock
                        </span>
                    </div>

                    {product.images?.[currentImageIndex] ? (
                        <>
                            <Image
                                src={product.images[currentImageIndex]}
                                alt={product.name}
                                fill
                                priority={priority}
                                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                                className="object-cover transition-all duration-500 group-hover:scale-105"
                            />
                            {product.images.length > 1 && (
                                <>
                                    <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 group-hover/img:opacity-100 transition-opacity">
                                        <button onClick={prevImage} className="h-6 w-6 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                                            <ChevronLeft className="h-3 w-3" />
                                        </button>
                                        <button onClick={nextImage} className="h-6 w-6 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                                            <ChevronRight className="h-3 w-3" />
                                        </button>
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
            <div className="p-4 space-y-1">
                {/* Category */}
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    {product.category || "General"}
                </p>

                {/* Name */}
                <Link href={`/product/${product.id}`} className="block">
                    <h3 className="font-bold text-base truncate group-hover:text-primary transition-colors">
                        {product.name}
                    </h3>
                </Link>

                {/* Price */}
                <div className="pt-1">
                    <p className="font-bold text-lg text-primary">
                        {product.currency} {product.price.toFixed(2)}
                    </p>
                </div>

                {/* Add to cart button */}
                <div className="pt-2">
                    <button
                        onClick={handleAddToCart}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-primary-foreground text-xs font-bold hover:bg-yellow-400 hover:text-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-primary/10"
                    >
                        <ShoppingCart className="h-4 w-4" />
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
}
