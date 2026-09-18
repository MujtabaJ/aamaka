export const PERMISSIONS = [
  { key: "dashboard.read", groupName: "Dashboard", description: "View dashboard" },
  { key: "music.manage", groupName: "Music", description: "Manage songs, albums, artists, genres" },
  { key: "products.manage", groupName: "Shop", description: "Manage products and categories" },
  { key: "orders.manage", groupName: "Orders", description: "Manage orders, shipping and refunds" },
  { key: "customers.manage", groupName: "Customers", description: "View and manage customers" },
  { key: "memberships.manage", groupName: "Memberships", description: "Manage plans and subscriptions" },
  { key: "content.manage", groupName: "Content", description: "Manage pages, articles, homepage, FAQs" },
  { key: "reviews.manage", groupName: "Reviews", description: "Moderate reviews" },
  { key: "coupons.manage", groupName: "Coupons", description: "Manage coupons" },
  { key: "notifications.manage", groupName: "Notifications", description: "View platform notifications" },
  { key: "media.manage", groupName: "Media", description: "Upload and manage media" },
  { key: "analytics.read", groupName: "Analytics", description: "View analytics" },
  { key: "users.manage", groupName: "Users", description: "Manage users and roles" },
  { key: "settings.manage", groupName: "Settings", description: "Manage site settings and payments" },
] as const;

export type PermissionKey = (typeof PERMISSIONS)[number]["key"];

export const ROLE_PRESETS: Record<string, PermissionKey[]> = {
  SUPER_ADMIN: PERMISSIONS.map((p) => p.key),
  ADMIN: [
    "dashboard.read",
    "music.manage",
    "products.manage",
    "orders.manage",
    "customers.manage",
    "memberships.manage",
    "content.manage",
    "reviews.manage",
    "coupons.manage",
    "notifications.manage",
    "media.manage",
    "analytics.read",
  ],
  CONTENT_MANAGER: [
    "dashboard.read",
    "music.manage",
    "content.manage",
    "media.manage",
    "notifications.manage",
  ],
  ORDER_MANAGER: [
    "dashboard.read",
    "orders.manage",
    "customers.manage",
    "notifications.manage",
  ],
  EDITOR: ["dashboard.read", "content.manage", "music.manage", "media.manage"],
  CUSTOMER: [],
};

export const STAFF_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "CONTENT_MANAGER",
  "ORDER_MANAGER",
  "EDITOR",
] as const;

export function isStaffRole(name?: string | null) {
  return !!name && STAFF_ROLES.includes(name as (typeof STAFF_ROLES)[number]);
}
