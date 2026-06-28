import { getRandomValues } from "node:crypto";

export function generateJoinCode(length: number = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    const arr = new Uint8Array(length);
    getRandomValues(arr);
    
    for (let i = 0; i < length; i++) {
        const idx = (arr[i] ?? 0) % chars.length;
        code += chars[idx];
    }
    return code;
}