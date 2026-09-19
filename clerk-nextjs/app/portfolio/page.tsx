'use client';

import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import { useLanguage } from '@/context/LanguajeContext';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Images,
  Maximize2,
} from 'lucide-react';

/* =========================================================
   TAGS (etiquetas)
   Solo se muestran en el filtro las etiquetas que tienen
   al menos un proyecto, así nunca aparece un filtro vacío.
   ========================================================= */

type Tag =
  | 'front-yards'
  | 'backyards'
  | 'gardens'
  | 'pavers'
  | 'lawn'
  | 'pool-areas'
  | 'rock'
  | 'mulch'
  | 'palms';

type Filter = 'all' | Tag;

// Orden en el que aparecen en la barra de filtros
const TAG_ORDER: Tag[] = [
  'front-yards',
  'backyards',
  'gardens',
  'pavers',
  'lawn',
  'pool-areas',
  'rock',
  'mulch',
  'palms',
];

const TAG_LABELS: Record<Tag, { en: string; es: string }> = {
  'front-yards': { en: 'Front Yards', es: 'Jardines Frontales' },
  backyards: { en: 'Backyards', es: 'Patios Traseros' },
  gardens: { en: 'Gardens', es: 'Jardines' },
  pavers: { en: 'Pavers & Hardscape', es: 'Pavers y Hardscape' },
  lawn: { en: 'Lawn & Turf', es: 'Césped' },
  'pool-areas': { en: 'Pool Areas', es: 'Áreas de Piscina' },
  rock: { en: 'Decorative Rock', es: 'Piedra Decorativa' },
  mulch: { en: 'Mulch', es: 'Mulch' },
  palms: { en: 'Palms', es: 'Palmeras' },
};

/* =========================================================
   PROJECTS (grupos de fotos)
   - Ya no hay títulos: cada grupo se identifica solo por etiquetas.
   - images[0] es la portada del grupo.
   - tags: las 3 primeras se ven en la tarjeta, todas en el visor.
   - focus: punto de enfoque de la portada (object-position),
     útil cuando la portada es una foto vertical.
   ========================================================= */

type Project = {
  id: string;
  images: string[];
  tags: Tag[];
  focus?: string;
};

const wa = (id: string) =>
  `/portfolio/WhatsApp Image 2026-09-13 at ${id}.jpeg`;
const img = (file: string) => `/portfolio/${file}`;

