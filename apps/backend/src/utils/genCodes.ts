import { JOIN_CODE_LENGTH } from "@board-bot-arena/shared";
import { getRandomValues } from "node:crypto";

export function generateJoinCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    const arr = new Uint8Array(JOIN_CODE_LENGTH);
    getRandomValues(arr);
    
    for (let i = 0; i < JOIN_CODE_LENGTH; i++) {
        const idx = (arr[i] ?? 0) % chars.length;
        code += chars[idx];
    }
    return code;
}