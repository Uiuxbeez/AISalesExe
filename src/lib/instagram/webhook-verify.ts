import { createHmac, timingSafeEqual } from "node:crypto";
import { instagramConfig } from "@/lib/instagram/config";

/**
 * Verifies the `X-Hub-Signature-256` header Meta sends on every webhook
 * POST, computed as HMAC-SHA256 of the *raw* request body using the app
 * secret. Must run against the raw bytes — parsing to JSON first and
 * re-stringifying will not reproduce the same signature.
 */
export function verifyInstagramWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!signatureHeader) return false;

  const [scheme, signature] = signatureHeader.split("=");
  if (scheme !== "sha256" || !signature) return false;

  const expectedSignature = createHmac("sha256", instagramConfig.appSecret).update(rawBody, "utf8").digest("hex");

  const provided = Buffer.from(signature, "hex");
  const expected = Buffer.from(expectedSignature, "hex");

  if (provided.length !== expected.length) return false;
  return timingSafeEqual(provided, expected);
}