const projects: Project[] = [
  {
    // Casa blanca moderna, entrada de pavers, cipreses italianos
    id: 'modern-white-paver-drive',
    images: [
      img('trabajo30.jpg'),
      img('trabajo29.jpg'),
      img('trabajo32.jpg'),
      img('trabajo31.jpg'),
    ],
    tags: ['front-yards', 'pavers', 'rock', 'gardens'],
  },
  {
    // Casa con torre de piedra y camas de flores (4 tomas casi iguales)
    id: 'stone-entry-flower-beds',
    images: [
      wa('4.55.21 PM (1)'),
      wa('4.55.21 PM (2)'),
      wa('4.55.21 PM (3)'),
      wa('4.55.21 PM'),
    ],
    tags: ['front-yards', 'gardens', 'lawn', 'palms'],
  },
  {
    // Camas curvas de piedra blanca con arbustos podados
    id: 'white-gravel-beds',
    images: [
      img('trabajo27.jpeg'),
      img('trabajo25.jpeg'),
      img('trabajo28.jpeg'),
      img('30.jpeg'),
    ],
    tags: ['front-yards', 'rock', 'gardens', 'lawn', 'palms'],
  },
  {
    // Entradas de pavers (varias casas)
    id: 'paver-driveways',
    images: [
      img('trabajo2.jpeg'),
      img('trabajo3.jpeg'),
      img('trabajo22.jpeg'),
      img('IMG_5260.jpeg'), // ⚠ inclinada
    ],
    tags: ['front-yards', 'pavers', 'lawn'],
  },
  {
    // Paisajismo alrededor de jaula de piscina
    id: 'pool-cage-landscape',
    images: [
      img('trabajo21.jpeg'),
      img('trabajo20.jpeg'),
      img('trabajo16.jpg'),
      wa('5.00.45 PM3'),
      wa('5.00.45 PM7'), // ⚠ inclinada
    ],
    tags: ['pool-areas', 'backyards', 'gardens', 'mulch', 'palms', 'pavers'],
  },
  {
    // Patio trasero con cerca blanca de vinil
    id: 'backyard-white-fence',
    images: [
      wa('5.00.45 PM (1)'),
      wa('5.00.45 PM4'),
      img('trabajo18.jpg'),
      img('trabajo19.jpeg'),
    ],
    tags: ['backyards', 'gardens', 'lawn', 'palms', 'pavers', 'rock', 'mulch'],
  },
  {
    // Entrada de pavers gris claro, casa blanca
    id: 'light-gray-pavers',
    images: [wa('5.00.45 PM6'), wa('5.00.45 PM5'), wa('5.00.48 PM27')],
    tags: ['front-yards', 'pavers', 'lawn'],
  },
  {
    // Islas de piedra gris con árbol / arbusto central
    id: 'gravel-islands',
    images: [img('trabajo11.jpeg'), img('trabajo9.jpeg'), img('trabajo8.jpeg')],
    tags: ['front-yards', 'lawn', 'rock'],
  },
  {
    // Césped frontal, casas grises
    id: 'front-lawns',
    images: [
      img('trabajo7.jpeg'),
      wa('5.00.48 PM20'),
      img('trabajo26.jpeg'),
      img('jardines.jpeg'),
    ],
    tags: ['front-yards', 'lawn', 'palms', 'gardens'],
  },
  {
    // Casa con torre de piedra y cochera de 3 autos
    id: 'stone-tower-3car',
    images: [img('trabajo14.jpg'), img('trabajo15.jpg')],
    tags: ['front-yards', 'pavers', 'lawn', 'palms'],
  },
  {
    // Entrada de pavers color arena, cochera oscura
    id: 'tan-paver-driveway',
    images: [wa('5.00.41 PM'), wa('5.00.45 PM')],
    tags: ['front-yards', 'pavers', 'lawn', 'palms'],
    focus: 'center 40%',
  },
  {
    // Torre de piedra, piedra blanca y crotons
    id: 'tower-entry-crotons',
    images: [wa('5.00.48 PM22'), wa('5.00.48 PM23'), wa('5.00.48 PM29')],
    tags: ['front-yards', 'rock', 'gardens', 'palms'],
    focus: 'center 65%',
  },
  {
    // Porche con columnas y cama de piedra blanca (atardecer)
    id: 'porch-white-gravel',
    images: [wa('5.00.48 PM28'), wa('5.00.48 PM24'), wa('5.00.48 PM25')],
    tags: ['front-yards', 'rock', 'lawn'],
    focus: 'center 60%',
  },
  {
    // Sendero de pavers con piedra blanca y crotons
    id: 'paver-walk-white-gravel',
    images: [
      wa('5.00.46 PM10'),
      wa('5.00.46 PM11'),
      wa('5.00.47 PM15'),
      wa('5.00.47 PM14'), // ⚠ inclinada
    ],
    tags: ['front-yards', 'pavers', 'rock', 'gardens'],
  },
  {
    // Islas con palmas sobre piedra gris
    id: 'gray-gravel-palm-islands',
    images: [
      wa('5.00.47 PM17'),
      wa('5.00.47 PM16'),
      wa('5.00.48 PM21'),
      wa('5.00.47 PM18'),
      wa('5.00.48 PM31'),
      wa('5.00.46 PM9'),
    ],
    tags: ['front-yards', 'rock', 'lawn', 'palms'],
  },
  {
    // Casas con piedra en fachada y camas de río
    id: 'stone-entry-river-rock',
    images: [img('trabajo4.jpeg'), wa('5.00.47 PM19')],
    tags: ['front-yards', 'gardens', 'rock', 'pavers', 'lawn'],
  },
  {
    // Porche con camas de piedra volcánica negra
    id: 'black-rock-porch',
    images: [img('trabajo23.jpeg'), img('trabajo24.jpeg')],
    tags: ['front-yards', 'gardens', 'rock', 'palms'],
  },
  {
    // Camas con mulch y plantas ornamentales
    id: 'mulch-planting-beds',
    images: [
      img('trabajo1.jpeg'),
      img('trabajo12.jpeg'),
      wa('5.00.48 PM34'),
      img('trabajo6.jpeg'),
      img('trabajo34.jpg'), // ⚠ inclinada
    ],
    tags: ['gardens', 'mulch', 'front-yards'],
  },
  {
    // Detalles de camas con piedra gris y arbustos
    id: 'gray-gravel-shrub-beds',
    images: [wa('5.00.48 PM32'), img('trabajo13.jpg'), img('trabajo17.jpg')],
    tags: ['gardens', 'rock', 'front-yards', 'pavers'],
  },
  {
    // Vistas amplias desde la calle
    id: 'street-view-lawns',
    images: [
      wa('5.00.46 PM12'),
      wa('5.00.46 PM13'),
      wa('5.00.45 PM8'),
      img('trabajo5.jpeg'),
    ],
    tags: ['front-yards', 'lawn', 'palms', 'pavers'],
  },
];

