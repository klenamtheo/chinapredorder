export function timestampToDate(timestamp: any): Date | null {
    if (!timestamp) return null;
    if (timestamp instanceof Date) return timestamp;
    if (typeof timestamp === "string") return new Date(timestamp);
    if (timestamp.toDate && typeof timestamp.toDate === "function") return timestamp.toDate();
    return null;
}
