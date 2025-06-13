
export const environment = {
  production: true,
  apiUrl: 'http://localhost:8090/api/v1', // URL de producción

  // Configuración de autenticación
  auth: {
    baseUrl: 'http://localhost:8090/api/auth',
    tokenKey: 'authToken',
    refreshTokenKey: 'refreshToken',
    loginUrl: '/login',
    logoutUrl: '/logout',
    validateTokenUrl: '/validate-token',
    registerUrl: '/registro'
  },

  // Configuración de sesión y timeouts (más restrictivo en producción)
  session: {
    inactivityTimeout: 15, // 15 minutos en producción
    windowCloseGracePeriod: 3,
    tokenValidationInterval: 3, // Más frecuente en producción
    warningBeforeLogout: 2
  },

  // Configuración de API
  api: {
    timeout: 15000, // Más corto en producción
    retryAttempts: 2,
    retryDelay: 2000
  },

  // URLs específicas de la aplicación
  endpoints: {
    productos: '/productos',
    usuarios: '/usuarios',
    categorias: '/categorias',
    alertas: '/alertas',
    roles: '/roles',
    reportes: '/reportes'
  },

  // Configuración de notificaciones
  notifications: {
    defaultDuration: 4000,
    enableSounds: false, // Deshabilitado en producción
    enableBrowserNotifications: true
  },

  // Configuración de almacenamiento
  storage: {
    userPreferences: 'userPreferences',
    lastRoute: 'lastRoute',
    sessionData: 'sessionData'
  },

  // Configuración de logging (más restrictivo)
  logging: {
    level: 'error', // Solo errores en producción
    enableConsoleLog: false,
    enableRemoteLogging: true
  },

  // Configuración de features
  features: {
    enableSessionMonitoring: true,
    enableAutoLogout: true,
    enableTokenValidation: true,
    enableOfflineMode: false,
    enableDarkMode: true,
    enableExportData: true
  },

  // Configuración de la aplicación
  app: {
    name: 'Maestranza System',
    version: '1.0.0',
    supportEmail: 'soporte@maestranza.cl',
    maxFileUploadSize: 5242880, // 5MB en producción
    allowedFileTypes: ['pdf', 'xlsx', 'docx', 'jpg', 'png'],
    itemsPerPage: 15,
    maxSearchResults: 50
  }
};