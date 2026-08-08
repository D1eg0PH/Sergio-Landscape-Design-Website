# Sergio Landscape Design

Sitio web profesional desarrollado para **Sergio Landscape Design LLC**, empresa especializada en servicios de jardinería y diseño paisajístico.

El proyecto tiene como objetivo fortalecer la presencia digital del negocio, presentar sus servicios y experiencia profesional, mostrar trabajos realizados y facilitar que clientes potenciales puedan solicitar una consulta.

## Objetivo

Crear una presencia web moderna y profesional que permita a **Sergio Landscape Design**:

* Presentar sus servicios de landscaping.
* Mostrar proyectos y trabajos realizados.
* Comunicar la experiencia, misión y visión de la empresa.
* Generar confianza en nuevos clientes.
* Facilitar el contacto y la solicitud de consultas.
* Atender tanto a clientes de habla inglesa como hispana.

## Características

### Landing Page

La página principal presenta una sección Hero con una llamada a la acción para **agendar una consulta**, acompañada de imágenes representativas del trabajo de la empresa.

### Información de la empresa

Incluye secciones dedicadas a:

* Visión.
* Misión.
* Servicios.
* Experiencia profesional.
* Valores diferenciales.

La empresa comunica más de **15 años de experiencia** en el sector.

### Galería de proyectos

El sitio incorpora una galería visual de trabajos de landscaping.

Las imágenes pueden seleccionarse para abrir una vista ampliada mediante un modal, permitiendo apreciar los proyectos con mayor detalle.

### Diseño responsive

La interfaz está diseñada para adaptarse a diferentes tamaños de pantalla:

* Desktop.
* Laptop.
* Tablet.
* Dispositivos móviles.

### Soporte bilingüe

El sitio cuenta con contenido en:

* Inglés.
* Español.

El sistema permite cambiar el idioma de la interfaz para ofrecer una experiencia más accesible a diferentes clientes.

### Autenticación

El proyecto utiliza **Clerk** para gestionar funcionalidades relacionadas con autenticación y usuarios.

### Analítica

Se integra **Vercel Analytics** para obtener información sobre el uso y comportamiento general del sitio.

### Diseño y animaciones

La interfaz utiliza animaciones y elementos interactivos para mejorar la experiencia visual, utilizando tecnologías como **Framer Motion** y componentes de iconos mediante **Lucide React**.

## Tecnologías

### Frontend

* **Next.js 16**
* **React 19**
* **TypeScript**
* **Tailwind CSS 4**

### Backend y servicios

* **Clerk** — autenticación y gestión de usuarios.
* **Neon Database** — base de datos PostgreSQL serverless.
* **Drizzle ORM** — acceso y gestión de datos.
* **Vercel Blob** — almacenamiento de archivos.
* **Resend** — envío de correos electrónicos.

### Herramientas adicionales

* Vercel Analytics
* Framer Motion
* Lucide React
* date-fns
* React Day Picker
* ESLint

## Arquitectura

El proyecto utiliza **Next.js con App Router**, separando la aplicación en páginas, componentes reutilizables, contexto y servicios externos.

```text
Sergio-Landscape-Design-Website/
│
└── clerk-nextjs/
    │
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   └── ...
    │
    ├── components/
    │   ├── Navbar
    │   ├── Footer
    │   ├── Fireworks
    │   ├── IndependenceBanner
    │   └── ...
    │
    ├── context/
    │   └── LanguageContext
    │
    ├── public/
    │   └── imágenes y recursos
    │
    ├── package.json
    └── ...
```

## Instalación

### Requisitos

* Node.js
* npm
* Una cuenta/configuración de Clerk
* Una base de datos compatible con Neon
* Las credenciales de los servicios externos utilizados por la aplicación

### Clonar el repositorio

```bash
git clone https://github.com/D1eg0PH/Sergio-Landscape-Design-Website.git
```

Entrar al proyecto:

```bash
cd Sergio-Landscape-Design-Website/clerk-nextjs
```

Instalar dependencias:

```bash
npm install
```

### Variables de entorno

Crear un archivo `.env.local` dentro de `clerk-nextjs`.

Las variables necesarias dependen de los servicios habilitados en la aplicación, por ejemplo:

```env
DATABASE_URL=

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

BLOB_READ_WRITE_TOKEN=

RESEND_API_KEY=
```

> **Importante:** nunca subir `.env.local` ni credenciales reales al repositorio.

## Ejecución en desarrollo

Iniciar el servidor de desarrollo:

```bash
npm run dev
```

Después abrir:

```text
http://localhost:3000
```

## Scripts

| Comando         | Descripción                        |
| --------------- | ---------------------------------- |
| `npm run dev`   | Inicia el servidor de desarrollo   |
| `npm run build` | Genera la versión de producción    |
| `npm run start` | Inicia la aplicación en producción |
| `npm run lint`  | Ejecuta ESLint                     |

## Producción

El proyecto está preparado para ser desplegado como una aplicación Next.js y utilizar servicios externos para autenticación, base de datos, almacenamiento y correo electrónico.

Las variables de entorno deben configurarse directamente en el entorno de producción y no almacenarse en el repositorio.

## Diseño

La identidad visual del sitio está orientada al sector de landscaping, utilizando una estética basada en:

* Tonos verdes.
* Fotografías de trabajos reales.
* Tipografía Montserrat.
* Secciones amplias y visuales.
* Diseño responsive.
* Llamadas a la acción claramente identificadas.

## Autor

**Diego Armando Pérez Huerta**

Desarrollador del sitio web para **Sergio Landscape Design LLC**.

## Licencia

Este proyecto fue desarrollado como trabajo freelance para Sergio Landscape Design LLC. 
El código se comparte aquí con fines de portafolio profesional. El diseño, marca y 
contenido pertenecen a Sergio Landscape Design LLC — este repositorio no debe usarse 
como plantilla comercial sin autorización.
