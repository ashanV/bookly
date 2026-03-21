/**
 * Admin Permissions
 */

// Admin roles
export const ADMIN_ROLES = {
    ADMIN: 'admin',
    MODERATOR: 'moderator',
    DEVELOPER: 'developer',
};

// All available permissions
export const PERMISSIONS = {
    // Users
    USERS_VIEW: 'users:view',
    USERS_EDIT: 'users:edit',
    USERS_DELETE: 'users:delete',
    USERS_BAN: 'users:ban',
    USERS_TEMP_BAN: 'users:temp_ban',

    // Businesses
    BUSINESSES_VIEW: 'businesses:view',
    BUSINESSES_EDIT: 'businesses:edit',
    BUSINESSES_DELETE: 'businesses:delete',
    BUSINESSES_VERIFY: 'businesses:verify',

    // Reservations
    RESERVATIONS_VIEW: 'reservations:view',
    RESERVATIONS_CANCEL: 'reservations:cancel',
    RESERVATIONS_RESOLVE_DISPUTE: 'reservations:resolve_dispute',

    // Support
    SUPPORT_VIEW: 'support:view',
    SUPPORT_RESPOND: 'support:respond',
    SUPPORT_CLOSE: 'support:close',
    SUPPORT_ASSIGN: 'support:assign',

    // Reviews
    REVIEWS_VIEW: 'reviews:view',
    REVIEWS_DELETE: 'reviews:delete',

    // Finance
    FINANCE_VIEW: 'finance:view',
    FINANCE_MANAGE: 'finance:manage',

    // Settings
    SETTINGS_VIEW: 'settings:view',
    SETTINGS_EDIT: 'settings:edit',

    // Roles
    ROLES_VIEW: 'roles:view',
    ROLES_MANAGE: 'roles:manage',

    // Logs
    LOGS_VIEW: 'logs:view',
    LOGS_SYSTEM: 'logs:system',

    // Developer
    DEV_API_MONITOR: 'dev:api_monitor',
    DEV_FEATURE_FLAGS: 'dev:feature_flags',
    DEV_CACHE: 'dev:cache',
    DEV_HEALTH: 'dev:health',
};

// Role to permissions mapping
export const ROLE_PERMISSIONS = {
    [ADMIN_ROLES.ADMIN]: Object.values(PERMISSIONS), // Admin has all permissions

    [ADMIN_ROLES.MODERATOR]: [
        PERMISSIONS.USERS_VIEW,
        PERMISSIONS.USERS_EDIT,
        PERMISSIONS.USERS_TEMP_BAN,
        PERMISSIONS.BUSINESSES_VIEW,
        PERMISSIONS.BUSINESSES_VERIFY,
        PERMISSIONS.RESERVATIONS_VIEW,
        PERMISSIONS.RESERVATIONS_RESOLVE_DISPUTE,
        PERMISSIONS.SUPPORT_VIEW,
        PERMISSIONS.SUPPORT_RESPOND,
        PERMISSIONS.SUPPORT_CLOSE,
        PERMISSIONS.REVIEWS_VIEW,
        PERMISSIONS.REVIEWS_DELETE,
        PERMISSIONS.LOGS_VIEW,
    ],

    [ADMIN_ROLES.DEVELOPER]: [
        PERMISSIONS.LOGS_VIEW,
        PERMISSIONS.LOGS_SYSTEM,
        PERMISSIONS.DEV_API_MONITOR,
        PERMISSIONS.DEV_FEATURE_FLAGS,
        PERMISSIONS.DEV_CACHE,
        PERMISSIONS.DEV_HEALTH,
    ],
};

// Section to permissions mapping
export const SECTION_PERMISSIONS = {
    '/admin': [], // Available for all logged-in admins
    '/admin/users': [PERMISSIONS.USERS_VIEW],
    '/admin/businesses': [PERMISSIONS.BUSINESSES_VIEW],
    '/admin/reservations': [PERMISSIONS.RESERVATIONS_VIEW],
    '/admin/support': [PERMISSIONS.SUPPORT_VIEW],
    '/admin/finance': [PERMISSIONS.FINANCE_VIEW],
    '/admin/settings': [PERMISSIONS.SETTINGS_VIEW],
    '/admin/developer': [PERMISSIONS.DEV_API_MONITOR],
    '/admin/logs': [PERMISSIONS.LOGS_VIEW],
    '/admin/security': [PERMISSIONS.LOGS_VIEW],
    '/admin/roles': [PERMISSIONS.ROLES_VIEW],
};

/**
 * Checks if role has given permission
 */
export function hasPermission(role, permission) {
    if (!role) return false;
    const permissions = ROLE_PERMISSIONS[role] || [];
    return permissions.includes(permission);
}

/**
 * Checks if role has access to given section
 */
export function canAccessSection(role, section) {
    if (!role) return false;
    const requiredPermissions = SECTION_PERMISSIONS[section] || [];
    if (requiredPermissions.length === 0) return true; // No requirements = access for all

    const userPermissions = ROLE_PERMISSIONS[role] || [];
    return requiredPermissions.every(p => userPermissions.includes(p));
}

/**
 * Gets list of accessible sections for given role
 */
export function getAccessibleSections(role) {
    if (!role) return [];
    return Object.keys(SECTION_PERMISSIONS).filter(section =>
        canAccessSection(role, section)
    );
}

/**
 * Generates random 6-digit PIN
 */
export function generatePin() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
