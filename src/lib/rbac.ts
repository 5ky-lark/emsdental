import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { User } from '@prisma/client';
import prisma from '@/lib/prisma';

// Role definitions
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff',
  USER: 'user',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

// Permission definitions
export const PERMISSIONS = {
  // User management
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  
  // Product management
  PRODUCT_CREATE: 'product:create',
  PRODUCT_READ: 'product:read',
  PRODUCT_UPDATE: 'product:update',
  PRODUCT_DELETE: 'product:delete',
  
  // Order management
  ORDER_CREATE: 'order:create',
  ORDER_READ: 'order:read',
  ORDER_UPDATE: 'order:update',
  ORDER_DELETE: 'order:delete',
  
  // Admin panel access
  ADMIN_DASHBOARD: 'admin:dashboard',
  ADMIN_ANALYTICS: 'admin:analytics',
  ADMIN_REPORTS: 'admin:reports',
  
  // Content management
  CONTENT_CREATE: 'content:create',
  CONTENT_READ: 'content:read',
  CONTENT_UPDATE: 'content:update',
  CONTENT_DELETE: 'content:delete',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Role-Permission mapping
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [ROLES.ADMIN]: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.PRODUCT_CREATE,
    PERMISSIONS.PRODUCT_READ,
    PERMISSIONS.PRODUCT_UPDATE,
    PERMISSIONS.PRODUCT_DELETE,
    PERMISSIONS.ORDER_READ,
    PERMISSIONS.ORDER_UPDATE,
    PERMISSIONS.ADMIN_DASHBOARD,
    PERMISSIONS.ADMIN_ANALYTICS,
    PERMISSIONS.ADMIN_REPORTS,
    PERMISSIONS.CONTENT_CREATE,
    PERMISSIONS.CONTENT_READ,
    PERMISSIONS.CONTENT_UPDATE,
    PERMISSIONS.CONTENT_DELETE,
  ],
  [ROLES.MANAGER]: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.PRODUCT_CREATE,
    PERMISSIONS.PRODUCT_READ,
    PERMISSIONS.PRODUCT_UPDATE,
    PERMISSIONS.ORDER_READ,
    PERMISSIONS.ORDER_UPDATE,
    PERMISSIONS.ADMIN_DASHBOARD,
    PERMISSIONS.ADMIN_ANALYTICS,
    PERMISSIONS.CONTENT_CREATE,
    PERMISSIONS.CONTENT_READ,
    PERMISSIONS.CONTENT_UPDATE,
  ],
  [ROLES.STAFF]: [
    PERMISSIONS.PRODUCT_READ,
    PERMISSIONS.ORDER_READ,
    PERMISSIONS.ORDER_UPDATE,
    PERMISSIONS.CONTENT_READ,
  ],
  [ROLES.USER]: [
    PERMISSIONS.ORDER_CREATE,
    PERMISSIONS.ORDER_READ,
  ],
};

// Check if user has permission
export function hasPermission(userRole: string, permission: Permission): boolean {
  const role = userRole as Role;
  if (!role || !ROLE_PERMISSIONS[role]) {
    return false;
  }
  return ROLE_PERMISSIONS[role].includes(permission);
}

// Check if user has any of the permissions
export function hasAnyPermission(userRole: string, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission));
}

// Check if user has all permissions
export function hasAllPermissions(userRole: string, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(userRole, permission));
}

// Get user permissions
export function getUserPermissions(userRole: string): Permission[] {
  const role = userRole as Role;
  return ROLE_PERMISSIONS[role] || [];
}

// Middleware for API route protection
export function withPermission(permission: Permission) {
  return (handler: any) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      try {
        const session = await getServerSession(req, res, authOptions);
        
        if (!session?.user) {
          return res.status(401).json({ error: 'Unauthorized' });
        }

        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
        });

        if (!user) {
          return res.status(401).json({ error: 'User not found' });
        }

        if (!hasPermission(user.role, permission)) {
          return res.status(403).json({ 
            error: 'Forbidden',
            message: `You don't have permission to perform this action. Required permission: ${permission}`,
          });
        }

        // Add user to request object
        (req as any).user = user;
        
        return handler(req, res);
      } catch (error) {
        console.error('Permission check error:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    };
  };
}

// Middleware for role-based access
export function withRole(roles: Role[]) {
  return (handler: any) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      try {
        const session = await getServerSession(req, res, authOptions);
        
        if (!session?.user) {
          return res.status(401).json({ error: 'Unauthorized' });
        }

        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
        });

        if (!user) {
          return res.status(401).json({ error: 'User not found' });
        }

        if (!roles.includes(user.role as Role)) {
          return res.status(403).json({ 
            error: 'Forbidden',
            message: `Access denied. Required roles: ${roles.join(', ')}`,
          });
        }

        // Add user to request object
        (req as any).user = user;
        
        return handler(req, res);
      } catch (error) {
        console.error('Role check error:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    };
  };
}

// Admin-only middleware
export const withAdminAccess = withRole([ROLES.SUPER_ADMIN, ROLES.ADMIN]);

// Manager and above middleware
export const withManagerAccess = withRole([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER]);

// Staff and above middleware
export const withStaffAccess = withRole([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF]);

// Common permission-based middlewares
export const withUserManagement = withPermission(PERMISSIONS.USER_UPDATE);
export const withProductManagement = withPermission(PERMISSIONS.PRODUCT_UPDATE);
export const withOrderManagement = withPermission(PERMISSIONS.ORDER_UPDATE);
export const withAdminDashboard = withPermission(PERMISSIONS.ADMIN_DASHBOARD);

// Helper function to check if user is admin
export function isAdmin(userRole: string): boolean {
  return [ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(userRole as Role);
}

// Helper function to check if user is manager or above
export function isManagerOrAbove(userRole: string): boolean {
  return [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER].includes(userRole as Role);
}

// Helper function to check if user is staff or above
export function isStaffOrAbove(userRole: string): boolean {
  return [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF].includes(userRole as Role);
}
