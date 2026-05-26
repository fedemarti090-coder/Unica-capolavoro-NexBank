import crypto from 'crypto';
import 'dotenv/config';

export function hash_from_str(str) {
    return crypto.createHash('sha256').update(str).digest('hex');
}

export const generateToken = (length = 12) => {
  return Math.random().toString(36).substring(2, 2 + length);
};

const algorithm = "aes-256-gcm";
const key = Buffer.from(process.env.AES_KEY, "hex");



export function encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    const tag = cipher.getAuthTag();

    return {
        content: encrypted,
        iv: iv.toString("hex"),
        tag: tag.toString("hex")
    };
}

export function decrypt(encryptedData) {
    const decipher = crypto.createDecipheriv(
        algorithm,
        key,
        Buffer.from(encryptedData.iv, "hex")
    );

    decipher.setAuthTag(Buffer.from(encryptedData.tag, "hex"));

    let decrypted = decipher.update(encryptedData.content, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
}
