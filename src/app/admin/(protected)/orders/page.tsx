"use client";

import React, { useState, useEffect } from "react";
import { Search, Loader2, Truck, CheckCircle, Clock, Package, MapPin, ExternalLink, Settings } from "lucide-react";
import { Order } from "@/types";
import { getOrdersRealtime, updateOrderStatus, updateOrder } from "@/lib/firestore";
import { useToast } from "@/context/ToastContext";

export const dynamic = "force-dynamic";

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();
    const [editingOrder, setEditingOrder] = useState<string | null>(null);
    const [editData, setEditData] = useState({ deliveryFee: 0, totalAmount: 0, shipmentTrackingNumber: "" });
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [filterPayment, setFilterPayment] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

    useEffect(() => {
        try {
            const unsubscribe = getOrdersRealtime((data) => {
                setOrders(data);
                setLoading(false);
            });
            return () => unsubscribe();
        } catch (err) {
            console.warn("Firestore connection failed. showing empty state/mock", err);
            setLoading(false);
        }
    }, []);

    const handleStatusUpdate = async (id: string, newStatus: Order['orderStatus']) => {
        try {
            await updateOrderStatus(id, newStatus);
            showToast("Order status updated!");
        } catch (err) {
            console.error("Failed to update status", err);
            showToast("Failed to update status.", "error");
        }
    };

    const startEditing = (order: Order) => {
        setEditingOrder(order.id);
        setEditData({
            deliveryFee: order.deliveryFee,
            totalAmount: order.totalAmount,
            shipmentTrackingNumber: order.shipmentTrackingNumber || ""
        });
    };

    const saveEdit = async (id: string) => {
        // Validation
        if (editData.deliveryFee < 0) {
            showToast("Delivery fee cannot be negative", "error");
            return;
        }

        if (editData.totalAmount <= 0) {
            showToast("Total amount must be greater than 0", "error");
            return;
        }

        try {
            await updateOrder(id, editData);
            setEditingOrder(null);
            showToast("Order details updated!");
        } catch (err) {
            console.error("Failed to update order", err);
            showToast("Failed to update order.", "error");
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesStatus = filterStatus === "all" || order.orderStatus === filterStatus;
        const matchesPayment = filterPayment === "all" || order.paymentStatus === filterPayment;
        const matchesSearch = order.orderCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customerName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesPayment && matchesSearch;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center p-24">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <header className="h-20 border-b border-border bg-card flex items-center px-8 justify-between sticky top-0 z-10">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Orders <span className="text-primary">Management</span></h1>
                    <p className="text-xs text-muted-foreground font-medium">Monitor and update customer order statuses</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="h-10 px-4 bg-muted/50 rounded-xl flex items-center gap-2 border border-border">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-xs font-bold text-foreground">Live Updates Active</span>
                    </div>
                </div>
            </header>

            <main className="p-8 flex-1 bg-muted/30">
                <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-2xl shadow-black/5">
                    <div className="p-6 border-b border-border bg-muted/20 flex flex-wrap gap-4 items-center">
                        <div className="relative flex-1 min-w-[300px]">
                            <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                            <input
                                placeholder="Search by Order Code or Customer Name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 flex h-11 w-full rounded-xl border border-border bg-background px-3 py-1 text-sm font-medium transition-all placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                        </div>
                        <div className="flex gap-4">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="h-11 px-4 rounded-xl border border-border bg-background text-xs font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="all">All Statuses</option>
                                <option value="paid">Paid</option>
                                <option value="supplier_ordered">Supplier Ordered</option>
                                <option value="in_transit">In Transit</option>
                                <option value="arrived">Arrived GH</option>
                                <option value="out_for_delivery">Out for Delivery</option>
                                <option value="delivered">Delivered</option>
                            </select>
                            <select
                                value={filterPayment}
                                onChange={(e) => setFilterPayment(e.target.value)}
                                className="h-11 px-4 rounded-xl border border-border bg-background text-xs font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="all">All Payments</option>
                                <option value="paid">Paid</option>
                                <option value="pending">Pending</option>
                                <option value="failed">Failed</option>
                            </select>
                        </div>
                    </div>

                    <div className="relative w-full overflow-auto">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="bg-muted/50">
                                <tr className="border-b border-border">
                                    <th className="h-14 px-6 align-middle font-black text-muted-foreground text-[10px] uppercase tracking-widest">Order Details</th>
                                    <th className="h-14 px-6 align-middle font-black text-muted-foreground text-[10px] uppercase tracking-widest">Customer</th>
                                    <th className="h-14 px-6 align-middle font-black text-muted-foreground text-[10px] uppercase tracking-widest">Fees & Total</th>
                                    <th className="h-14 px-6 align-middle font-black text-muted-foreground text-[10px] uppercase tracking-widest">Status</th>
                                    <th className="h-14 px-6 align-middle font-black text-muted-foreground text-[10px] uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredOrders.map((order) => (
                                    <React.Fragment key={order.id}>
                                        <tr className={`transition-colors hover:bg-muted/30 group ${expandedOrder === order.id ? 'bg-muted/20' : ''}`}>
                                            <td className="p-6 align-middle">
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                                                        className="h-6 w-6 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                                                    >
                                                        {expandedOrder === order.id ? '-' : '+'}
                                                    </button>
                                                    <div>
                                                        <div className="font-mono font-bold text-primary text-xs tracking-tighter">{order.orderCode}</div>
                                                        <div className="text-[10px] text-muted-foreground mt-1 font-black uppercase tracking-widest">
                                                            {new Date(order.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6 align-middle">
                                                <div className="font-bold text-foreground">{order.customerName}</div>
                                                <div className="text-xs text-muted-foreground font-medium truncate max-w-[150px]">{order.location}</div>
                                            </td>
                                            <td className="p-6 align-middle">
                                                {editingOrder === order.id ? (
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-black text-muted-foreground w-12">FEE:</span>
                                                            <input
                                                                type="number"
                                                                value={editData.deliveryFee}
                                                                onChange={(e) => setEditData({ ...editData, deliveryFee: Number(e.target.value) })}
                                                                className="w-24 h-8 px-2 bg-background border border-border rounded-lg text-xs font-bold"
                                                            />
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-black text-muted-foreground w-12">TOTAL:</span>
                                                            <input
                                                                type="number"
                                                                value={editData.totalAmount}
                                                                onChange={(e) => setEditData({ ...editData, totalAmount: Number(e.target.value) })}
                                                                className="w-24 h-8 px-2 bg-background border border-border rounded-lg text-xs font-bold"
                                                            />
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-black text-muted-foreground w-12">TRACK:</span>
                                                            <input
                                                                type="text"
                                                                value={editData.shipmentTrackingNumber}
                                                                onChange={(e) => setEditData({ ...editData, shipmentTrackingNumber: e.target.value })}
                                                                className="w-24 h-8 px-2 bg-background border border-border rounded-lg text-xs font-bold"
                                                                placeholder="Tracking #"
                                                            />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-1">
                                                        <div className="text-xs font-medium text-muted-foreground">Fee: <span className="font-bold text-foreground">GHS {order.deliveryFee.toFixed(2)}</span></div>
                                                        <div className="text-xs font-medium text-muted-foreground">Total: <span className="font-black text-primary">GHS {order.totalAmount.toFixed(2)}</span></div>
                                                        {order.shipmentTrackingNumber && (
                                                            <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">Track: {order.shipmentTrackingNumber}</div>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-6 align-middle">
                                                <BadgeStatus status={order.orderStatus} />
                                                <div className={`text-[10px] font-black uppercase mt-1 ${order.paymentStatus === 'paid' ? 'text-green-500' : 'text-yellow-500'}`}>
                                                    {order.paymentStatus}
                                                </div>
                                            </td>
                                            <td className="p-6 align-middle text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    {editingOrder === order.id ? (
                                                        <button onClick={() => saveEdit(order.id)} className="h-9 px-4 bg-primary text-primary-foreground rounded-xl text-xs font-black shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">SAVE</button>
                                                    ) : (
                                                        <button onClick={() => startEditing(order)} className="h-9 w-9 flex items-center justify-center rounded-xl bg-muted border border-border hover:bg-muted/80 text-foreground transition-all"><Settings className="h-4 w-4" /></button>
                                                    )}
                                                    <select
                                                        className="h-9 w-40 rounded-xl border border-border bg-background px-3 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                                                        value={order.orderStatus}
                                                        onChange={(e) => handleStatusUpdate(order.id, e.target.value as any)}
                                                    >
                                                        <option value="paid">Paid</option>
                                                        <option value="supplier_ordered">Supplier Ordered</option>
                                                        <option value="in_transit">In Transit</option>
                                                        <option value="arrived">Arrived GH</option>
                                                        <option value="out_for_delivery">Out for Delivery</option>
                                                        <option value="delivered">Delivered</option>
                                                    </select>
                                                </div>
                                            </td>
                                        </tr>
                                        {expandedOrder === order.id && (
                                            <tr className="bg-muted/10">
                                                <td colSpan={5} className="p-6 border-b border-border">
                                                    <div className="grid md:grid-cols-2 gap-8 animate-in slide-in-from-top-2 duration-200">
                                                        <div>
                                                            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Ordered Items</h4>
                                                            <div className="space-y-3">
                                                                {order.items.map((item, i) => (
                                                                    <div key={i} className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl">
                                                                        <div className="h-10 w-10 bg-muted rounded-lg overflow-hidden shrink-0">
                                                                            {item.images?.[0] ? <img src={item.images[0]} className="h-full w-full object-cover" /> : <Package className="h-5 w-5 m-auto mt-2.5" />}
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-sm font-bold text-foreground truncate">{item.name}</p>
                                                                            <p className="text-xs text-muted-foreground">Qty: {item.quantity} • GHS {item.price.toFixed(2)}</p>
                                                                        </div>
                                                                        <div className="text-sm font-black text-foreground">GHS {(item.price * item.quantity).toFixed(2)}</div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Customer Info</h4>
                                                            <div className="p-4 bg-card border border-border rounded-xl space-y-4">
                                                                <div>
                                                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Contact Details</p>
                                                                    <p className="text-sm font-bold text-foreground">{order.customerEmail || 'No email provided'}</p>
                                                                    <p className="text-sm font-bold text-foreground">{order.customerPhone || 'No phone provided'}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Delivery Address</p>
                                                                    <p className="text-sm font-bold text-foreground">{order.location}</p>
                                                                </div>
                                                                <button className="h-9 px-4 bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:bg-indigo-600 transition-all flex items-center gap-2">
                                                                    <ExternalLink className="h-3 w-3" /> External Tracking
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                                {orders.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="p-12 text-center text-muted-foreground font-medium">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center">
                                                    <Clock className="h-8 w-8 text-muted-foreground/30" />
                                                </div>
                                                <p>No customer orders found in the database.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}

function BadgeStatus({ status }: { status: string }) {
    const configs: Record<string, { className: string; icon: any }> = {
        paid: { className: "bg-blue-500/10 text-blue-500 ring-blue-500/20", icon: CheckCircle },
        supplier_ordered: { className: "bg-purple-500/10 text-purple-500 ring-purple-500/20", icon: Package },
        in_transit: { className: "bg-yellow-500/10 text-yellow-500 ring-yellow-500/20", icon: Truck },
        arrived: { className: "bg-indigo-500/10 text-indigo-500 ring-indigo-500/20", icon: MapPin },
        out_for_delivery: { className: "bg-orange-500/10 text-orange-500 ring-orange-500/20", icon: Truck },
        delivered: { className: "bg-green-500/10 text-green-500 ring-green-500/20", icon: CheckCircle },
    };

    const config = configs[status] || { className: "bg-muted text-muted-foreground ring-border", icon: Clock };
    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold ring-1 ring-inset shadow-sm ${config.className}`}>
            <Icon className="h-3 w-3" />
            {status.replace(/_/g, " ").toUpperCase()}
        </span>
    );
}
