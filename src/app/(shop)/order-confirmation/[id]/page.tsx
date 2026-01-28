import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default async function OrderConfirmationPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    return (
        <div className="container px-4 md:px-6 py-24 mx-auto flex flex-col items-center text-center space-y-6">
            <div className="p-6 bg-green-100 dark:bg-green-900/20 rounded-full">
                <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl font-bold">Order Placed Successfully!</h1>
            <p className="text-muted-foreground max-w-[600px]">
                Thank you for your order. Your Order ID is <span className="font-mono font-bold text-foreground">{id}</span>.
                We will send you updates regarding your shipment status.
            </p>

            <div className="flex gap-4">
                <Link
                    href="/shop"
                    className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                    Continue Shopping
                </Link>
                <Link
                    href="/track"
                    className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                    Track Order
                </Link>
            </div>
        </div>
    );
}
