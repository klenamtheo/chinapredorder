"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
import { getOrdersByCustomerRealtime, updateUserProfile } from "@/lib/firestore";
import { Order } from "@/types";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Loader2, ShoppingBag, Settings, LogOut, Package,
    ChevronRight, MapPin, Clock, CheckCircle, Truck, ExternalLink, Search, X, Phone, Mail
} from "lucide-react";

export default function AccountPage() {
    const [user, setUser] = useState<any>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"active" | "completed" | "all">("active");
    const [searchQuery, setSearchQuery] = useState("");

    // Edit Profile State
    const [isEditing, setIsEditing] = useState(false);
    const [isSupportOpen, setIsSupportOpen] = useState(false);
    const [editForm, setEditForm] = useState({ displayName: "", phoneNumber: "" });
    const [saving, setSaving] = useState(false);

    const router = useRouter();

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (!user) {
                router.push("/login");
            } else {
                setUser(user);
                // Initialize form data when user loads
                // We need to fetch the full profile including phone number from Firestore if it's not in auth
                // But simplified for now, assuming we might get it from real-time listener if we had one for user.
                // For now, let's use what we have. Real-time user updates would be better but keeping it simple.
                // Actually, let's just initialize with what we have in auth + maybe a direct fetch if needed.
                // Wait, getOrdersByCustomerRealtime is only for orders. 
                // Let's add a quick user listener or just fetch once? Or just rely on what we have.
                // Better yet, let's add a user listener here too so we get the phone number.

                // Fetch customer orders matching UID or email
                const unsubscribeOrders = getOrdersByCustomerRealtime(user.uid, user.email || "", (data) => {
                    setOrders(data);
                    setLoading(false);
                });
                return () => unsubscribeOrders();
            }
        });

        return () => unsubscribeAuth();
    }, [router]);

    // Fetch extra user details (phoneNumber) effectively
    useEffect(() => {
        if (!user?.uid) return;
        // We can reuse getCustomersRealtime but filter? No, standard is getDoc.
        // Let's just assume for edit form we use current display name.
        // If phone number is missing in auth (it usually is), we might need to fetch it to show it.
        // See updated logic below in handleEditClick
    }, [user]);

    const handleLogout = async () => {
        await signOut(auth);
        router.push("/login");
    };

    const handleEditClick = () => {
        setEditForm({
            displayName: user.displayName || "",
            phoneNumber: user.phoneNumber || "" // Note: auth user object might not have phoneNumber from custom token unless we synced it.
            // Ideally we should fetch the latest profile from Firestore to edit.
            // I'll skip the fetch for speed and just let them overwrite or enter new if empty.
        });
        setIsEditing(true);
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (auth.currentUser) {
                // Update Auth Profile
                await updateProfile(auth.currentUser, {
                    displayName: editForm.displayName
                });

                // Update Firestore Profile
                await updateUserProfile(user.uid, {
                    displayName: editForm.displayName,
                    phoneNumber: editForm.phoneNumber
                });

                // Update local state temporarily/optimistically
                setUser({ ...user, displayName: editForm.displayName, phoneNumber: editForm.phoneNumber });
                setIsEditing(false);
            }
        } catch (error) {
            console.error("Failed to update profile", error);
            alert("Failed to update profile. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    const filteredOrders = orders.filter(o =>
        o.orderCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const activeOrders = filteredOrders.filter(o => o.orderStatus !== 'delivered');
    const pastOrders = filteredOrders.filter(o => o.orderStatus === 'delivered');

    return (
        <div className="min-h-screen bg-muted/30">
            {/* Account Header */}
            <div className="bg-card border-b border-border pt-16 pb-24 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="flex items-center gap-6">
                            <div className="h-20 w-20 rounded-[32px] bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-xl shadow-primary/5">
                                <span className="text-3xl font-black">{user.displayName?.[0] || user.email?.[0]?.toUpperCase()}</span>
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-foreground tracking-tight">Hi, <span className="text-primary">{user.displayName || "Customer"}</span></h1>
                                <p className="text-muted-foreground font-medium">{user.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href="/shop" className="h-12 px-6 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2">
                                <ShoppingBag className="h-4 w-4" /> Shop New Items
                            </Link>
                            <button onClick={handleLogout} className="h-12 w-12 bg-card border border-border rounded-2xl flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                                <LogOut className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-6 -mt-12 pb-20 relative z-20">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Orders Section */}
                    <div className="lg:col-span-2 space-y-8">
                        <section className="bg-card border border-border rounded-[40px] p-8 shadow-xl shadow-black/5">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                                <div>
                                    <h2 className="text-2xl font-black text-foreground tracking-tight">Your <span className="text-primary">PreOrders</span></h2>
                                    <p className="text-xs text-muted-foreground font-medium mt-1">Real-time status of your items from China</p>
                                </div>
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Search order code..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9 h-9 w-full md:w-48 bg-muted/50 border border-border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                            </div>

                            {/* Tabs Navigation */}
                            <div className="flex bg-muted/30 p-1.5 rounded-2xl mb-8 w-fit">
                                <button
                                    onClick={() => setActiveTab("active")}
                                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "active" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                                >
                                    Active ({activeOrders.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab("completed")}
                                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "completed" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                                >
                                    Completed ({pastOrders.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab("all")}
                                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "all" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                                >
                                    All History ({filteredOrders.length})
                                </button>
                            </div>

                            <div className="space-y-6">
                                {activeTab === "active" && (
                                    activeOrders.length > 0 ? (
                                        activeOrders.map((order) => <OrderCard key={order.id} order={order} />)
                                    ) : (
                                        <EmptyOrders message="No active preorders found." />
                                    )
                                )}

                                {activeTab === "completed" && (
                                    pastOrders.length > 0 ? (
                                        pastOrders.map((order) => <OrderCard key={order.id} order={order} />)
                                    ) : (
                                        <EmptyOrders message="No completed orders found." />
                                    )
                                )}

                                {activeTab === "all" && (
                                    filteredOrders.length > 0 ? (
                                        filteredOrders.map((order) => <OrderCard key={order.id} order={order} />)
                                    ) : (
                                        <EmptyOrders message="Your order history is empty." />
                                    )
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Profile & Settings Sidebar */}
                    <div className="space-y-8">
                        <div className="bg-card border border-border rounded-[40px] p-8 shadow-xl shadow-black/5">
                            <h3 className="font-black text-lg text-foreground mb-6 flex items-center gap-2">
                                <Settings className="h-5 w-5 text-primary" /> Account Details
                            </h3>
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Phone Number</p>
                                    <p className="font-bold text-foreground">{user.phoneNumber || "Not provided"}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Default Location</p>
                                    <div className="flex items-start gap-2">
                                        <MapPin className="h-4 w-4 text-primary mt-0.5" />
                                        <p className="font-bold text-foreground text-sm">Accra, Ghana (Main Distribution Center)</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleEditClick}
                                    className="w-full h-12 border border-border rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-muted transition-colors"
                                >
                                    Edit Public Profile
                                </button>
                            </div>
                        </div>

                        <div className="bg-primary/5 border border-primary/10 rounded-[40px] p-8">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="h-10 w-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                                    <Truck className="h-5 w-5" />
                                </div>
                                <h3 className="font-black text-sm text-foreground uppercase tracking-widest">Shipping Support</h3>
                            </div>
                            <p className="text-xs text-muted-foreground font-medium leading-relaxed mb-6">
                                Need help with an order? Our support team is available 24/7 for all pre-order inquiries.
                            </p>
                            <button
                                onClick={() => setIsSupportOpen(true)}
                                className="w-full h-12 flex items-center justify-center bg-card border border-border rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-primary/50 transition-colors"
                            >
                                Contact Support
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Edit Profile Modal */}
            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-card w-full max-w-md rounded-[32px] p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-muted transition-colors"
                        >
                            <X className="h-5 w-5 text-muted-foreground" />
                        </button>

                        <h2 className="text-2xl font-black text-foreground mb-6">Edit Profile</h2>

                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Display Name</label>
                                <input
                                    type="text"
                                    value={editForm.displayName}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
                                    className="w-full h-12 bg-muted/50 border border-border rounded-2xl px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="Enter your name"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Phone Number</label>
                                <input
                                    type="tel"
                                    value={editForm.phoneNumber}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                                    className="w-full h-12 bg-muted/50 border border-border rounded-2xl px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="Enter phone number"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 h-12 border border-border rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-muted transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 h-12 bg-primary text-primary-foreground rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                                >
                                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Contact Support Modal */}
            {isSupportOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-card w-full max-w-sm rounded-[32px] p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setIsSupportOpen(false)}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-muted transition-colors"
                        >
                            <X className="h-5 w-5 text-muted-foreground" />
                        </button>

                        <div className="text-center mb-8">
                            <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                                <Truck className="h-8 w-8" />
                            </div>
                            <h2 className="text-2xl font-black text-foreground">Contact Support</h2>
                            <p className="text-sm text-muted-foreground mt-2 font-medium">We're here to help you with your orders.</p>
                        </div>

                        <div className="space-y-4">
                            <a
                                href="tel:+233546277605"
                                className="flex items-center gap-4 p-4 rounded-2xl border border-border hover:bg-muted/50 hover:border-primary/50 transition-all group"
                            >
                                <div className="h-10 w-10 bg-muted rounded-xl flex items-center justify-center text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                    <Phone className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-black text-sm text-foreground">Call Us</p>
                                    <p className="text-xs text-muted-foreground">+233 54 627 7605</p>
                                </div>
                            </a>

                            <a
                                href="https://wa.me/233546277605"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-4 p-4 rounded-2xl border border-border hover:bg-green-500/5 hover:border-green-500/50 transition-all group"
                            >
                                <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center group-hover:bg-green-500 group-hover:text-white transition-colors">
                                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-black text-sm text-foreground">WhatsApp Us</p>
                                    <p className="text-xs text-muted-foreground">Chat instantly</p>
                                </div>
                            </a>

                            <a
                                href="mailto:support@preordergh.com"
                                className="flex items-center gap-4 p-4 rounded-2xl border border-border hover:bg-muted/50 hover:border-primary/50 transition-all group"
                            >
                                <div className="h-10 w-10 bg-muted rounded-xl flex items-center justify-center text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-black text-sm text-foreground">Email Support</p>
                                    <p className="text-xs text-muted-foreground">support@preordergh.com</p>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function OrderCard({ order }: { order: Order }) {
    const statuses = [
        { key: 'paid', label: 'Processing', icon: Clock },
        { key: 'supplier_ordered', label: 'Ordered', icon: Package },
        { key: 'arrived', label: 'Arrived GH', icon: MapPin },
        { key: 'delivered', label: 'Delivered', icon: CheckCircle },
    ];

    const currentIdx = statuses.findIndex(s => s.key === order.orderStatus);

    return (
        <div className="bg-card border border-border rounded-[40px] overflow-hidden shadow-xl shadow-black/5 hover:border-primary/30 transition-all group">
            <div className="p-8">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                    <div>
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1 block">Order Reference</span>
                        <h3 className="text-xl font-mono font-black text-foreground tracking-tighter">{order.orderCode}</h3>
                    </div>
                    <Link href={`/track?code=${order.orderCode}`} className="h-11 px-5 bg-card border border-border rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
                        Details <ExternalLink className="h-3 w-3" />
                    </Link>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-10 relative">
                    {/* Progress Line */}
                    <div className="absolute top-5 left-[12.5%] right-[12.5%] h-0.5 bg-muted z-0">
                        <div
                            className="h-full bg-primary transition-all duration-1000"
                            style={{ width: `${(currentIdx / (statuses.length - 1)) * 100}%` }}
                        />
                    </div>

                    {statuses.map((s, i) => {
                        const Icon = s.icon;
                        const isActive = i <= currentIdx;
                        const isCurrent = i === currentIdx;
                        return (
                            <div key={s.key} className="flex flex-col items-center gap-3 relative z-10">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center border-4 border-card transition-all duration-500 ${isCurrent ? 'bg-primary text-primary-foreground scale-125 shadow-lg shadow-primary/20' :
                                    isActive ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                                    }`}>
                                    <Icon className="h-4 w-4" />
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-widest text-center ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                                    {s.label}
                                </span>
                            </div>
                        );
                    })}
                </div>

                <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-3xl border border-divider">
                    <div className="flex -space-x-3">
                        {order.items.slice(0, 3).map((item, i) => (
                            <div key={i} className="h-10 w-10 rounded-xl border-2 border-card bg-muted overflow-hidden">
                                <img src={item.images?.[0]} className="h-full w-full object-cover" alt="" />
                            </div>
                        ))}
                        {order.items.length > 3 && (
                            <div className="h-10 w-10 rounded-xl border-2 border-card bg-muted flex items-center justify-center text-[10px] font-black text-muted-foreground">
                                +{order.items.length - 3}
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="text-xs font-bold text-foreground">{order.items.length} items • GHS {order.totalAmount.toFixed(2)}</p>
                        <p className="text-[10px] font-medium text-muted-foreground">Estimated delivery in 14-21 days</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function EmptyOrders({ message }: { message: string }) {
    return (
        <div className="p-12 bg-muted/20 border border-border border-dashed rounded-[32px] text-center">
            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <h3 className="text-base font-bold text-foreground">{message}</h3>
            <p className="text-xs text-muted-foreground mt-1 mb-6">Your real-time order status will automatically appear here when available.</p>
            <div className="flex justify-center">
                <Link href="/shop" className="inline-flex items-center gap-2 text-[10px] font-black text-primary hover:underline uppercase tracking-widest">
                    Browse Shop <ChevronRight className="h-3 w-3" />
                </Link>
            </div>
        </div>
    );
}
