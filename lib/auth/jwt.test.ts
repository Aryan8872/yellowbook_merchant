import { describe, it, expect, vi } from "vitest"
import {
  decodeJWT,
  getUserRole,
  getUserId,
  isTokenExpired,
  validateToken,
  type JWTPayload,
} from "@/lib/auth/jwt"

/** Builds a real, unsigned three-segment JWT carrying the given claims. */
function makeToken(payload: JWTPayload, signature = "sig"): string {
  const encode = (value: object) =>
    Buffer.from(JSON.stringify(value)).toString("base64url")

  return `${encode({ alg: "none", typ: "JWT" })}.${encode(payload)}.${signature}`
}

describe("decodeJWT", () => {
  it("reads claims out of the payload segment", () => {
    const token = makeToken({
      sub: "user-42",
      email: "merchant@example.com",
      role: "MERCHANT_ADMIN",
      merchantId: "merchant-7",
    })

    expect(decodeJWT(token)).toMatchObject({
      sub: "user-42",
      email: "merchant@example.com",
      role: "MERCHANT_ADMIN",
      merchantId: "merchant-7",
    })
  })

  it("returns null when the segment count is wrong", () => {
    expect(decodeJWT("only.two")).toBeNull()
    expect(decodeJWT("a.b.c.d")).toBeNull()
  })

  it("returns null rather than throwing on malformed payloads", () => {
    vi.spyOn(console, "error").mockImplementation(() => {})

    // "!!!" is not decodable JSON.
    expect(decodeJWT("header.!!!.sig")).toBeNull()
  })

  it("round-trips claims containing non-ASCII characters", () => {
    const token = makeToken({
      sub: "user-1",
      email: "सञ्चालक@example.com",
      role: "ADMIN",
    })

    expect(decodeJWT(token)?.email).toBe("सञ्चालक@example.com")
  })
})

describe("getUserRole / getUserId", () => {
  it("extracts role and subject", () => {
    const token = makeToken({ sub: "user-9", email: "a@b.c", role: "MERCHANT_STAFF" })

    expect(getUserRole(token)).toBe("MERCHANT_STAFF")
    expect(getUserId(token)).toBe("user-9")
  })

  it("returns null for an undecodable token", () => {
    vi.spyOn(console, "error").mockImplementation(() => {})

    expect(getUserRole("garbage")).toBeNull()
    expect(getUserId("garbage")).toBeNull()
  })
})

describe("isTokenExpired", () => {
  it("treats a token with a past exp claim as expired", () => {
    const token = makeToken({
      sub: "user-1",
      email: "a@b.c",
      role: "USER",
      exp: Math.floor(Date.now() / 1000) - 60,
    })

    expect(isTokenExpired(token)).toBe(true)
  })

  it("treats a future exp claim as live", () => {
    const token = makeToken({
      sub: "user-1",
      email: "a@b.c",
      role: "USER",
      exp: Math.floor(Date.now() / 1000) + 3600,
    })

    expect(isTokenExpired(token)).toBe(false)
  })

  it("fails closed when the exp claim is absent", () => {
    const token = makeToken({ sub: "user-1", email: "a@b.c", role: "USER" })

    expect(isTokenExpired(token)).toBe(true)
  })

  it("fails closed on an undecodable token", () => {
    vi.spyOn(console, "error").mockImplementation(() => {})

    expect(isTokenExpired("nope")).toBe(true)
  })
})

describe("validateToken", () => {
  const futureExp = () => Math.floor(Date.now() / 1000) + 3600

  it("accepts a well-formed, unexpired token", () => {
    const token = makeToken({
      sub: "user-1",
      email: "a@b.c",
      role: "ADMIN",
      exp: futureExp(),
    })

    expect(validateToken(token)).toEqual({ valid: true })
  })

  it("rejects an empty token", () => {
    expect(validateToken("")).toEqual({
      valid: false,
      error: "No token provided",
    })
  })

  it("rejects a malformed token", () => {
    vi.spyOn(console, "error").mockImplementation(() => {})

    expect(validateToken("broken")).toEqual({
      valid: false,
      error: "Invalid token format",
    })
  })

  it("rejects a token with no subject claim", () => {
    const token = makeToken({
      email: "a@b.c",
      role: "ADMIN",
      exp: futureExp(),
    } as JWTPayload)

    expect(validateToken(token)).toEqual({
      valid: false,
      error: "Token missing subject claim",
    })
  })

  it("rejects a token with no role claim", () => {
    const token = makeToken({
      sub: "user-1",
      email: "a@b.c",
      exp: futureExp(),
    } as JWTPayload)

    expect(validateToken(token)).toEqual({
      valid: false,
      error: "Token missing role claim",
    })
  })

  it("rejects an expired token", () => {
    const token = makeToken({
      sub: "user-1",
      email: "a@b.c",
      role: "ADMIN",
      exp: Math.floor(Date.now() / 1000) - 1,
    })

    expect(validateToken(token)).toEqual({
      valid: false,
      error: "Token expired",
    })
  })
})
