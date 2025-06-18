export const environment = {
  production: false,
  apiUrl: 'http://localhost:8090/api/v1',

  auth: {
    baseUrl: 'http://localhost:8090/api/auth',
    tokenKey: 'authToken',
    refreshTokenKey: 'refreshToken',
    loginUrl: '/login',
    logoutUrl: '/logout',
    validateTokenUrl: '/validate-token',
    registerUrl: '/registro'
  },

  cloudinary: {
    cloudName: 'dedwqhiki',
    apiKey: '656696618124312',
    uploadPreset: 'maestranza_uploads'
  },

  session: {
    inactivityTimeout: 15,
    windowCloseGracePeriod: 3,
    tokenValidationInterval: 3,
    warningBeforeLogout: 2
  },

  api: {
    timeout: 15000,
    retryAttempts: 2,
    retryDelay: 2000
  },

  endpoints: {
    productos: '/productos',
    usuarios: '/usuarios',
    categorias: '/categorias',
    alertas: '/alertas',
    roles: '/roles',
    reportes: '/reportes'
  },

  notifications: {
    defaultDuration: 4000,
    enableSounds: false,
    enableBrowserNotifications: true
  },

  storage: {
    userPreferences: 'userPreferences',
    lastRoute: 'lastRoute',
    sessionData: 'sessionData'
  },

  logging: {
    level: 'error',
    enableConsoleLog: false,
    enableRemoteLogging: true
  },

  features: {
    enableSessionMonitoring: true,
    enableAutoLogout: true,
    enableTokenValidation: true,
    enableOfflineMode: false,
    enableDarkMode: true,
    enableExportData: true
  },

  app: {
    name: 'Maestranza System',
    version: '1.0.0',
    supportEmail: 'soporte@maestranza.cl',
    maxFileUploadSize: 5242880,
    allowedFileTypes: ['pdf', 'xlsx', 'docx', 'jpg', 'png'],
    itemsPerPage: 15,
    maxSearchResults: 50
  }
};