/* Conteos calculados una sola vez (los datos son estáticos) */

const PROJECT_COUNT = projects.length;
const PHOTO_COUNT = projects.reduce((sum, p) => sum + p.images.length, 0);

const TAG_COUNTS = projects.reduce(
  (acc, p) => {
    p.tags.forEach((tag) => {
      acc[tag] = (acc[tag] ?? 0) + 1;
    });
    return acc;
  },
  {} as Partial<Record<Tag, number>>
);

const AVAILABLE_TAGS = TAG_ORDER.filter((tag) => (TAG_COUNTS[tag] ?? 0) > 0);

/* =========================================================
   TEXTOS
   ========================================================= */

const TEXT = {
  en: {
    eyebrow: 'Our Work',
    title: 'Landscape Projects',
    subtitle:
      'Explore a selection of residential landscaping projects completed by Sergio Landscape Design LLC.',
    all: 'All Projects',
    projects: 'Projects',
    project: 'Project',
    photos: 'Photos',
    photo: 'Photo',
    close: 'Close',
    previousPhoto: 'Previous photo',
    nextPhoto: 'Next photo',
    previousProject: 'Previous project',
    nextProject: 'Next project',
    gallery: 'Project gallery',
    filters: 'Filter projects',
    empty: 'No projects with this tag yet.',
    loading: 'Loading',
  },
  es: {
    eyebrow: 'Nuestro Trabajo',
    title: 'Proyectos de Paisajismo',
    subtitle:
      'Explora una selección de proyectos residenciales realizados por Sergio Landscape Design LLC.',
    all: 'Todos',
    projects: 'Proyectos',
    project: 'Proyecto',
    photos: 'Fotos',
    photo: 'Foto',
    close: 'Cerrar',
    previousPhoto: 'Foto anterior',
    nextPhoto: 'Foto siguiente',
    previousProject: 'Proyecto anterior',
    nextProject: 'Proyecto siguiente',
    gallery: 'Galería del proyecto',
    filters: 'Filtrar proyectos',
    empty: 'Todavía no hay proyectos con esta etiqueta.',
    loading: 'Cargando',
  },
} as const;

/* =========================================================
   COMPONENT
   ========================================================= */

