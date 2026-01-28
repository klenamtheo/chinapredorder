"use client";

import Link from "next/link";
import { ArrowRight, Package, Truck, CheckCircle, Loader2 } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { FAQ } from "@/components/FAQ";
import { useProducts } from "@/hooks/useProducts";

export default function Home() {
  const { products, loading } = useProducts();

  return (
    <div className="flex flex-col min-h-screen">
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-secondary/30">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-4">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl/none text-foreground flex flex-col items-center gap-2">
                <span>Import Direct from</span>
                <span className="text-primary flex flex-wrap justify-center items-center gap-2 md:gap-6 mt-2">
                  China
                  <ArrowRight className="h-6 w-6 md:h-16 md:w-16 animate-pulse" />
                  Ghana
                </span>
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl font-medium">
                Secure pre-orders, transparent tracking, and reliable delivery. The smartest way to shop for quality goods.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                href="/shop"
              >
                Shop Now
              </Link>
              <Link
                className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                href="/track"
              >
                Track Order
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Featured Products</h2>
            <Link href="/shop" className="text-sm font-medium text-primary hover:underline flex items-center">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.slice(0, 4).map((product, index) => (
                <ProductCard key={product.id} product={product} priority={true} />
              ))}
              {products.length === 0 && (
                <p className="col-span-full text-center text-muted-foreground">No products available at the moment.</p>
              )}
            </div>
          )}
        </div>
      </section>

      <FAQ />

      <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary/10 border-t border-border">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="p-4 bg-primary/10 rounded-full">
                <Package className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-xl font-bold">Browse & Order</h2>
              <p className="text-muted-foreground">
                Select from our curated list of high-quality products available for pre-order.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="p-4 bg-primary/10 rounded-full">
                <CheckCircle className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-xl font-bold">Secure Payment</h2>
              <p className="text-muted-foreground">
                Pay securely using Mobile Money or Card. Your funds are safe with us.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="p-4 bg-primary/10 rounded-full">
                <Truck className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-xl font-bold">Track & Receive</h2>
              <p className="text-muted-foreground">
                Follow your order from the supplier in China to your doorstep in Ghana.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
