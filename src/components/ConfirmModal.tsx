"use client";

import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: "danger" | "warning" | "info";
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "warning",
}: ConfirmModalProps) {
    if (!isOpen) return null;

    const accentColors = {
        danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-destructive/20",
        warning: "bg-yellow-500 text-white hover:bg-yellow-600 shadow-yellow-500/20",
        info: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20",
    };

    const iconColors = {
        danger: "bg-destructive/10 text-destructive",
        warning: "bg-yellow-500/10 text-yellow-600",
        info: "bg-primary/10 text-primary",
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-md rounded-[40px] p-8 shadow-2xl border border-border animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-start mb-6">
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${iconColors[type]}`}>
                        <AlertTriangle className="h-6 w-6" />
                    </div>
                    <button
                        onClick={onClose}
                        className="h-10 w-10 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors text-muted-foreground"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <h3 className="text-2xl font-black text-foreground tracking-tighter mb-2">{title}</h3>
                <p className="text-muted-foreground font-medium text-sm leading-relaxed mb-8">{message}</p>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 h-12 border border-border rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-muted transition-colors text-foreground"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`flex-1 h-12 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95 ${accentColors[type]}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
