# EcoCampus

EcoCampus es una plataforma web de educación ambiental que premia los hábitos sustentables. Las personas registran acciones ecológicas con una foto como evidencia, un administrador las revisa y, cuando se aprueban, suman **Eco-Points**. Esos puntos se canjean por cursos de reciclaje, compostaje, energía, finanzas sostenibles y otros temas.

La idea central es simple: **aprender mientras cambiás el mundo**. En lugar de pagar todos los cursos con dinero, se pueden pagar con acciones reales que ya forman parte de la vida cotidiana.

## Qué problema resuelve

- **Educación ambiental accesible:** reduce la barrera económica para capacitarse, porque las acciones sustentables funcionan como moneda.
- **Reconocimiento del esfuerzo:** cada acción aprobada deja un historial de puntos, fecha y estado, así el usuario ve el resultado de lo que hizo.
- **Verificación real:** las evidencias pasan por una revisión humana, con motivos de rechazo y posibilidad de volver a enviar.
- **Gestión para la institución:** el panel de administración centraliza cursos, acciones, entregas, pagos, mensajes y preguntas frecuentes.
- **Trazabilidad:** compras, puntos y progreso quedan registrados aunque un curso se elimine o el usuario cambie de dispositivo.

## Demo en línea

| Servicio | Enlace |
| --- | --- |
| Frontend (Netlify) | https://eco-campus.netlify.app |
| API (Render) | https://ecocampus-api-dyis.onrender.com |

La base de datos está en MongoDB Atlas. La primera visita al backend puede tardar entre 30 y 60 segundos porque el plan gratuito de Render suspende el servicio por inactividad.

## Funcionalidades principales

### Para visitantes

- Inicio, catálogo de cursos, fichas públicas con metadatos y SEO por página.
- Sección de impacto, preguntas frecuentes y formulario de contacto.
- Registro e ingreso con correo y contraseña.

### Para usuarios

- Panel con Eco-Points, acciones pendientes, aprobadas y cursos desbloqueados.
- Envío de evidencias con descripción, cantidad y foto.
- Historial de puntos y exportación a CSV.
- Compra de cursos con Eco-Points, dinero simulado, pago mixto o de forma gratuita.
- Progreso módulo por módulo dentro de cada curso.
- Correos de bienvenida, aprobación, rechazo y compra.

### Para administradores

- Panel con pestañas de cursos, acciones, entregas, pagos, mensajes y preguntas frecuentes.
- Aprobación o rechazo de evidencias, con motivo y espera configurable para repetir una acción.
- Gestión de cursos con módulos, precios y contenido.
- Bandeja de mensajes de contacto y exportación de datos.

## Stack

| Capa | Tecnología |
| --- | --- |
| Frontend | React 19, Vite 8, React Router 7, JavaScript |
| Backend | Node.js, Express 5, CommonJS |
| Base de datos | MongoDB con Mongoose 9 |
| Autenticación | JWT y bcryptjs |
| Correo | Nodemailer (Mailtrap para pruebas) |
| Archivos | Multer, guardados en `backend/uploads` |
| Seguridad | Helmet, CORS, rate limit y validaciones |
| Estilos | CSS propio, sin librerías de componentes |

## Estructura del proyecto

```text
ecocampus-project/
├── backend/
│   ├── middleware/       Autenticación de usuario y administrador
│   ├── models/           Esquemas de MongoDB
│   ├── routes/           Endpoints de la API
│   ├── utils/            Correos, validaciones y catálogo de acciones
│   ├── uploads/          Fotos de las evidencias
│   └── server.js         Punto de entrada del backend
├── frontend/
│   ├── public/           Imágenes, favicons, robots y redirects
│   └── src/
│       ├── components/   Componentes reutilizables
│       ├── hooks/        Hooks propios
│       ├── pages/        Vistas de la aplicación
│       └── api.js        Todas las llamadas HTTP del frontend
├── netlify.toml          Configuración del frontend en Netlify
└── render.yaml           Blueprint del backend en Render
```

## Requisitos

- Node.js `^20.19.0` o `>=22.12.0` (recomendado: Node 22).
- MongoDB local 6 o superior, o una base en MongoDB Atlas.
- Cuenta de Mailtrap si se quieren ver los correos reales. Sin SMTP configurado, los correos se imprimen en la consola del backend.

## Instalación local

### 1. Backend

```bash
cd backend
npm install
```

Crear `backend/.env` a partir de `backend/.env.example` y completar al menos `MONGODB_URI` y `JWT_SECRET`:

```bash
# Windows PowerShell
Copy-Item .env.example .env

# macOS o Linux
cp .env.example .env
```

Luego arrancar el servidor:

```bash
npm run dev
```

Queda disponible en `http://localhost:3000`. La primera vez que arranca, el backend crea el catálogo de acciones sustentables y sincroniza los índices.

### 2. Frontend

En otra terminal:

