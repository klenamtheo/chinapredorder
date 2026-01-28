"use client";

import { useState, useEffect } from "react";
import { getProductsRealtime } from "@/lib/firestore";
import { Product } from "@/types";

export function useProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = getProductsRealtime((data) => {
            setProducts(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { products, loading };
}
