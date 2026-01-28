"use client";

import { useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { Product } from "@/types";
import { Loader2 } from "lucide-react";

const CATEGORIES = ["All", "Bags", "Shoes", "Clothing", "Devices", "Accessories"];

export default function ShopPage() {
    const { products, loading } = useProducts();
    const [selectedCategory, setSelectedCategory] = useState("All");

    const filteredProducts = products.filter((product) => {
        if (selectedCategory === "All") return true;
        return product.category === selectedCategory;
    });

    return (
        <div className="flex flex-col min-h-screen">
            <section className="w-full py-12 md:py-24 bg-secondary/30">
                <div className="container px-4 md:px-6 mx-auto">
                    <div className="flex flex-col items-center space-y-4 text-center">
                        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground">
                            Shop Our <span className="text-primary">Collection</span>
                        </h1>
                        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl font-medium">
                            Browse through our wide range of products available for pre-order.
                        </p>
                    </div>
                </div>
            </section>

            <section className="w-full py-12 md:py-20 bg-background">
                <div className="container px-4 md:px-6 mx-auto">
                    {/* Category Filter */}
                    <div className="flex flex-wrap justify-center gap-3 mb-12">
                        {CATEGORIES.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-6 py-2 text-sm font-semibold rounded-full transition-all duration-200 border ${selectedCategory === category
                                    ? "bg-primary text-primary-foreground border-primary shadow-lg scale-105"
                                    : "bg-background text-foreground/70 border-border hover:border-primary hover:text-primary"
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    {/* Product Grid */}
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {filteredProducts.map((product, index) => (
                                <ProductCard key={product.id} product={product} priority={index < 4} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <p className="text-lg text-muted-foreground">
                                No products found in this category.
                            </p>
                            <button
                                onClick={() => setSelectedCategory("All")}
                                className="mt-4 text-primary hover:underline"
                            >
                                View all products
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
