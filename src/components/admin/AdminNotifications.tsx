"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Package, MessageSquare, X, ChevronRight, Clock } from "lucide-react";
import { getOrdersRealtime, getSupportMessagesRealtime } from "@/lib/firestore";
import { Order, SupportMessage } from "@/types";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

type NotificationItem = {
    id: string;
    type: 'order' | 'message';
    title: string;
    description: string;
    timestamp: Date;
    link: string;
    isNew: boolean;
};

export default function AdminNotifications() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [lastReadTimestamp, setLastReadTimestamp] = useState<number>(0);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Simplified: Just use the separate raw state hooks below.
    const [rawOrders, setRawOrders] = useState<Order[]>([]);
    const [rawMessages, setRawMessages] = useState<SupportMessage[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem('adminLastReadTimestamp');
        if (stored) {
            setLastReadTimestamp(parseInt(stored));
        }
        getOrdersRealtime(setRawOrders);
        getSupportMessagesRealtime(setRawMessages);
    }, []);

    useEffect(() => {
        const orderNotifs: NotificationItem[] = rawOrders.map(order => ({
            id: order.id,
            type: 'order',
            title: `New Order: ${order.orderCode}`,
            description: `${order.items.length} items - GHS ${order.totalAmount.toFixed(2)}`,
            timestamp: new Date(order.createdAt),
            link: `/admin/orders?highlight=${order.id}`, // navigate to orders
            isNew: new Date(order.createdAt).getTime() > lastReadTimestamp
        }));

        const msgNotifs: NotificationItem[] = rawMessages.map(msg => ({
            id: msg.id,
            type: 'message',
            title: `Support: ${msg.name}`,
            description: msg.message.substring(0, 50) + (msg.message.length > 50 ? "..." : ""),
            timestamp: new Date(msg.createdAt),
            link: `/admin/support?highlight=${msg.id}`,
            isNew: new Date(msg.createdAt).getTime() > lastReadTimestamp
        }));

        const all = [...orderNotifs, ...msgNotifs].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setNotifications(all);
        setUnreadCount(all.filter(n => n.isNew).length);

    }, [rawOrders, rawMessages, lastReadTimestamp]);

    const handleMarkAllRead = () => {
        const now = new Date().getTime();
        setLastReadTimestamp(now);
        localStorage.setItem('adminLastReadTimestamp', now.toString());
    };

    // Click outside to close
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="h-10 w-10 flex items-center justify-center rounded-xl bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all relative"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 rounded-full ring-2 ring-card animate-pulse" />
                )}
            </button>

            {isOpen && (
                <div className="absolute right-[-60px] md:right-0 top-14 w-[90vw] md:w-96 bg-card border border-border rounded-3xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200">
                    <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-foreground">Notifications</h3>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllRead}
                                        className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold hover:bg-primary hover:text-primary-foreground transition-colors"
                                    >
                                        Mark all read
                                    </button>
                                )}
                            </div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Real-time Updates</p>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="md:hidden p-1 rounded-lg hover:bg-muted">
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <Bell className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                                <p className="text-sm text-muted-foreground font-medium">No checks lately.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border/50">
                                {notifications.map((item) => (
                                    <Link
                                        key={item.id}
                                        href={item.link}
                                        onClick={() => setIsOpen(false)}
                                        className={`flex gap-4 p-4 hover:bg-muted/50 transition-colors group ${item.isNew ? 'bg-primary/5' : ''}`}
                                    >
                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${item.type === 'order' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                                            }`}>
                                            {item.type === 'order' ? <Package className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <p className="font-bold text-sm text-foreground truncate">{item.title}</p>
                                                <span className="text-[10px] font-medium text-muted-foreground shrink-0 flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {formatDistanceToNow(item.timestamp, { addSuffix: true }).replace("about ", "")}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                                        </div>
                                        <div className="flex items-center text-muted-foreground group-hover:text-primary transition-colors">
                                            <ChevronRight className="h-4 w-4" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="p-3 bg-muted/30 border-t border-border text-center">
                        <Link href="/admin/orders" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline" onClick={() => setIsOpen(false)}>
                            View All Activity
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
