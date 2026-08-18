import { createHmac } from "node:crypto";

/**
 * Salted one-way hashing for IPs and emails (SLV-125, 013). IP addresses are
 * NEVER stored in clear — only a salted HMAC, for abuse detection. The salt is
 * a server secret (IP_HASH_SALT); rotating it invalidates old correlations by
 * design.
 */
export function saltedHash(value: string, salt: string): string {
  return createHmac("sha256", salt).update(value.trim().toLowerCase()).digest("hex");
}

export function hashIp(ip: string, salt: string): string {
  return saltedHash(`ip:${ip}`, salt);
}

export function hashEmail(email: string, salt: string): string {
  return saltedHash(`email:${email}`, salt);
}