export default function PortfolioPage() {
  const { isLoaded, isSignedIn } = useUser();
  const { lang } = useLanguage();
  const router = useRouter();

  const loc: 'en' | 'es' = lang === 'en' ? 'en' : 'es';
  const text = TEXT[loc];

  /* ---------- state ---------- */

  const [activeFilter, setActiveFilter] = useState<Filter>('all');

  // p = índice del proyecto dentro de filteredProjects, i = índice de la foto
  const [open, setOpen] = useState<{ p: number; i: number } | null>(null);

  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocusRef = useRef<HTMLElement | null>(null);
  const touchStartX = useRef<number | null>(null);

  /* ---------- helpers ---------- */

  const tagLabel = useCallback((tag: Tag) => TAG_LABELS[tag][loc], [loc]);

  // Texto descriptivo (alt / aria-label) armado con las etiquetas, sin título
  const describe = useCallback(
    (project: Project) =>
      project.tags
        .slice(0, 3)
        .map((tag) => TAG_LABELS[tag][loc])
        .join(', '),
    [loc]
  );

  /* ---------- filtered data ---------- */

  const filteredProjects = useMemo(
    () =>
      activeFilter === 'all'
        ? projects
        : projects.filter((project) => project.tags.includes(activeFilter)),
    [activeFilter]
  );

  const filteredPhotoCount = useMemo(
    () => filteredProjects.reduce((sum, p) => sum + p.images.length, 0),
    [filteredProjects]
  );

  const currentProject = open ? filteredProjects[open.p] : undefined;
  const currentSrc =
    open && currentProject ? currentProject.images[open.i] : undefined;

  /* ---------- lightbox navigation ---------- */

  const closeLightbox = useCallback(() => setOpen(null), []);

  // Avanza/retrocede una foto; al llegar al final de un grupo salta al siguiente
  const goPhoto = useCallback(
    (dir: 1 | -1) => {
      setOpen((cur) => {
        if (!cur) return cur;

        const total = filteredProjects.length;
        const project = filteredProjects[cur.p];
        const nextIndex = cur.i + dir;

        if (nextIndex >= 0 && nextIndex < project.images.length) {
          return { p: cur.p, i: nextIndex };
        }

        const nextProject = (cur.p + dir + total) % total;
        const images = filteredProjects[nextProject].images;

        return { p: nextProject, i: dir === 1 ? 0 : images.length - 1 };
      });
    },
    [filteredProjects]
  );

  // Salta directamente al grupo anterior/siguiente
  const goProject = useCallback(
    (dir: 1 | -1) => {
      setOpen((cur) => {
        if (!cur) return cur;
        const total = filteredProjects.length;
        return { p: (cur.p + dir + total) % total, i: 0 };
      });
    },
    [filteredProjects]
  );

  /* ---------- effects ---------- */

  // Autenticación (sin cambios)
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/');
    }
  }, [isLoaded, isSignedIn, router]);

  const isOpen = open !== null;

  // Teclado: ←/→ fotos · ↑/↓ proyectos · Esc cerrar
  useEffect(() => {
    if (!isOpen) return;

    const onKey = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          goPhoto(-1);
          break;
        case 'ArrowRight':
          event.preventDefault();
          goPhoto(1);
          break;
        case 'ArrowUp':
          event.preventDefault();
          goProject(-1);
          break;
        case 'ArrowDown':
          event.preventDefault();
          goProject(1);
          break;
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, closeLightbox, goPhoto, goProject]);

  // Bloquear scroll del body + manejo de foco al abrir/cerrar el visor
  useEffect(() => {
    if (!isOpen) return;

    lastFocusRef.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = '';
      lastFocusRef.current?.focus?.();
    };
  }, [isOpen]);

  /* ---------- loading ---------- */

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div
          role="status"
          aria-label={text.loading}
          className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-emerald-900"
        />
      </div>
    );
  }

  /* ---------- filter chips ---------- */

  const filters: { id: Filter; label: string; count: number }[] = [
    { id: 'all', label: text.all, count: PROJECT_COUNT },
    ...AVAILABLE_TAGS.map((tag) => ({
      id: tag as Filter,
      label: tagLabel(tag),
      count: TAG_COUNTS[tag] ?? 0,
    })),
  ];

  const activeLabel = filters.find((f) => f.id === activeFilter)?.label;

  /* =======================================================
     PAGE
     ======================================================= */

  return (
    <main className="min-h-screen bg-[#f5f7f4] font-sans text-slate-900">
      {/* ===================== HERO ===================== */}
      <section className="relative overflow-hidden bg-emerald-950 px-6 pb-20 pt-32 text-white">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-emerald-700/20 blur-3xl" />
        <div className="absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl text-center">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.35em] text-emerald-300">
            {text.eyebrow}
          </p>

          <h1 className="text-4xl font-black uppercase tracking-tight sm:text-5xl lg:text-6xl">
            {text.title}
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-emerald-50/70 sm:text-base">
            {text.subtitle}
          </p>

          <p className="mt-5 text-xs font-bold uppercase tracking-[0.25em] text-emerald-200/60">
            {PROJECT_COUNT} {text.projects} · {PHOTO_COUNT} {text.photos}
          </p>

          <div className="mx-auto mt-8 h-1 w-20 rounded-full bg-emerald-400" />
        </div>
      </section>

      {/* ================= TAG FILTER ================= */}
      {/* Si tu navbar es fija, define --navbar-h (ej. 64px) en un contenedor padre
          para que esta barra se pegue debajo de ella y no detrás. */}
      <nav
        aria-label={text.filters}
        className="sticky top-[var(--navbar-h,0px)] z-30 border-b border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {filters.map(({ id, label, count }) => {
            const active = activeFilter === id;

            return (
              <button
                key={id}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setActiveFilter(id);
                  setOpen(null);
                }}
                className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all sm:px-5 ${
                  active
                    ? 'bg-emerald-900 text-white shadow-lg shadow-emerald-900/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-900'
                }`}
              >
                {label}
                <span
                  className={`ml-1.5 ${
                    active ? 'text-emerald-300' : 'text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ==================== GRID ==================== */}
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-700">
              {text.projects}
            </p>
            <h2 className="mt-1 text-2xl font-black text-emerald-950 sm:text-3xl">
              {activeLabel}
            </h2>
          </div>

          <span className="shrink-0 rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-500 shadow-sm">
            {filteredProjects.length} {text.projects} · {filteredPhotoCount}{' '}
            {text.photos}
          </span>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="rounded-3xl bg-white p-12 text-center shadow-sm">
            <p className="font-semibold text-slate-500">{text.empty}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project, index) => (
              <button
                key={project.id}
                type="button"
                onClick={() => setOpen({ p: index, i: 0 })}
                aria-label={`${describe(project)} · ${project.images.length} ${text.photos}`}
                className="group relative block aspect-[4/3] w-full overflow-hidden rounded-3xl bg-slate-200 text-left shadow-[0_12px_40px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(15,23,42,0.16)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
              >
                <Image
                  src={project.images[0]}
                  alt={describe(project)}
                  fill
                  priority={index < 3}
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  style={{ objectPosition: project.focus ?? 'center' }}
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* degradado para que las etiquetas se lean siempre */}
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-emerald-950/75 to-transparent"
                />

                {/* cantidad de fotos del grupo */}
                {project.images.length > 1 && (
                  <span className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
                    <Images size={14} aria-hidden />
                    {project.images.length}
                  </span>
                )}

                {/* etiquetas (sin título) */}
                <span className="absolute inset-x-4 bottom-4 flex flex-wrap gap-2 pr-12">
                  {project.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-900 shadow-lg backdrop-blur-sm"
                    >
                      {tagLabel(tag)}
                    </span>
                  ))}
                </span>

                {/* ícono de zoom (solo aparece con hover en escritorio) */}
                <span
                  aria-hidden
                  className="absolute bottom-4 right-4 flex h-9 w-9 translate-y-2 items-center justify-center rounded-full bg-white text-emerald-900 opacity-0 shadow-xl transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
                >
                  <Maximize2 size={16} />
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* =================== LIGHTBOX =================== */}
      {open && currentProject && currentSrc && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={text.gallery}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-3 backdrop-blur-sm sm:p-6"
          onClick={closeLightbox}
        >
          {/* CLOSE */}
          <button
            ref={closeRef}
            type="button"
            onClick={closeLightbox}
            className="absolute right-3 top-3 z-[150] flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-900 shadow-xl transition hover:bg-emerald-100 sm:right-6 sm:top-6"
            aria-label={text.close}
            title={text.close}
          >
            <X size={22} />
          </button>

          <div
            className="relative flex h-full w-full max-w-6xl flex-col items-center gap-3 pb-1 pt-12 sm:gap-4 sm:pt-10"
            onClick={(event) => event.stopPropagation()}
            onTouchStart={(event) => {
              touchStartX.current = event.touches[0].clientX;
            }}
            onTouchEnd={(event) => {
              if (touchStartX.current === null) return;
              const dx = event.changedTouches[0].clientX - touchStartX.current;
              touchStartX.current = null;
              if (Math.abs(dx) > 50) goPhoto(dx < 0 ? 1 : -1);
            }}
          >
            {/* MAIN IMAGE */}
            <div className="relative min-h-0 w-full flex-1">
              <Image
                key={currentSrc}
                src={currentSrc}
                alt={`${describe(currentProject)} — ${open.i + 1}/${currentProject.images.length}`}
                fill
                sizes="100vw"
                quality={85}
                priority
                className="object-contain"
              />

              {filteredPhotoCount > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => goPhoto(-1)}
                    className="absolute left-1 top-1/2 z-[130] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white shadow-xl backdrop-blur-md transition hover:bg-white hover:text-slate-900 sm:left-3"
                    aria-label={text.previousPhoto}
                    title={text.previousPhoto}
                  >
                    <ChevronLeft size={22} />
                  </button>

                  <button
                    type="button"
                    onClick={() => goPhoto(1)}
                    className="absolute right-1 top-1/2 z-[130] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white shadow-xl backdrop-blur-md transition hover:bg-white hover:text-slate-900 sm:right-3"
                    aria-label={text.nextPhoto}
                    title={text.nextPhoto}
                  >
                    <ChevronRight size={22} />
                  </button>
                </>
              )}
            </div>

            {/* THUMBNAILS del grupo */}
            {currentProject.images.length > 1 && (
              <div className="w-full max-w-3xl overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex justify-center gap-2 sm:gap-3">
                  {currentProject.images.map((image, imageIndex) => {
                    const active = imageIndex === open.i;

                    return (
                      <button
                        key={image}
                        type="button"
                        onClick={() => setOpen({ p: open.p, i: imageIndex })}
                        className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all sm:h-16 sm:w-24 ${
                          active
                            ? 'border-emerald-400 ring-2 ring-emerald-400/30'
                            : 'border-white/20 opacity-60 hover:border-white/60 hover:opacity-100'
                        }`}
                        aria-label={`${text.photo} ${imageIndex + 1}`}
                        aria-current={active ? 'true' : undefined}
                      >
                        <Image
                          src={image}
                          alt=""
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* INFO: solo etiquetas + contadores */}
            <div className="flex w-full max-w-3xl items-center justify-between gap-2 rounded-2xl bg-black/65 px-2 py-3 text-white backdrop-blur-md sm:px-4">
              {filteredProjects.length > 1 ? (
                <button
                  type="button"
                  onClick={() => goProject(-1)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/70 transition hover:bg-white/15 hover:text-white"
                  aria-label={text.previousProject}
                  title={text.previousProject}
                >
                  <ChevronsLeft size={20} />
                </button>
              ) : (
                <span className="w-9 shrink-0" />
              )}

              <div className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
                <div className="flex flex-wrap justify-center gap-2">
                  {currentProject.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-emerald-500/20 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-300"
                    >
                      {tagLabel(tag)}
                    </span>
                  ))}
                </div>

                <p className="text-[11px] font-bold uppercase tracking-widest text-white/50">
                  {text.photo} {open.i + 1} / {currentProject.images.length}
                  {'  ·  '}
                  {text.project} {open.p + 1} / {filteredProjects.length}
                </p>
              </div>

              {filteredProjects.length > 1 ? (
                <button
                  type="button"
                  onClick={() => goProject(1)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/70 transition hover:bg-white/15 hover:text-white"
                  aria-label={text.nextProject}
                  title={text.nextProject}
                >
                  <ChevronsRight size={20} />
                </button>
              ) : (
                <span className="w-9 shrink-0" />
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
