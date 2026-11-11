import crypto from "node:crypto"

/**
 * AES-256-GCM encrypt-then-mac for integration secrets.
 *
 * Storage format: `iv_b64:tag_b64:ciphertext_b64`
 *   - 12-byte random IV per record (GCM standard)
 *   - 16-byte auth tag
 *   - Master key from INTEGRATION_ENCRYPTION_KEY env var (32 bytes hex = 64 chars)
 *
 * If the master key is missing OR mis-shaped, all encrypt/decrypt calls
 * throw — refusing to silently downgrade is the safer default. Callers
 * (the seed script, the runtime helper) catch this and surface a clear
 * error in logs/UI.
 */

const ALGO = "aes-256-gcm"
const KEY_LEN = 32
const IV_LEN = 12
const TAG_LEN = 16

function getKey(): Buffer {
  const raw = process.env.INTEGRATION_ENCRYPTION_KEY
  if (!raw) {
    throw new Error(
      "INTEGRATION_ENCRYPTION_KEY missing from environment. " +
      "Generate one with `node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"` " +
      "and add it to /opt/geniuz/.env, then restart medusa.",
    )
  }
  const trimmed = raw.trim()
  // Accept hex (64 chars) or base64 (44 chars). Hex is what the seed
  // script writes by default.
  let key: Buffer
  if (/^[0-9a-f]{64}$/i.test(trimmed)) {
    key = Buffer.from(trimmed, "hex")
  } else {
    try {
      key = Buffer.from(trimmed, "base64")
    } catch {
      throw new Error("INTEGRATION_ENCRYPTION_KEY must be 64 hex chars or 44 base64 chars (32 bytes).")
    }
  }
  if (key.length !== KEY_LEN) {
    throw new Error(`INTEGRATION_ENCRYPTION_KEY decoded to ${key.length} bytes; expected ${KEY_LEN}.`)
  }
  return key
}

export function encrypt(plaintext: string): string {
  if (typeof plaintext !== "string") {
    throw new Error("encrypt() expects a string (stringify your object first)")
  }
  const key = getKey()
  const iv = crypto.randomBytes(IV_LEN)
  const cipher = crypto.createCipheriv(ALGO, key, iv)
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()
  return [iv.toString("base64"), tag.toString("base64"), ct.toString("base64")].join(":")
}

export function decrypt(stored: string): string {
  if (typeof stored !== "string" || !stored.includes(":")) {
    throw new Error("decrypt() received malformed payload")
  }
  const [ivB64, tagB64, ctB64] = stored.split(":")
  if (!ivB64 || !tagB64 || !ctB64) throw new Error("decrypt() payload must be iv:tag:ciphertext base64")
  const key = getKey()
  const iv = Buffer.from(ivB64, "base64")
  const tag = Buffer.from(tagB64, "base64")
  const ct = Buffer.from(ctB64, "base64")
  if (iv.length !== IV_LEN) throw new Error(`Bad IV length ${iv.length}`)
  if (tag.length !== TAG_LEN) throw new Error(`Bad tag length ${tag.length}`)
  const decipher = crypto.createDecipheriv(ALGO, key, iv)
  decipher.setAuthTag(tag)
  const pt = Buffer.concat([decipher.update(ct), decipher.final()])
  return pt.toString("utf8")
}

export function encryptJson(obj: Record<string, unknown>): string {
  return encrypt(JSON.stringify(obj))
}

export function decryptJson<T = Record<string, unknown>>(stored: string): T {
  return JSON.parse(decrypt(stored)) as T
}

/**
 * Generate a fresh 32-byte master key as hex. Used by the seed script
 * the very first time the system is bootstrapped on a server.
 */
export function generateMasterKey(): string {
  return crypto.randomBytes(KEY_LEN).toString("hex")
}

/**
 * Quick self-test the service calls at startup. Round-trips a fixed
 * string and throws if the result doesn't match — that means the
 * INTEGRATION_ENCRYPTION_KEY changed between encrypt and decrypt
 * (i.e. existing rows in DB are now unreadable).
 */
export function selfTest(): void {
  const sample = "geniuz-integration-crypto-self-test"
  const round = decrypt(encrypt(sample))
  if (round !== sample) throw new Error("Integration crypto self-test failed (key mismatch?)")
}
