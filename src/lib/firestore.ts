import {
    collection,
    onSnapshot,
    addDoc,
    doc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    where,
    getDocs,
    or
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { Product, Order, User, SupportMessage } from "@/types";
import { setDoc } from "firebase/firestore";

// --- Users Service ---
export const createUserProfile = async (uid: string, userData: Omit<User, "uid">) => {
    return await setDoc(doc(db, "users", uid), userData);
};

export const updateUserProfile = async (uid: string, data: Partial<User>) => {
    const docRef = doc(db, "users", uid);
    return await updateDoc(docRef, data);
};

export const getUserProfile = async (uid: string) => {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDocs(query(collection(db, "users"), where("uid", "==", uid)));
    // Actually setDoc uses UID as ID, so simpler:
    // This is a placeholder for better implementation.
    return docRef;
};

export const getCustomersRealtime = (callback: (users: User[]) => void) => {
    const q = query(collection(db, "users"));
    return onSnapshot(q, (snapshot) => {
        const users = snapshot.docs.map((doc) => ({
            uid: doc.id,
            ...doc.data(),
        })) as User[];
        callback(users);
    });
};

export const getProductsRealtime = (callback: (products: Product[]) => void, adminMode = false) => {
    let q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    if (!adminMode) {
        q = query(collection(db, "products"), where("isEnabled", "==", true), orderBy("createdAt", "desc"));
    }
    return onSnapshot(q, (snapshot) => {
        const products = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Product[];
        callback(products);
    });
};

export const getProductRealtime = (id: string, callback: (product: Product | null) => void) => {
    const docRef = doc(db, "products", id);
    return onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
            callback({ id: doc.id, ...doc.data() } as Product);
        } else {
            callback(null);
        }
    });
};

export const addProduct = async (productData: Omit<Product, "id">) => {
    const docRef = await addDoc(collection(db, "products"), productData);
    await logAdminActivity("create", "product", `Created product: ${productData.name}`, docRef.id);
    return docRef;
};

export const updateProduct = async (id: string, data: Partial<Product>) => {
    const docRef = doc(db, "products", id);
    await updateDoc(docRef, data);
    await logAdminActivity("update", "product", `Updated product: ${id}`, id);
};

export const deleteProduct = async (id: string, productName?: string) => {
    await logAdminActivity("delete", "product", `Deleted product: ${productName || id}`, id);
    return await deleteDoc(doc(db, "products", id));
};

// --- Activity Logs Service ---

export const logAdminActivity = async (
    action: 'create' | 'update' | 'delete' | 'login' | 'settings_update',
    entity: 'product' | 'order' | 'customer' | 'settings',
    details: string,
    entityId?: string
) => {
    try {
        const user = auth.currentUser;
        await addDoc(collection(db, "activity_logs"), {
            action,
            entity,
            entityId: entityId || null,
            details,
            performedBy: user?.email || "Unknown Admin",
            performedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error("Failed to log activity:", error);
    }
};

export const getAdminLogsRealtime = (callback: (logs: any[]) => void) => {
    const q = query(collection(db, "activity_logs"), orderBy("performedAt", "desc")); // Limit handled in UI or here? Let's fetch all for now or limit 20
    // let's actually limit to 20 for performance in dashboard
    // const q = query(collection(db, "activity_logs"), orderBy("performedAt", "desc"), limit(20)); // Need to import limit
    return onSnapshot(q, (snapshot) => {
        const logs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        callback(logs);
    });
};

// --- Orders Service ---

export const getOrdersRealtime = (callback: (orders: Order[]) => void) => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
        const orders = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Order[];
        callback(orders);
    });
};

export const getOrdersByCustomerRealtime = (customerId: string, email: string, callback: (orders: Order[]) => void) => {
    const q = query(
        collection(db, "orders"),
        or(
            where("customerId", "==", customerId),
            where("customerEmail", "==", email)
        ),
        orderBy("createdAt", "desc")
    );
    return onSnapshot(q, (snapshot) => {
        const orders = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Order[];
        callback(orders);
    });
};

export const createOrder = async (orderData: Omit<Order, "id">) => {
    return await addDoc(collection(db, "orders"), orderData);
};

export const updateOrderStatus = async (id: string, status: Order['orderStatus']) => {
    const docRef = doc(db, "orders", id);
    return await updateDoc(docRef, { orderStatus: status, updatedAt: new Date().toISOString() });
};

export const updateOrder = async (id: string, data: Partial<Order>) => {
    const docRef = doc(db, "orders", id);
    return await updateDoc(docRef, { ...data, updatedAt: new Date().toISOString() });
};

export const getOrderByCodeRealtime = (orderCode: string, callback: (order: Order | null) => void) => {
    const q = query(collection(db, "orders"), where("orderCode", "==", orderCode));
    return onSnapshot(q, (snapshot) => {
        if (snapshot.empty) {
            callback(null);
        } else {
            const orderDoc = snapshot.docs[0];
            callback({
                id: orderDoc.id,
                ...orderDoc.data(),
            } as Order);
        }
    });
};

// --- Support Service ---

export const addSupportMessage = async (data: Omit<SupportMessage, "id" | "status" | "createdAt">) => {
    return await addDoc(collection(db, "support_messages"), {
        ...data,
        status: 'new',
        createdAt: new Date().toISOString()
    });
};

export const getSupportMessagesRealtime = (callback: (messages: SupportMessage[]) => void) => {
    const q = query(collection(db, "support_messages"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as SupportMessage[];
        callback(messages);
    });
};
