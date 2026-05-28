import { jwtVerify, SignJWT } from 'jose'

const secretKey = process.env.JWT_SECRET || 'super-secret-key-spendwise-fallback'
const key = new TextEncoder().encode(secretKey)

export async function signToken(payload: { userId: string }): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key)
}

export async function verifyToken(token: string): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    })
    return payload as { userId: string }
  } catch (error) {
    return null
  }
}
