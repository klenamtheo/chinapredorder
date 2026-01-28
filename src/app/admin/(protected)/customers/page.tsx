"use client";

import { useEffect, useState } from "react";
import { getCustomersRealtime } from "@/lib/firestore";
import { User } from "@/types";
import { Loader2, Search, User as UserIcon, Shield, Mail, Phone, Calendar } from "lucide-react";

export default function CustomersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const unsubscribe = getCustomersRealtime((fetchedUsers) => {
            setUsers(fetchedUsers);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.role.toLowerCase().includes(searchTerm.toLowerCase());

        const isNotAdmin = user.role !== 'admin' && user.role !== 'super_admin';

        return matchesSearch && isNotAdmin;
    });

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                        Customer <span className="text-primary">Management</span>
                    </h1>
                    <p className="text-sm text-muted-foreground font-medium mt-1">
                        View and manage your platform's users.
                    </p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search customers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-4 h-10 w-full md:w-64 rounded-xl border border-border bg-card text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : filteredUsers.length === 0 ? (
                <div className="text-center py-20 bg-card rounded-2xl border border-border border-dashed">
                    <div className="mx-auto h-16 w-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                        <UserIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">No customers found</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        {searchTerm ? "Try adjusting your search terms." : "Using the platform will populate this list."}
                    </p>
                </div>
            ) : (
                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="h-12 px-6 font-bold text-muted-foreground uppercase tracking-wider text-[11px]">User</th>
                                    <th className="h-12 px-6 font-bold text-muted-foreground uppercase tracking-wider text-[11px]">Role</th>
                                    <th className="h-12 px-6 font-bold text-muted-foreground uppercase tracking-wider text-[11px]">Email</th>
                                    <th className="h-12 px-6 font-bold text-muted-foreground uppercase tracking-wider text-[11px]">Phone</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredUsers.map((user) => (
                                    <tr key={user.uid} className="hover:bg-muted/30 transition-colors">
                                        <td className="p-6">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold uppercase">
                                                    {user.displayName?.charAt(0) || user.email?.charAt(0) || "?"}
                                                </div>
                                                <span className="font-bold text-foreground">{user.displayName || "N/A"}</span>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user.role === 'admin' || user.role === 'super_admin'
                                                ? 'bg-purple-500/10 text-purple-600'
                                                : 'bg-green-500/10 text-green-600'
                                                }`}>
                                                {user.role === 'admin' || user.role === 'super_admin' ? <Shield className="h-3 w-3" /> : <UserIcon className="h-3 w-3" />}
                                                {user.role}
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-2 text-muted-foreground font-medium">
                                                <Mail className="h-4 w-4" />
                                                {user.email || "No Email"}
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-2 text-muted-foreground font-medium">
                                                <Phone className="h-4 w-4" />
                                                {user.phoneNumber || "N/A"}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
