"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Package, ShoppingBag, TrendingUp, ArrowUpRight, Clock, Truck, PlusCircle, Trash2, Edit, Activity, Loader2 } from "lucide-react";
import { Order, Product, AdminLog, SupportMessage } from "@/types";
import { getOrdersRealtime, getProductsRealtime, getAdminLogsRealtime, getSupportMessagesRealtime } from "@/lib/firestore";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function AdminDashboardPage() {
    const [user, setUser] = useState<any>(null);
    const [activityFeed, setActivityFeed] = useState<any[]>([]);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [timeAgo, setTimeAgo] = useState("Just now");
    const [downloading, setDownloading] = useState(false);

    const handleDownloadReport = () => {
        setDownloading(true);
        try {
            // 1. Prepare Data
            const csvRows = [];

            // Header
            csvRows.push(['Nocta Admin Report', `Generated: ${new Date().toLocaleString()}`]);
            csvRows.push([]); // Empty line

            // Stats Section
            csvRows.push(['STATISTICS']);
            csvRows.push(['Metric', 'Value']);
            csvRows.push(['Total Revenue', `GHS ${stats.totalRevenue.toFixed(2)}`]);
            csvRows.push(['Total Orders', stats.totalOrders]);
            csvRows.push(['Paid Orders', stats.paidOrders]);
            csvRows.push(['Pending Deliveries', stats.pendingDeliveries]);
            csvRows.push(['Active Products', stats.activeProducts]);
            csvRows.push([]); // Empty line

            // Activity Log Section
            csvRows.push(['RECENT ACTIVITY LOG']);
            csvRows.push(['Timestamp', 'Type', 'Entity', 'Action', 'Details', 'Performed By']);

            activityFeed.forEach(log => {
                csvRows.push([
                    new Date(log.timestamp).toLocaleString(),
                    log.type,
                    log.entity,
                    log.action,
                    log.details.replace(/,/g, ' '), // Basic comma escape
                    log.performedBy
                ]);
            });

            // 2. Create CSV Blob
            const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
            const encodedUri = encodeURI(csvContent);

            // 3. Trigger Download
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `admin_report_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            console.error("Failed to download report", error);
            alert("Failed to generate report. Please try again.");
        } finally {
            setDownloading(false);
        }
    };

    // Stats State
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        paidOrders: 0,
        pendingDeliveries: 0,
        activeProducts: 0,
    });

    // Helper to format "time ago"
    useEffect(() => {
        const interval = setInterval(() => {
            const seconds = Math.floor((new Date().getTime() - lastUpdated.getTime()) / 1000);
            if (seconds < 60) setTimeAgo(`${seconds}s ago`);
            else if (seconds < 3600) setTimeAgo(`${Math.floor(seconds / 60)}m ago`);
            else setTimeAgo(`${Math.floor(seconds / 3600)}h ago`);
        }, 1000);
        return () => clearInterval(interval);
    }, [lastUpdated]);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
            }
        });
        return () => unsubscribeAuth();
    }, []);

    useEffect(() => {
        if (!user) return;

        // Unified Data Fetching
        let currentOrders: Order[] = [];
        let currentProducts: Product[] = [];
        let currentLogs: AdminLog[] = [];
        let currentMessages: SupportMessage[] = [];

        const updateFeed = () => {
            const feed: any[] = [];

            // 1. Order Events
            currentOrders.forEach(order => {
                feed.push({
                    id: `order-new-${order.id}`,
                    type: 'order',
                    action: 'create',
                    details: `New Order: ${order.orderCode} (${order.items.length} items)`,
                    performedBy: order.customerEmail,
                    timestamp: new Date(order.createdAt).getTime(),
                    entity: 'order'
                });
            });

            // 2. Product Events (from logs for now, or createdAt)
            currentProducts.forEach(product => {
                // If recently created
                feed.push({
                    id: `prod-new-${product.id}`,
                    type: 'product',
                    action: 'create',
                    details: `New Product: ${product.name}`,
                    performedBy: 'System', // Metadata handling improvement needed for creator
                    timestamp: new Date(product.createdAt).getTime(),
                    entity: 'product'
                });
            });

            // 3. Admin Logs (Manual actions)
            currentLogs.forEach(log => {
                feed.push({
                    id: `log-${log.id}`,
                    type: 'admin',
                    action: log.action,
                    details: log.details,
                    performedBy: log.performedBy,
                    timestamp: new Date(log.performedAt).getTime(),
                    entity: log.entity
                });
            });

            // 4. Support Messages
            currentMessages.forEach(msg => {
                feed.push({
                    id: `msg-${msg.id}`,
                    type: 'support',
                    action: 'create',
                    details: `Support Inquiry from ${msg.name}`,
                    performedBy: msg.email,
                    timestamp: new Date(msg.createdAt).getTime(),
                    entity: 'support'
                });
            });

            // Sort and Update
            feed.sort((a, b) => b.timestamp - a.timestamp);
            setActivityFeed(feed.slice(0, 20)); // Keep last 20 events
            setLastUpdated(new Date());
        };

        const unsubscribeOrders = getOrdersRealtime((orders) => {
            currentOrders = orders;
            setStats(prev => ({
                ...prev,
                totalOrders: orders.length,
                totalRevenue: orders.reduce((sum, o) => sum + o.totalAmount, 0),
                paidOrders: orders.filter(o => o.paymentStatus === 'paid').length,
                pendingDeliveries: orders.filter(o => o.orderStatus !== 'delivered').length
            }));
            updateFeed();
        });

        const unsubscribeProducts = getProductsRealtime((products) => {
            currentProducts = products;
            setStats(prev => ({
                ...prev,
                activeProducts: products.filter(p => p.isEnabled).length
            }));
            updateFeed();
        }, true);

        const unsubscribeLogs = getAdminLogsRealtime((logs) => {
            currentLogs = logs;
            updateFeed();
        });

        const unsubscribeSupport = getSupportMessagesRealtime((messages) => {
            currentMessages = messages;
            updateFeed();
        });

        return () => {
            unsubscribeOrders();
            unsubscribeProducts();
            unsubscribeLogs();
            unsubscribeSupport();
        };
    }, [user]);

    if (!user) return null;

    return (
        <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Dashboard</h1>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl shadow-sm text-xs font-bold text-muted-foreground animate-pulse">
                    <Clock className="h-4 w-4 text-primary" />
                    Last updated: {timeAgo}
                </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
                {[
                    { label: "Total Revenue", value: `GHS ${stats.totalRevenue.toFixed(2)}`, trend: "Lifetime", icon: TrendingUp, color: "text-green-500" },
                    { label: "Paid Orders", value: stats.paidOrders.toString(), trend: "Verified", icon: ShoppingBag, color: "text-primary" },
                    { label: "Pending Deliveries", value: stats.pendingDeliveries.toString(), trend: "Active", icon: Truck, color: "text-indigo-500" },
                    { label: "Active Products", value: stats.activeProducts.toString(), trend: "Live", icon: Package, color: "text-orange-500" },
                ].map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className="p-6 rounded-2xl border border-border bg-card shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl bg-muted group-hover:bg-primary/10 transition-colors`}>
                                    <Icon className={`h-6 w-6 ${stat.color}`} />
                                </div>


                            </div>
                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</h3>
                            <div className="mt-1 text-2xl font-black text-foreground tracking-tight">{stat.value}</div>
                        </div>
                    );
                })}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 border border-border rounded-2xl bg-card overflow-hidden shadow-xl shadow-black/5">
                    <div className="p-6 border-b border-border flex items-center justify-between">
                        <h3 className="font-bold text-lg text-foreground">Live Activity Feed</h3>
                        <div className="flex items-center gap-1 text-xs font-bold text-primary">
                            Real-time <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span></span>
                        </div>
                    </div>
                    <div className="divide-y divide-border">
                        {activityFeed.map((log) => {
                            let href = "#";
                            if (log.type === 'order') href = "/admin/orders";
                            else if (log.type === 'product') href = "/admin/products";
                            else if (log.type === 'support') href = "/admin/support";

                            return (
                                <Link key={log.id} href={href} className="block group">
                                    <div className="p-4 flex items-center justify-between group-hover:bg-muted/30 transition-colors animate-in slide-in-from-top-2 duration-300">
                                        <div className="flex items-center gap-4">
                                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${log.type === 'order' ? 'bg-indigo-500/10 text-indigo-500' :
                                                log.type === 'product' ? 'bg-orange-500/10 text-orange-500' :
                                                    log.type === 'support' ? 'bg-blue-500/10 text-blue-500' :
                                                        'bg-primary/10 text-primary'
                                                }`}>
                                                {log.type === 'order' ? <ShoppingBag className="h-5 w-5" /> :
                                                    log.type === 'product' ? <Package className="h-5 w-5" /> :
                                                        log.type === 'support' ? <Truck className="h-5 w-5" /> :
                                                            <Activity className="h-5 w-5" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{log.details}</p>
                                                <p className="text-xs text-muted-foreground font-medium">{log.performedBy} • {new Date(log.timestamp).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted px-2 py-1 rounded-full group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                {log.entity}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                        {activityFeed.length === 0 && (
                            <div className="p-10 text-center text-muted-foreground flex flex-col items-center gap-4">
                                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center">
                                    <Clock className="h-8 w-8 text-muted-foreground/30" />
                                </div>
                                <p className="text-sm font-bold text-foreground">No recent activity detected.</p>
                            </div>
                        )}
                    </div>
                </div>
                <div className="border border-border rounded-2xl bg-card p-8 shadow-xl shadow-black/5">
                    <h3 className="font-bold text-lg text-foreground mb-6">Quick Actions</h3>
                    <div className="space-y-3">
                        <Link href="/admin/products" className="w-full h-12 flex items-center justify-center bg-primary text-primary-foreground rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                            Add New Product
                        </Link>
                        <Link href="/admin/orders" className="w-full h-12 flex items-center justify-center bg-muted text-foreground rounded-xl font-bold text-sm hover:bg-muted/80 transition-all border border-border">
                            Manage Orders
                        </Link>
                        <button
                            onClick={handleDownloadReport}
                            disabled={downloading}
                            className="w-full h-12 flex items-center justify-center bg-muted text-foreground rounded-xl font-bold text-sm hover:bg-muted/80 transition-all border border-border"
                        >
                            {downloading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Download Report
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
