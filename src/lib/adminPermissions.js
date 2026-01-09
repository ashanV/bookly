/**
 * Admin Permissions - definicje uprawnień dla ról administracyjnych
 */

// Role administracyjne
export const ADMIN_ROLES = {
    ADMIN: 'admin',
    MODERATOR: 'moderator',
    DEVELOPER: 'developer',
};

// Wszystkie dostępne uprawnienia
export const PERMISSIONS = {
    // Użytkownicy
    USERS_VIEW: 'users:view',
    USERS_EDIT: 'users:edit',
    USERS_DELETE: 'users:delete',
    USERS_BAN: 'users:ban',
    USERS_TEMP_BAN: 'users:temp_ban',

    // Biznesy
    BUSINESSES_VIEW: 'businesses:view',
    BUSINESSES_EDIT: 'businesses:edit',
    BUSINESSES_DELETE: 'businesses:delete',
    BUSINESSES_VERIFY: 'businesses:verify',

    // Rezerwacje
    RESERVATIONS_VIEW: 'reservations:view',
    RESERVATIONS_CANCEL: 'reservations:cancel',
    RESERVATIONS_RESOLVE_DISPUTE: 'reservations:resolve_dispute',

    // Zgłoszenia/Support
    SUPPORT_VIEW: 'support:view',
    SUPPORT_RESPOND: 'support:respond',
    SUPPORT_CLOSE: 'support:close',
    SUPPORT_ASSIGN: 'support:assign',

    // Recenzje
    REVIEWS_VIEW: 'reviews:view',
    REVIEWS_DELETE: 'reviews:delete',

    // Finanse
    FINANCE_VIEW: 'finance:view',
    FINANCE_MANAGE: 'finance:manage',

    // Ustawienia systemu
    SETTINGS_VIEW: 'settings:view',
    SETTINGS_EDIT: 'settings:edit',

    // Role
    ROLES_VIEW: 'roles:view',
    ROLES_MANAGE: 'roles:manage',

    // Logi
    LOGS_VIEW: 'logs:view',
    LOGS_SYSTEM: 'logs:system',

    // Developer
    DEV_API_MONITOR: 'dev:api_monitor',
    DEV_FEATURE_FLAGS: 'dev:feature_flags',
    DEV_CACHE: 'dev:cache',
    DEV_HEALTH: 'dev:health',
};

// Mapowanie ról na uprawnienia
export const ROLE_PERMISSIONS = {
    [ADMIN_ROLES.ADMIN]: Object.values(PERMISSIONS), // Admin ma wszystkie uprawnienia

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

// Mapowanie sekcji na wymagane uprawnienia
export const SECTION_PERMISSIONS = {
    '/admin': [], // Dostępne dla wszystkich zalogowanych adminów
    '/admin/users': [PERMISSIONS.USERS_VIEW],
    '/admin/businesses': [PERMISSIONS.BUSINESSES_VIEW],
    '/admin/reservations': [PERMISSIONS.RESERVATIONS_VIEW],
    '/admin/support': [PERMISSIONS.SUPPORT_VIEW],
    '/admin/finance': [PERMISSIONS.FINANCE_VIEW],
    '/admin/settings': [PERMISSIONS.SETTINGS_VIEW],
    '/admin/developer': [PERMISSIONS.DEV_API_MONITOR],
    '/admin/logs': [PERMISSIONS.LOGS_VIEW],
    '/admin/roles': [PERMISSIONS.ROLES_VIEW],
};

/**
 * Sprawdza czy rola ma dane uprawnienie
 */
export function hasPermission(role, permission) {
    if (!role) return false;
    const permissions = ROLE_PERMISSIONS[role] || [];
    return permissions.includes(permission);
}

/**
 * Sprawdza czy rola ma dostęp do danej sekcji
 */
export function canAccessSection(role, section) {
    if (!role) return false;
    const requiredPermissions = SECTION_PERMISSIONS[section] || [];
    if (requiredPermissions.length === 0) return true; // Brak wymagań = dostęp dla wszystkich

    const userPermissions = ROLE_PERMISSIONS[role] || [];
    return requiredPermissions.every(p => userPermissions.includes(p));
}

/**
 * Pobiera listę dostępnych sekcji dla danej roli
 */
export function getAccessibleSections(role) {
    if (!role) return [];
    return Object.keys(SECTION_PERMISSIONS).filter(section =>
        canAccessSection(role, section)
    );
}

/**
 * Generuje losowy PIN 6-cyfrowy
 */
export function generatePin() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
