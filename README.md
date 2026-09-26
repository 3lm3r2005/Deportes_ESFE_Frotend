# ⚽ Deportes ESFE - Frontend

Aplicación Web Single Page Application (SPA) para la administración, seguimiento y automatización de los torneos de fútbol de la institución **ESFE**. Diseñada para ofrecer una experiencia intuitiva, reactiva y adaptada a múltiples tipos de usuarios: administradores, delegados de carrera, árbitros colegiados y aficionados de la comunidad estudiantil.

---

## 🚀 Tecnologías Principales

- **Framework & Build Tool:** [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **UI & Componentes:** [Material UI (MUI v9)](https://mui.com/) + `@emotion/react` + `@emotion/styled`
- **Iconografía:** `@mui/icons-material`
- **Enrutamiento:** [React Router v7](https://reactrouter.com/) (configurado con `HashRouter` para máxima compatibilidad con GitHub Pages y servidores estáticos)
- **Formularios y Validación:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) + `@hookform/resolvers`
- **Cliente HTTP:** [Axios](https://axios-http.com/) con interceptores de autenticación y manejo de sesiones
- **Fechas y Tiempos:** [Dayjs](https://day.js.org/) + `@mui/x-date-pickers`
- **Almacenamiento Multimedia:** [Cloudinary API](https://cloudinary.com/) (subida directa sin exponer credenciales backend)

---

## 👥 Roles del Sistema y Matriz de Acceso

La interfaz adapta automáticamente sus opciones, formularios y vistas según el rol del usuario autenticado:

| Módulo / Pantalla | Ruta | Admin | Delegado | Árbitro | Aficionado | Descripción |
|---|---|:---:|:---:|:---:|:---:|---|
| **Inicio / Dashboard** | `/inicio` | ✅ | ✅ | ✅ | ✅ | Resumen dinámico, próximos partidos, líder actual y alertas contextuales |
| **Torneos** | `/torneos` | ✅ (Full) | 👁️ + Inscribir | 👁️ | 👁️ | Lista de torneos, creación/edición y registro de equipos participantes |
| **Equipos** | `/equipos` | ✅ (Full) | ✅ (Su equipo) | ❌ | ❌ | Gestión de equipos y configuración de nómina/plantilla (dorsales, titulares) |
| **Jugadores** | `/jugadores` | ✅ (Full) | ✅ (Su equipo) | ❌ | ❌ | Registro de atletas con carné institucional ESFE, posición, teléfono y foto |
| **Partidos** | `/partidos` | ✅ (Full) | 👁️ | ✏️ (Marcador) | 👁️ | Programación de encuentros y carga de resultados (goles, tarjetas amarillas/rojas) |
| **Posiciones** | `/posiciones` | ✅ | ✅ | ✅ | ✅ | Clasificación en vivo, tabla de goleadores y tabla de sanciones/tarjetas |
| **Convocatorias** | `/convocatorias` | ✅ (Full) | 👁️ | 👁️ | ❌ | Avisos oficiales de inicio de inscripciones y fechas límites |
| **Publicaciones** | `/publicaciones` | ✅ (Full) | 💬 | 💬 | 💬 | Muro social de noticias con imágenes y sistema de comentarios interactivos |
| **Usuarios** | `/usuarios` | ✅ | ❌ | ❌ | ❌ | Control de cuentas, asignación de roles y estados (activo/inactivo) |
| **Mi Perfil** | `/perfil` | ✅ | ✅ | ✅ | ✅ | Vista de datos personales y actualización de avatar |

> **Nota:** Los aficionados pueden registrarse públicamente desde `/registro`. La creación de roles con privilegios (`admin`, `delegado`, `arbitro`) se realiza de forma centralizada por el Administrador.

---

## 📁 Estructura del Proyecto

```text
Deportes_ESFE_Frotend/
├── public/                     # Recursos estáticos
├── src/
│   ├── assets/                 # Imágenes, logotipos y vectores
│   ├── components/             # Componentes reutilizables y modales de gestión
│   │   ├── convocatorias/      # Diálogos y tablas de convocatorias
│   │   ├── equipos/            # Diálogo de equipo y gestión de plantilla de jugadores
│   │   ├── jugadores/          # Formularios y listados de atletas
│   │   ├── partidos/           # Formulario de programación y diálogo de resultados
│   │   ├── publicaciones/      # Gestor de comentarios y visualización
│   │   ├── torneos/            # Formulario de torneo e inscripción de equipos
│   │   ├── usuarios/           # Creación y edición de usuarios (Admin)
│   │   ├── ImageUpload.jsx     # Selector y previsualizador de imágenes Cloudinary
│   │   ├── Loading.jsx         # Spinner de carga animado
│   │   ├── MainLayout.jsx      # Barra superior, navegación responsive y selector de tema
│   │   └── ProtectedRoute.jsx  # Guardia de rutas por autenticación y roles
│   ├── config/
│   │   ├── menuItems.js        # Declaración de opciones de menú por rol
│   │   ├── router.jsx          # Definición de rutas con React Router
│   │   └── theme.js            # Paleta de colores ESFE (verde institucional y dorado)
│   ├── pages/                  # Vistas principales de la aplicación
│   │   ├── Convocatorias.jsx
│   │   ├── Equipos.jsx
│   │   ├── Inicio.jsx          # Dashboard interactivo con avisos personalizados
│   │   ├── Jugadores.jsx
│   │   ├── Login.jsx
│   │   ├── Partidos.jsx
│   │   ├── Perfil.jsx
│   │   ├── Posiciones.jsx
│   │   ├── Publicaciones.jsx
│   │   ├── Registro.jsx
│   │   ├── Torneos.jsx
│   │   └── Usuarios.jsx
│   ├── schemas/                # Validaciones client-side con Zod
│   │   ├── convocatoria.schema.js
│   │   ├── env.schema.js       # Validación de variables de entorno al iniciar
│   │   ├── equipo.schema.js
│   │   ├── inscripcionJugador.schema.js
│   │   ├── jugador.schema.js
│   │   ├── login.schema.js
│   │   ├── partido.schema.js
│   │   ├── Publicacion.schema.js
│   │   ├── registro.schema.js
│   │   ├── torneo.schema.js
│   │   └── usuario.schema.js
│   ├── services/               # Clientes de API REST y servicios externos
│   │   ├── api.js              # Instancia central de Axios con interceptor 401
│   │   ├── auth.service.js     # Manejo de login, registro, logout y localStorage
│   │   ├── cloudinary.service.js # Subida de imágenes vía REST API a Cloudinary
│   │   ├── convocatoria.service.js
│   │   ├── equipo.service.js
│   │   ├── jugador.service.js
│   │   ├── partido.service.js
│   │   ├── publicacion.service.js
│   │   ├── torneo.service.js
│   │   └── usuario.service.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .env.example
├── package.json
└── vite.config.js
```

---

## ⚙️ Configuración y Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto tomando como plantilla `.env.example`:

```env
# URL base de la API Backend de Deportes ESFE
VITE_API_URL=http://localhost:4000/api

# Configuración de Cloudinary para la carga de fotos (avatares, logos, publicaciones)
VITE_CLOUDINARY_CLOUD_NAME=tu_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=tu_unsigned_upload_preset
```

> **Validación Segura:** El archivo `src/schemas/env.schema.js` valida en tiempo de ejecución que estas variables existan antes de inicializar peticiones al servidor.

---

## 📦 Instalación y Ejecución Local

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Iniciar servidor de desarrollo (Vite HMR):**
   ```bash
   npm run dev
   ```
   La aplicación se abrirá por defecto en `http://localhost:5173`.

3. **Compilar para producción:**
   ```bash
   npm run build
   ```
   Genera los archivos estáticos optimizados en la carpeta `dist/`.

4. **Probar la compilación en local:**
   ```bash
   npm run preview
   ```

5. **Desplegar en GitHub Pages:**
   ```bash
   npm run deploy
   ```

---

## 🛡️ Seguridad y Buenas Prácticas en el Frontend

- **Validación Bidireccional:** Se utiliza Zod tanto en formularios como en la verificación de formatos institucionales (ej. carné estudiantil formato `PO2026` o `PO25001`, teléfono salvadoreño de 8 dígitos).
- **Manejo Centralizado de Expiración:** El interceptor de Axios detecta códigos de estado `401 Unauthorized` (sesión expirada o token inválido), purga el almacenamiento local y redirige suavemente al usuario hacia la pantalla de inicio de sesión (`#/login`).
- **Control de Acceso basado en Componentes (`ProtectedRoute`):** Previene accesos no autorizados mediante URL directa verificando el rol persistido en el cliente contra los roles autorizados para cada vista.
