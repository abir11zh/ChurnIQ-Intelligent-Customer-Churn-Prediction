import type { Permission, Role } from "../types/domain";

export const rolePermissions: Record<Role, Permission[]> = {
  Owner: [
    "dashboard:read",
    "organization:read",
    "organization:write",
    "customers:read",
    "customers:write",
    "segments:read",
    "predictions:read",
    "predictions:write",
    "analytics:read",
    "models:read",
    "mlops:read",
    "mlops:write",
    "shap:read",
    "ai:read",
    "retention:read",
    "campaigns:read",
    "campaigns:write",
    "reports:read",
    "reports:write",
    "notifications:read",
    "team:read",
    "team:write",
    "activity:read",
    "audit:read",
    "integrations:read",
    "integrations:write",
    "security:read",
    "system:read",
    "api_keys:read",
    "api_keys:write",
    "settings:read",
    "settings:write",
    "support:read",
    "billing:read"
  ],
  Admin: [
    "dashboard:read",
    "organization:read",
    "organization:write",
    "customers:read",
    "customers:write",
    "segments:read",
    "predictions:read",
    "predictions:write",
    "analytics:read",
    "models:read",
    "mlops:read",
    "mlops:write",
    "shap:read",
    "ai:read",
    "retention:read",
    "campaigns:read",
    "campaigns:write",
    "reports:read",
    "reports:write",
    "notifications:read",
    "team:read",
    "team:write",
    "activity:read",
    "audit:read",
    "integrations:read",
    "integrations:write",
    "security:read",
    "system:read",
    "api_keys:read",
    "api_keys:write",
    "settings:read",
    "settings:write",
    "support:read",
    "billing:read"
  ],
  Manager: [
    "dashboard:read",
    "organization:read",
    "customers:read",
    "customers:write",
    "segments:read",
    "retention:read",
    "campaigns:read",
    "campaigns:write",
    "reports:read",
    "reports:write",
    "notifications:read",
    "team:read",
    "activity:read",
    "mlops:read",
    "integrations:read",
    "settings:read",
    "support:read"
  ],
  Analyst: [
    "dashboard:read",
    "organization:read",
    "customers:read",
    "segments:read",
    "predictions:read",
    "predictions:write",
    "analytics:read",
    "models:read",
    "mlops:read",
    "shap:read",
    "reports:read",
    "notifications:read",
    "activity:read",
    "support:read"
  ],
  Viewer: ["dashboard:read", "organization:read", "reports:read", "notifications:read", "support:read"]
};

export function getRolePermissions(role: Role) {
  return rolePermissions[role];
}

export function hasPermission(role: Role, permission: Permission) {
  return rolePermissions[role].includes(permission);
}

export function hasAnyPermission(role: Role, permissions: Permission[]) {
  return permissions.some((permission) => hasPermission(role, permission));
}