```bash
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Queda disponible en `http://localhost:5173`. El archivo `frontend/.env` solo necesita `VITE_API_URL=http://localhost:3000`.

### 3. Primer usuario administrador

El registro público siempre crea usuarios con rol `user`. Para tener un administrador en local:

1. Registrarse desde la web.
2. Abrir MongoDB y cambiar el campo `role` de ese usuario a `admin`.
3. Cerrar sesión y volver a ingresar para que el token nuevo incluya el rol.

## Variables de entorno

### Backend (`backend/.env`)

| Variable | Para qué sirve | Ejemplo seguro |
| --- | --- | --- |
| `PORT` | Puerto del servidor | `3000` |
| `MONGODB_URI` | Cadena de conexión de MongoDB | `mongodb://127.0.0.1:27017/ecocampus` |
| `JWT_SECRET` | Firma de los tokens de sesión | Un texto largo y aleatorio |
| `JWT_EXPIRES_IN` | Duración del token | `2h` |
| `ALLOWED_ORIGINS` | Orígenes permitidos por CORS, separados por coma | `http://localhost:5173` |
| `SITE_URL` | Enlaces que se incluyen en los correos | `http://localhost:5173` |
| `SMTP_HOST` | Servidor SMTP | `sandbox.smtp.mailtrap.io` |
| `SMTP_PORT` | Puerto SMTP | `587` |
| `SMTP_SECURE` | Usar TLS directo | `false` |
| `SMTP_USER` | Usuario SMTP | El de Mailtrap |
| `SMTP_PASS` | Contraseña SMTP | La de Mailtrap |
| `MAIL_FROM` | Remitente de los correos | `EcoCampus <no-responder@ecocampus.local>` |
| `ADMIN_EMAIL` | Recibe el aviso del formulario de contacto | Un correo real |
| `MAIL_MIN_GAP_MS` | Espera entre envíos, en milisegundos | `10500` con Mailtrap, vacío en otros |

### Frontend (`frontend/.env`)

| Variable | Para qué sirve | Ejemplo |
| --- | --- | --- |
| `VITE_API_URL` | URL base de la API, sin `/api` y sin barra final | `http://localhost:3000` |

Los archivos `.env` reales no se suben al repositorio. Solo se versionan los `.env.example`.

## Scripts disponibles

| Carpeta | Comando | Qué hace |
| --- | --- | --- |
| `backend` | `npm run dev` | Arranca con recarga automática |
| `backend` | `npm start` | Arranca en modo normal, para producción |
| `frontend` | `npm run dev` | Servidor de desarrollo en el puerto 5173 |
| `frontend` | `npm run build` | Genera la versión de producción en `dist` |
| `frontend` | `npm run preview` | Sirve la versión compilada |
| `frontend` | `npm run lint` | Revisa el código con oxlint |

## Despliegue

La combinación recomendada es **Netlify para el frontend**, **Render para el backend** y **MongoDB Atlas para la base de datos**. Render no puede conectarse a un MongoDB que corre en una computadora personal, por eso la base también tiene que estar en la nube.

### 1. Base de datos en MongoDB Atlas

1. Crear una cuenta y un clúster gratuito (M0).
2. En **Database Access**, crear un usuario con contraseña.
3. En **Network Access**, permitir `0.0.0.0/0`. Render usa direcciones IP variables; restringir por IP puede cortar la conexión.
4. Copiar la cadena de conexión y agregar el nombre de la base al final: `.../ecocampus`.
5. Guardar esa cadena para usarla como `MONGODB_URI` en Render.

Para que la demo tenga los mismos cursos, acciones y cuentas que en local, conviene importar los datos. El repositorio incluye un script que no necesita las herramientas de MongoDB instaladas:

1. Guardar la cadena de Atlas en `backend/.env.atlas`, en la variable `MONGODB_URI_ATLAS`. Ese archivo está ignorado por git.
2. Desde la carpeta `backend`, ejecutar:

```bash
node scripts/copy-to-atlas.js
```

El script lee la base local desde `backend/.env` (`MONGODB_URI`), copia todas las colecciones a la base indicada en la cadena de Atlas y muestra solo los conteos, nunca las credenciales. Las colecciones que ya tienen datos en el destino se omiten; `node scripts/copy-to-atlas.js --reset` las vacía y las vuelve a copiar. Los índices únicos se crean solos cuando el backend arranca por primera vez contra Atlas.

Si se empieza con una base vacía, el catálogo de acciones se crea solo al arrancar el backend, pero los cursos, las preguntas frecuentes y las cuentas se tienen que crear desde la web.

### 2. Backend en Render

El repositorio incluye `render.yaml`. La forma más rápida es elegir **New > Blueprint**, conectar el repositorio y aceptar la configuración: Render crea el servicio con la carpeta `backend`, `npm install`, `npm start` y Node 22. En ese mismo paso pide los valores de `MONGODB_URI`, `JWT_SECRET`, `ALLOWED_ORIGINS` y `SITE_URL`. Las variables de correo se agregan después en la pestaña **Environment**; si quedan vacías, los correos se imprimen en la consola del servicio.

