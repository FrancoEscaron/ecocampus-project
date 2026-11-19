# EcoCampus — Frontend React

Interfaz de EcoCampus migrada de HTML, CSS y JavaScript a React + Vite.

## Requisitos

- Node.js 20.19 o superior.
- El backend de EcoCampus corriendo (por defecto en `http://localhost:3000`).
- MongoDB local con la base de datos configurada en el backend.

## Instalación

```bash
npm install
```

## Configuración

Creá un archivo `.env` a partir de `.env.example`:

```bash
cp .env.example .env
```

La variable `VITE_API_URL` indica la URL del backend. Por defecto:

```env
VITE_API_URL=http://localhost:3000
```

La variable opcional `VITE_SITE_URL` define el dominio público que se usa en el canonical y en las etiquetas Open Graph. Si no está definida, se usa el origen del navegador.

## Desarrollo

```bash
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`.

## Build de producción

```bash
npm run build
npm run preview
```

`npm run build` genera la carpeta `dist/`. `npm run preview` sirve ese build en `http://localhost:4173`.

En desarrollo local el backend acepta orígenes `localhost` de cualquier puerto. Para producción, agregá el dominio real del frontend a `ALLOWED_ORIGINS` en el `.env` del backend.

## Scripts

- `npm run dev`: servidor de desarrollo con recarga automática.
- `npm run build`: compila la aplicación para producción.
- `npm run preview`: sirve el build compilado.
- `npm run lint`: revisa el código con Oxlint.

## Estructura

- `src/api.js`: todas las llamadas HTTP a la API.
- `src/pages/`: páginas de la aplicación.
- `src/components/`: componentes reutilizables, un archivo por componente.
- `src/hooks/`: hooks compartidos (`useForm`, `useCarga`, `useFocusTrap`, `useSeo`).
- `src/utils/`: formato, sesión, validaciones y helpers de dominio.
- `public/assets/`: imágenes, iconos y favicons con las mismas rutas que usa el backend.
