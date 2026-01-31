"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon, Check } from "lucide-react";
import { uploadToImgBB } from "@/lib/uploadToImgBB";

interface ImageUploadProps {
    label: string;
    value: string;
    onChange: (url: string) => void;
    onError?: (error: string) => void;
}

export function ImageUpload({ label, value, onChange, onError }: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(value);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (file: File) => {
        if (!file) return;

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreviewUrl(e.target?.result as string);
        };
        reader.readAsDataURL(file);

        // Upload to ImgBB
        setIsUploading(true);
        try {
            const url = await uploadToImgBB(file);
            onChange(url);
            setPreviewUrl(url);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to upload image";
            if (onError) {
                onError(errorMessage);
            }
            setPreviewUrl("");
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith("image/")) {
            handleFileSelect(file);
        } else if (onError) {
            onError("Please drop an image file");
        }
    };

    const handleRemove = () => {
        setPreviewUrl("");
        onChange("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-foreground uppercase tracking-widest pl-1">
                {label}
            </label>

            <div
                onClick={!isUploading && !previewUrl ? handleClick : undefined}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                    relative h-32 w-full rounded-2xl border-2 border-dashed transition-all
                    ${isDragging
                        ? "border-primary bg-primary/5"
                        : previewUrl
                            ? "border-border bg-muted/30"
                            : "border-border bg-background hover:border-primary/50 hover:bg-muted/20 cursor-pointer"
                    }
                    ${isUploading ? "pointer-events-none" : ""}
                `}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                />

                {isUploading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-xs font-bold text-muted-foreground">Uploading...</p>
                    </div>
                ) : previewUrl ? (
                    <div className="absolute inset-0 group">
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center gap-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleClick();
                                }}
                                className="h-9 w-9 flex items-center justify-center bg-white/90 hover:bg-white text-foreground rounded-lg transition-colors"
                                title="Replace image"
                            >
                                <Upload className="h-4 w-4" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemove();
                                }}
                                className="h-9 w-9 flex items-center justify-center bg-red-500/90 hover:bg-red-500 text-white rounded-lg transition-colors"
                                title="Remove image"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                            <Check className="h-3 w-3" />
                        </div>
                    </div>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        <ImageIcon className="h-8 w-8" />
                        <p className="text-xs font-bold">Click or drag image here</p>
                        <p className="text-[10px] font-medium">JPEG, PNG, GIF, WebP (max 32MB)</p>
                    </div>
                )}
            </div>
        </div>
    );
}
