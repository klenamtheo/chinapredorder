"use client";

import Link from "next/link";
import { Star, Sparkles, ArrowRight, Package, Truck, CheckCircle, Loader2 } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { FAQ } from "@/components/FAQ";
import { useProducts } from "@/hooks/useProducts";

export default function Home() {
  const { products, loading } = useProducts();

  return (
    <div className="flex flex-col min-h-screen">
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-secondary/30 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-20 left-10 opacity-10 animate-float">
          <Star className="h-12 w-12 text-primary" />
        </div>
        <div className="absolute bottom-20 right-10 opacity-10 animate-float" style={{ animationDelay: '1s' }}>
          <Star className="h-16 w-16 text-primary" />
        </div>

        <div className="container px-4 md:px-6 mx-auto relative z-10">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-4">
              <h1 className="text-6xl font-black tracking-tighter sm:text-7xl md:text-8xl lg:text-9xl text-foreground flex items-center justify-center gap-4 md:gap-8">
                <Sparkles className="h-8 w-8 md:h-16 md:w-16 text-primary animate-shine" />
                <span className="bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
                  Nocta
                </span>
                <Sparkles className="h-8 w-8 md:h-16 md:w-16 text-primary animate-shine" style={{ animationDelay: '1s' }} />
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl font-medium tracking-tight">
                Your premium digital store for the latest fashion, sneakers, and accessories. Experience quality and style delivered to your doorstep.
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {products.slice(0, 10).map((product, index) => (
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
              <h2 className="text-xl font-bold">Premium Selection</h2>
              <p className="text-muted-foreground">
                Explore our curated collection of premium products, from sneakers to office wear, all available in stock.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="p-4 bg-primary/10 rounded-full">
                <CheckCircle className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-xl font-bold">Local Convenience</h2>
              <p className="text-muted-foreground">
                Shopping made easy right here in Ghana. No international waiting times or hidden fees.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="p-4 bg-primary/10 rounded-full">
                <Truck className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-xl font-bold">Same Day Delivery</h2>
              <p className="text-muted-foreground">
                Enjoy reliable and ultra-fast shipping from our local warehouse in Ghana to your doorstep.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
