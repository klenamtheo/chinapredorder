"use client";

import Image from "next/image";

import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Loader2, Package, Eye, EyeOff } from "lucide-react";
import { Product } from "@/types";
import { getProductsRealtime, addProduct, updateProduct, deleteProduct } from "@/lib/firestore";
import { MOCK_PRODUCTS } from "@/lib/mockData";
import { useToast } from "@/context/ToastContext";
import { ConfirmModal } from "@/components/ConfirmModal";
import { ImageUpload } from "@/components/ImageUpload";

export const dynamic = "force-dynamic";

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();
    const [isRealtime, setIsRealtime] = useState(false);

    // Modal & Form State
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        category: "Bags",
        image1: "",
        image2: "",
        image3: "",
        description: "",
        isEnabled: true
    });

    // Real-time listener
    useEffect(() => {
        try {
            const unsubscribe = getProductsRealtime((data) => {
                setProducts(data);
                setIsRealtime(true);
                setLoading(false);
            }, true); // Admin mode
            return () => unsubscribe();
        } catch (err) {
            console.warn("Firestore connection failed. Using mock data.", err);
            setProducts(MOCK_PRODUCTS);
            setLoading(false);
        }
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as any;
        const val = type === 'checkbox' ? (e.target as any).checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const handleAddProduct = async () => {
        // Validation
        if (!formData.name.trim()) {
            showToast("Product name is required", "error");
            return;
        }

        const priceNum = parseFloat(formData.price);
        if (isNaN(priceNum) || priceNum <= 0) {
            showToast("Please enter a valid price greater than 0", "error");
            return;
        }

        const images = [formData.image1, formData.image2, formData.image3].filter(img => img.trim() !== "");
        if (images.length === 0) {
            showToast("At least one image URL is required", "error");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                name: formData.name.trim(),
                price: priceNum,
                currency: "GHS" as const,
                description: formData.description.trim(),
                category: formData.category,
                images: images,
                status: "active" as const,
                isEnabled: formData.isEnabled,
                createdAt: new Date().toISOString()
            };

            if (editingProduct) {
                await updateProduct(editingProduct.id, payload);
            } else {
                await addProduct(payload);
            }

            setShowAddModal(false);
            setEditingProduct(null);
            showToast(editingProduct ? "Product updated successfully!" : "Product created successfully!");
            // Reset form
            setFormData({ name: "", price: "", category: "Bags", image1: "", image2: "", image3: "", description: "", isEnabled: true });
        } catch (error) {
            console.error("Failed to save product:", error);
            showToast("Failed to save product.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleStatus = async (product: Product) => {
        try {
            await updateProduct(product.id, { isEnabled: !product.isEnabled });
        } catch (err) {
            console.error("Failed to toggle status", err);
        }
    };

    const startEdit = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            price: product.price.toString(),
            category: product.category || "Bags",
            image1: product.images?.[0] || "",
            image2: product.images?.[1] || "",
            image3: product.images?.[2] || "",
            description: product.description || "",
            isEnabled: product.isEnabled
        });
        setShowAddModal(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteProduct(id);
            showToast("Product deleted successfully!");
        } catch (err) {
            console.error("Failed to delete", err);
            showToast("Failed to delete product.", "error");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <header className="h-20 border-b border-border bg-card flex items-center px-8 justify-between sticky top-0 z-10">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Products <span className="text-primary">Management</span></h1>
                    <p className="text-xs text-muted-foreground font-medium">Manage your inventory and product listings</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95"
                >
                    <Plus className="h-5 w-5" /> Add Product
                </button>
            </header>

            <main className="p-8 flex-1 bg-muted/30">
                {!isRealtime && (
                    <div className="bg-primary/10 border border-primary/20 text-primary p-4 rounded-xl mb-8 text-sm font-bold flex items-center gap-2">
                        <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                        Demo Mode: Showing mock data because Firestore is not connected.
                    </div>
                )}

                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl shadow-black/5">
                    <div className="p-6 border-b border-border bg-muted/50 flex gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <input
                                placeholder="Search products..."
                                className="pl-10 flex h-11 w-full rounded-xl border border-border bg-background px-3 py-1 text-sm transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary"
                            />
                        </div>
                    </div>

                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm text-left">
                            <thead className="bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="h-14 px-6 align-middle font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Image</th>
                                    <th className="h-14 px-6 align-middle font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Name</th>
                                    <th className="h-14 px-6 align-middle font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Category</th>
                                    <th className="h-14 px-6 align-middle font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Price</th>
                                    <th className="h-14 px-6 align-middle font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Status</th>
                                    <th className="h-14 px-6 align-middle font-bold text-muted-foreground uppercase tracking-wider text-[10px] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {products.map((product) => (
                                    <tr key={product.id} className="transition-colors hover:bg-muted/30 group">
                                        <td className="p-6 align-middle">
                                            <div className="h-12 w-12 bg-muted rounded-xl flex items-center justify-center overflow-hidden border border-border group-hover:border-primary/50 transition-colors">
                                                {product.images?.[0] ? (
                                                    <Image
                                                        src={product.images[0]}
                                                        alt={product.name}
                                                        width={48}
                                                        height={48}
                                                        className="h-full w-full object-cover transition-transform group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <Package className="h-6 w-6 text-muted-foreground" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-6 align-middle">
                                            <div className="font-bold text-foreground group-hover:text-primary transition-colors">{product.name}</div>
                                            {!product.isEnabled && <span className="text-[10px] font-black text-destructive uppercase tracking-widest mt-1">Hidden from Shop</span>}
                                        </td>
                                        <td className="p-6 align-middle">
                                            <span className="px-2.5 py-1 rounded-lg bg-muted text-foreground/70 text-xs font-bold border border-border">
                                                {product.category || "Uncategorized"}
                                            </span>
                                        </td>
                                        <td className="p-6 align-middle font-bold text-foreground">{product.currency} {product.price.toFixed(2)}</td>
                                        <td className="p-6 align-middle">
                                            <button
                                                onClick={() => handleToggleStatus(product)}
                                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ring-1 ring-inset transition-all ${product.isEnabled
                                                    ? 'bg-green-500/10 text-green-500 ring-green-500/20 hover:bg-green-500/20'
                                                    : 'bg-destructive/10 text-destructive ring-destructive/20 hover:bg-destructive/20'
                                                    }`}>
                                                {product.isEnabled ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                                                {product.isEnabled ? 'Enabled' : 'Disabled'}
                                            </button>
                                        </td>
                                        <td className="p-6 align-middle text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => startEdit(product)} className="h-9 w-9 flex items-center justify-center bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded-lg transition-all">
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => setConfirmDelete({ isOpen: true, id: product.id })} className="h-9 w-9 flex items-center justify-center bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-all">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {products.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="p-12 text-center text-muted-foreground font-medium italic">
                                            No products found in the database.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {showAddModal && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-card w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[40px] p-10 shadow-2xl border border-border animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h2 className="text-3xl font-black text-foreground tracking-tighter">
                                    {editingProduct ? "Edit" : "Add New"} <span className="text-primary">Product</span>
                                </h2>
                                <p className="text-xs text-muted-foreground font-medium mt-1">Fill in the details below to update your inventory.</p>
                            </div>
                            <button onClick={() => { setShowAddModal(false); setEditingProduct(null); }} className="h-10 w-10 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors text-muted-foreground">✕</button>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-foreground uppercase tracking-widest pl-1">Product Name</label>
                                <input name="name" value={formData.name} onChange={handleInputChange} className="flex h-12 w-full rounded-2xl border border-border bg-background px-4 py-2 text-sm font-bold transition-all focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary" placeholder="e.g. Vintage Leather Bag" />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-foreground uppercase tracking-widest pl-1">Price (GHS)</label>
                                    <input name="price" type="number" value={formData.price} onChange={handleInputChange} className="flex h-12 w-full rounded-2xl border border-border bg-background px-4 py-2 text-sm font-bold transition-all focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary" placeholder="0.00" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-foreground uppercase tracking-widest pl-1">Category</label>
                                    <select name="category" value={formData.category} onChange={handleInputChange} className="flex h-12 w-full rounded-2xl border border-border bg-background px-4 py-2 text-sm font-bold transition-all focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary cursor-pointer">
                                        <option value="Bags">Bags</option>
                                        <option value="Shoes">Shoes</option>
                                        <option value="Clothing">Clothing</option>
                                        <option value="Devices">Devices</option>
                                        <option value="Accessories">Accessories</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <ImageUpload
                                    label="Image 1 (Main)"
                                    value={formData.image1}
                                    onChange={(url) => setFormData(prev => ({ ...prev, image1: url }))}
                                    onError={(error) => showToast(error, "error")}
                                />
                                <ImageUpload
                                    label="Image 2"
                                    value={formData.image2}
                                    onChange={(url) => setFormData(prev => ({ ...prev, image2: url }))}
                                    onError={(error) => showToast(error, "error")}
                                />
                                <ImageUpload
                                    label="Image 3"
                                    value={formData.image3}
                                    onChange={(url) => setFormData(prev => ({ ...prev, image3: url }))}
                                    onError={(error) => showToast(error, "error")}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-foreground uppercase tracking-widest pl-1">Description</label>
                                <textarea name="description" value={formData.description} onChange={handleInputChange} className="flex min-h-[100px] w-full rounded-2xl border border-border bg-background px-4 py-2 text-sm font-bold transition-all focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary" placeholder="Enter detailed product description..." />
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-2xl border border-border">
                                <input id="isEnabled" name="isEnabled" type="checkbox" checked={formData.isEnabled} onChange={handleInputChange} className="h-5 w-5 rounded-lg border-border text-primary focus:ring-primary/20 cursor-pointer" />
                                <label htmlFor="isEnabled" className="text-sm font-bold text-foreground cursor-pointer">Initially Enabled (Visible in Shop)</label>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-10">
                            <button onClick={() => { setShowAddModal(false); setEditingProduct(null); }} className="px-8 py-3 border border-border rounded-2xl hover:bg-muted font-black text-xs uppercase tracking-widest transition-colors text-foreground">Cancel</button>
                            <button onClick={handleAddProduct} disabled={isSubmitting} className="px-8 py-3 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50">
                                {isSubmitting ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Saving...</span> : (editingProduct ? "Update Product" : "Create Product")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={confirmDelete.isOpen}
                onClose={() => setConfirmDelete({ isOpen: false, id: null })}
                onConfirm={() => confirmDelete.id && handleDelete(confirmDelete.id)}
                title="Delete Product?"
                message="Are you sure you want to remove this product? This action cannot be undone."
                confirmText="Delete"
                type="danger"
            />
        </div>
    );
}
