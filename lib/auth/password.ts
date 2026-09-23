import bcrypt from "bcryptjs";

const BCRYPT_COST_FACTOR = 12;

/** Hash a password with bcrypt before it is persisted. */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST_FACTOR);
}

/** Compare a candidate password with its stored bcrypt hash. */
export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, storedHash);
  } catch {
    // Malformed legacy data must not make an authentication request fail.
    return false;
  }
}