Si todavía no creaste el sitio de Netlify, poné un valor provisorio en `ALLOWED_ORIGINS` y `SITE_URL` y actualizalo cuando tengas la URL definitiva. Render vuelve a desplegar al guardar los cambios.

Si preferís crearlo a mano, usá estos valores:

1. Crear un **New Web Service** conectado al repositorio.
2. Configurar **Root Directory**: `backend`.
3. **Build Command**: `npm install`.
4. **Start Command**: `npm start`.
5. No definir `PORT`: Render lo asigna automáticamente.
6. Cargar estas variables de entorno:

| Variable | Valor en producción |
| --- | --- |
| `MONGODB_URI` | Cadena de MongoDB Atlas |
| `JWT_SECRET` | Secreto nuevo, largo y distinto del local |
| `JWT_EXPIRES_IN` | `2h` |
| `NODE_ENV` | `production` |
| `ALLOWED_ORIGINS` | URL exacta de Netlify, por ejemplo `https://ecocampus.netlify.app` |
| `SITE_URL` | La misma URL de Netlify, sin barra final |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` | Credenciales de Mailtrap |
| `MAIL_FROM` | Remitente configurado en Mailtrap |
| `ADMIN_EMAIL` | Correo que recibe los mensajes de contacto |
| `MAIL_MIN_GAP_MS` | `10500` para respetar el límite de Mailtrap |

Con `NODE_ENV=production`, los orígenes de `localhost` dejan de aceptarse automáticamente. Si `ALLOWED_ORIGINS` no coincide exactamente con el dominio de Netlify, el navegador va a mostrar errores de CORS.

Dos cosas a tener en cuenta en el plan gratuito:

- El servicio se suspende por inactividad. La primera visita puede tardar entre 30 y 60 segundos; conviene "despertarlo" abriendo `https://TU-API.onrender.com/api/courses` antes de la demo.
- El disco es efímero: las fotos subidas a `backend/uploads` se pierden cuando el servicio se reinicia o se vuelve a desplegar. Para una demo alcanza; si se necesita conservarlas, hay que contratar un disco persistente o usar un servicio de archivos.

### 3. Frontend en Netlify

El repositorio incluye `netlify.toml`, que define la base `frontend`, el build, la carpeta `dist`, Node 22 y el redirect de la SPA. Por eso:

1. Crear un sitio nuevo desde el repositorio.
2. Dejar **Base directory** vacío y no cambiar **Build command** ni **Publish directory**: se toman del archivo.
3. Agregar la variable de entorno `VITE_API_URL` con la URL del backend en Render, por ejemplo `https://ecocampus-api.onrender.com`. Sin `/api` y sin barra final.
4. Volver a desplegar después de cambiar variables: Vite las incorpora en el momento del build.

Anotá la URL que te asigna Netlify (por ejemplo `https://ecocampus.netlify.app`) y volvé a Render para cargarla en `ALLOWED_ORIGINS` y `SITE_URL`.

Si configurás el sitio a mano, los valores son **Base directory** `frontend`, **Build command** `npm run build`, **Publish directory** `dist` y `NODE_VERSION=22`.

El archivo `frontend/public/_redirects` repite la regla `/* /index.html 200` como respaldo; `netlify.toml` ya la incluye.

### 4. Después de desplegar

1. Abrir `https://ecocampus-api-dyis.onrender.com/api/courses` y confirmar que devuelve JSON.
2. Abrir el sitio de Netlify y comprobar que el catálogo carga.
3. Registrarse y revisar el correo en Mailtrap.
4. Ingresar con la cuenta de administrador y recorrer las pestañas.
5. Si hay errores de CORS, revisar que `ALLOWED_ORIGINS` tenga el dominio exacto de Netlify, sin barra final.

## Uso local como respaldo

La demo no depende de que Render esté despierto: alcanza con levantar backend y frontend en local y usar la base de MongoDB de la computadora.

1. Arrancar MongoDB.
2. `cd backend && npm run dev`.
3. `cd frontend && npm run dev`.
4. Abrir `http://localhost:5173`.

Para presentar sin sorpresas conviene tener las dos variantes probadas: la de Netlify con Render y la local.

## Limitaciones conocidas

- Las fotos de las evidencias se guardan en el disco del servidor. En Render, ese disco es temporal.
- La cola de correos vive en memoria: si el backend se reinicia, los envíos pendientes se pierden. Mailtrap además limita la frecuencia, por eso la espera de 10,5 segundos entre correos.
- La vista previa al compartir en redes muestra los metadatos generales, no los de cada curso. Para eso haría falta prerenderizado o renderizado en el servidor.
- El `sitemap.xml` queda pendiente hasta tener un dominio definitivo.
- Las compras son simuladas: no se procesa dinero real.
