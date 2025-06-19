
# Sistema Maestranza - Frontend

Sistema web de gestión de inventario y taller desarrollado con Angular 19, diseñado para operaciones de almacén y talleres mecánicos.

## 🚀 Características Principales

- **Gestión de Inventario**: Administración completa de productos con categorización y seguimiento de stock
- **Registro de Movimientos**: Documentación de movimientos de inventario con comprobantes fotográficos
- **Gestión de Usuarios**: Sistema de usuarios con control de acceso basado en roles
- **Sistema de Alertas**: Monitoreo en tiempo real con notificaciones automáticas
- **Interfaz Responsiva**: Diseño Material Design con Bootstrap para una experiencia óptima

## 🛠️ Stack Tecnológico

### Frontend
- **Framework**: Angular 19 con componentes standalone [1](#0-0) 
- **UI/UX**: Angular Material, Bootstrap 5.3.6, Bootstrap Icons [2](#0-1) 
- **Gestión de Estado**: RxJS observables y servicios Angular
- **Notificaciones**: SweetAlert2, ngx-toastr [3](#0-2) 
- **Gestión de Imágenes**: Integración con Cloudinary [4](#0-3) 

### Herramientas de Desarrollo
- **Lenguaje**: TypeScript 5.8
- **Build**: Angular CLI
- **Testing**: Jasmine, Karma

## 📋 Requisitos Previos

- Node.js (versión 18 o superior)
- npm o yarn
- Angular CLI (`npm install -g @angular/cli`)

## 🔧 Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/Gutierrez-Urrutia/maestranza-front.git
cd maestranza-front
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno

El sistema utiliza diferentes configuraciones para desarrollo y producción:

**Desarrollo** [5](#0-4) :
- API URL: `http://localhost:8090/api/v1`
- Timeout: 15 segundos
- Reintentos: 2

**Producción**:
- API URL: `https://maestranza-backend.onrender.com/api/v1`
- Timeout: 10 segundos
- Reintentos: 3

### 4. Ejecutar la aplicación

```bash
# Desarrollo
npm start

# Producción
npm run build:prod
```

La aplicación estará disponible en `http://localhost:4200`

## 🏗️ Arquitectura del Sistema

### Módulos Principales

#### 1. Gestión de Inventario (`InventarioComponent`)
- CRUD completo de productos [6](#0-5) 
- Filtrado por categoría y estado de stock [7](#0-6) 
- Tabla Material con paginación y ordenamiento
- Formularios modales para agregar/editar productos

#### 2. Registro de Movimientos (`MovimientosComponent`)
- Seguimiento de entradas y salidas de inventario [8](#0-7) 
- Integración con cámara para comprobantes
- Visualización de detalles con imágenes [9](#0-8) 

#### 3. Gestión de Usuarios (`UsuariosComponent`)
- Administración de usuarios del sistema [10](#0-9) 
- Sistema de roles y permisos
- Filtrado por rol y estado

#### 4. Sistema de Alertas (`AlertasComponent`)
- Monitoreo de stock bajo [11](#0-10) 
- Notificaciones en tiempo real vía Server-Sent Events
- Clasificación por nivel de urgencia

### Servicios Principales

- **AuthService**: Autenticación y autorización [12](#0-11) 
- **ProductoService**: Gestión de productos
- **MovimientoService**: Registro de movimientos
- **AlertaService**: Gestión de alertas [13](#0-12) 
- **NotificationService**: Notificaciones en tiempo real

## 🔐 Sistema de Autenticación

El sistema implementa autenticación JWT con:
- Login seguro con validación de credenciales [14](#0-13) 
- Gestión automática de tokens
- Interceptor HTTP para autenticación automática [15](#0-14) 
- Control de sesión con timeout configurable [16](#0-15) 

## 👥 Sistema de Roles

El sistema maneja múltiples roles con diferentes niveles de acceso:

- **Administrador**: Acceso completo al sistema
- **Gerencia**: Gestión y supervisión
- **Auditor**: Solo lectura y reportes
- **Inventario**: Gestión de productos y stock
- **Compras**: Gestión de adquisiciones
- **Logística**: Gestión de movimientos
- **Producción**: Operaciones de producción
- **Trabajador**: Acceso básico [17](#0-16) 

## 📱 Características de la Interfaz

### Componentes de Formulario
- **Formularios Reactivos**: Validación en tiempo real [18](#0-17) 
- **Gestión de Errores**: Mensajes específicos por campo
- **Estados de Carga**: Indicadores visuales durante procesamiento

### Tabla de Datos
- **Material Table**: Ordenamiento y paginación [19](#0-18) 
- **Búsqueda Avanzada**: Filtros múltiples
- **Paginación en Español**: Interfaz localizada [20](#0-19) 

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm start                 # Servidor de desarrollo
npm run watch            # Build con watch mode

# Producción
npm run build            # Build para desarrollo
npm run build:prod       # Build para producción
npm run clean            # Limpiar directorio dist

# Testing
npm test                 # Ejecutar tests unitarios
```

## 🌐 Configuración de Entornos

### Variables de Configuración [21](#0-20) 

| Configuración | Desarrollo | Producción |
|---------------|------------|------------|
| **Nombre de la App** | Maestranza System | Maestranza System |
| **Versión** | 1.0.0 | 1.0.0 |
| **Email de Soporte** | soporte@maestranza.cl | soporte@maestranza.cl |
| **Tamaño Máximo de Archivo** | 5MB | 5MB |
| **Elementos por Página** | 15 | 15 |

## 🚀 Despliegue

### Build de Producción
```bash
npm run build:prod
```

Los archivos se generarán en el directorio `dist/` listos para despliegue.

### Variables de Entorno de Producción
Asegúrate de configurar:
- URL del backend de producción
- Credenciales de Cloudinary
- Configuración de timeouts y reintentos

