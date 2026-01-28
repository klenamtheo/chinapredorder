export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: 'GHS';
    images: string[];
    status: 'active' | 'inactive';
    category?: string;
    stock?: number;
    isEnabled: boolean;
    createdAt: string; // ISO String
}

export interface CartItem extends Product {
    quantity: number;
}

export interface Order {
    id: string;
    orderCode: string; // ORD-GH-2026-XXXXX
    customerName: string;
    customerPhone: string;
    location: string;
    customerEmail?: string;
    items: CartItem[];
    totalAmount: number;
    deliveryFee: number;
    paymentStatus: 'pending' | 'paid' | 'failed';
    paymentReference?: string;
    shipmentTrackingNumber?: string;
    orderStatus: 'paid' | 'supplier_ordered' | 'in_transit' | 'arrived' | 'out_for_delivery' | 'delivered';
    createdAt: string;
    updatedAt: string;
    customerId?: string; // Link to customer account
}

export interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
    role: 'customer' | 'admin' | 'super_admin';
    phoneNumber?: string;
}

export interface AdminLog {
    id: string;
    action: 'create' | 'update' | 'delete' | 'login' | 'settings_update';
    entity: 'product' | 'order' | 'customer' | 'settings';
    entityId?: string;
    details: string;
    performedBy: string; // email or name
    performedAt: string; // ISO string
}

export interface SupportMessage {
    id: string;
    name: string;
    email: string;
    message: string;
    status: 'new' | 'read' | 'replied';
    createdAt: string;
}
