export interface FreemiusCheckoutConfig {
  productId: string;
  planId: string;
  publicKey: string;
}

export function getFreemiusCheckoutConfig(): FreemiusCheckoutConfig | null {
  const productId = process.env.FREEMIUS_PRODUCT_ID;
  const planId = process.env.FREEMIUS_PRO_PLAN_ID;
  const publicKey = process.env.FREEMIUS_PUBLIC_KEY;
  if (!productId || !planId || !publicKey) return null;
  return { productId, planId, publicKey };
}

export function getFreemiusSecretKey(): string {
  const secretKey = process.env.FREEMIUS_SECRET_KEY;
  if (!secretKey) {
    throw new Error("FREEMIUS_SECRET_KEY is not set. Add it to .env to verify webhook signatures (see README).");
  }
  return secretKey;
}
