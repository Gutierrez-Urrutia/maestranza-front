export const environment = {
  production: true,
  apiUrl: 'https://maestranza-backend.onrender.com/api/v1',

  auth: {
    baseUrl: 'https://maestranza-backend.onrender.com/api/auth',
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
    timeout: 10000,
    retryAttempts: 3,
    retryDelay: 1000
  },

  notifications: {
    toastTimeout: 5000,
    enableBrowserNotifications: true,
    enableSounds: false
  },

  ui: {
    theme: 'default',
    language: 'es',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: '24h',
    pagination: {
      defaultPageSize: 10,
      pageSizeOptions: [5, 10, 25, 50]
    }
  },

  security: {
    enableCSRF: true,
    enableXSS: true,
    maxFileUploadSize: 5242880,
    allowedFileTypes: ['image/jpeg', 'image/png', 'image/webp']
  },

  logging: {
    level: 'error',
    enableConsoleOutput: false,
    enableRemoteLogging: true
  }
};