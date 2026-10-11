import { describe, it, expect } from "vitest"
import {
  UserRole,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  getRequiredPermissions,
  getRequiredRole,
} from "@/lib/auth/permissions"

describe("role permissions", () => {
  it("grants an admin every declared permission", () => {
    const allPermissions = Object.keys(PERMISSIONS)

    expect(ROLE_PERMISSIONS[UserRole.ADMIN]).toEqual(allPermissions)

    for (const permission of allPermissions) {
      expect(hasPermission(UserRole.ADMIN, permission as never)).toBe(true)
    }
  })

  it("gives a base USER account no permissions at all", () => {
    expect(ROLE_PERMISSIONS[UserRole.USER]).toEqual([])
    expect(hasPermission(UserRole.USER, "merchant.offers.read")).toBe(false)
  })

  it("lets a merchant admin manage their own resources but not the platform", () => {
    expect(hasPermission(UserRole.MERCHANT_ADMIN, "merchant.offers.write")).toBe(true)
    expect(hasPermission(UserRole.MERCHANT_ADMIN, "merchant.analytics.read")).toBe(true)
    expect(hasPermission(UserRole.MERCHANT_ADMIN, "admin.users.write")).toBe(false)
    expect(hasPermission(UserRole.MERCHANT_ADMIN, "staff.redemptions.write")).toBe(false)
  })

  it("scopes staff to redemptions and blocks merchant-wide writes", () => {
    expect(hasPermission(UserRole.MERCHANT_STAFF, "staff.redemptions.write")).toBe(true)
    expect(hasPermission(UserRole.MERCHANT_STAFF, "staff.offers.read")).toBe(true)
    expect(hasPermission(UserRole.MERCHANT_STAFF, "merchant.offers.write")).toBe(false)
    expect(hasPermission(UserRole.MERCHANT_STAFF, "merchant.profile.write")).toBe(false)
  })

  it("returns false for an unknown role instead of throwing", () => {
    expect(hasPermission("GHOST_ROLE" as UserRole, "merchant.offers.read")).toBe(false)
  })
})

describe("hasAllPermissions", () => {
  it("requires every permission to be present", () => {
    expect(
      hasAllPermissions(UserRole.MERCHANT_ADMIN, [
        "merchant.offers.read",
        "merchant.offers.write",
      ]),
    ).toBe(true)

    // Holds merchant.offers.write but not the admin permission.
    expect(
      hasAllPermissions(UserRole.MERCHANT_ADMIN, [
        "merchant.offers.write",
        "admin.users.write",
      ]),
    ).toBe(false)
  })

  it("treats an empty permission list as satisfied", () => {
    expect(hasAllPermissions(UserRole.USER, [])).toBe(true)
  })
})

describe("hasAnyPermission", () => {
  it("passes when at least one permission matches", () => {
    expect(
      hasAnyPermission(UserRole.MERCHANT_STAFF, [
        "admin.users.write",
        "staff.redemptions.read",
      ]),
    ).toBe(true)
  })

  it("fails when nothing matches", () => {
    expect(
      hasAnyPermission(UserRole.MERCHANT_STAFF, [
        "admin.users.write",
        "merchant.profile.write",
      ]),
    ).toBe(false)
  })

  it("treats an empty permission list as denied", () => {
    expect(hasAnyPermission(UserRole.ADMIN, [])).toBe(false)
  })
})

describe("getRequiredPermissions", () => {
  it("collects only admin permissions for admin routes", () => {
    const required = getRequiredPermissions("/admin/users")

    expect(required).not.toBeNull()
    expect(required!.length).toBeGreaterThan(0)
    expect(required!.every((permission) => permission.startsWith("admin."))).toBe(true)
  })

  it("collects only merchant permissions for merchant routes", () => {
    const required = getRequiredPermissions("/merchant/offers")

    expect(required).not.toBeNull()
    expect(required!.every((permission) => permission.startsWith("merchant."))).toBe(true)
  })

  it("returns null for public routes", () => {
    expect(getRequiredPermissions("/")).toBeNull()
    expect(getRequiredPermissions("/about")).toBeNull()
  })
})

describe("getRequiredRole", () => {
  it("requires ADMIN for admin routes", () => {
    expect(getRequiredRole("/admin/dashboard")).toBe(UserRole.ADMIN)
  })

  it("requires a merchant role for protected merchant routes", () => {
    expect(getRequiredRole("/merchant/dashboard")).toBe(UserRole.MERCHANT_ADMIN)
  })

  it("leaves the merchant auth screens public", () => {
    expect(getRequiredRole("/merchant/auth/login")).toBeNull()
    expect(getRequiredRole("/merchant/auth/register")).toBeNull()
  })
})
