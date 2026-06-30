# SuperheroesApp

CRUD de superhéroes desarrollado como challenge técnico frontend. Permite listar, buscar, crear, editar y eliminar superhéroes con persistencia en memoria.

## Stack

| Tecnología | Versión | Rol |
|---|---|---|
| Angular | 21 | Framework principal |
| Angular Material | 21 | Componentes UI |
| TypeScript | 5.9 | Lenguaje |
| Vitest | 4 | Test runner |
| Nginx | alpine | Servidor de producción |
| Docker | — | Contenerización |

## Funcionalidades

- **Lista** — tabla con paginación, búsqueda por nombre (debounce 300ms) y columnas ordenables
- **Crear** — formulario reactivo con validaciones (nombre requerido, año 4 dígitos, poderes)
- **Editar** — mismo formulario precargado con los datos del héroe
- **Detalle** — formulario en modo solo lectura (deshabilitado)
- **Eliminar** — diálogo de confirmación antes de borrar
- **Loading global** — spinner que intercepta todas las operaciones async via `HttpInterceptor`
- **Directiva `uppercase`** — convierte a mayúsculas el nombre mientras se escribe

## Rutas

| Ruta | Vista |
|---|---|
| `/superheroes` | Lista |
| `/superheroes/new` | Crear |
| `/superheroes/edit/:id` | Editar |
| `/superheroes/detail/:id` | Detalle |

## Arquitectura

```
src/app/
├── core/
│   ├── interceptors/   # LoadingInterceptor — activa spinner en cada petición
│   └── services/       # LoadingService — estado del spinner con signal
├── features/
│   └── superheroes/
│       ├── components/
│       │   ├── superheroe-list/          # tabla + búsqueda
│       │   ├── superheroe-form/          # create / edit / detail (mismo componente)
│       │   └── superheroe-delete-dialog/ # diálogo de confirmación
│       └── services/
│           └── superheroes-services.ts   # CRUD en memoria con signals + RxJS
└── shared/
    ├── directives/   # UppercaseInputDirective
    └── models/       # interfaz Superheroe
```

**Organización feature-based.** `core/` para infraestructura cross-cutting, `shared/` para lo reutilizable sin dependencias de negocio, `features/` para el dominio.

**Persistencia en memoria.** El servicio usa `signal<Superheroe[]>` como store y simula latencia de red con `delay(400)` en cada observable, para que la UI (loading spinner, estados de carga) se comporte igual que con un backend real.

**Lazy loading.** Cada ruta carga su componente con `loadComponent(() => import(...))`. El bundle inicial es mínimo (~17 kB en dev).

**Componentes standalone con `ChangeDetectionStrategy.OnPush`** y Signals para estado reactivo granular sin Zone.js.

## Decisiones técnicas

### Vitest (en lugar de Karma/Jasmine)

Angular 21 adoptó Vitest como runner oficial a través del builder `@angular/build:unit-test`. Ventajas respecto a Karma:

- **Zoneless nativo** — los tests corren sin Zone.js, lo que elimina la necesidad de `fakeAsync`/`tick`. El código asíncrono se testea con `async/await` + `lastValueFrom` (RxJS) o `vi.useFakeTimers()` para debounce.
- **Velocidad** — Vitest usa Vite y paraleliza en workers; la suite completa (71 tests) corre en ~10 s.
- **Coverage con v8** — integrado sin configuración extra.

El proyecto tiene umbrales de cobertura al 80% (statements, branches, functions, lines). El build falla si no se alcanzan.

### SSR (Angular Universal)

Incluido con `@angular/ssr`. Las rutas usan `RenderMode.Client` porque los datos son en memoria (no hay API pública que el servidor pueda prefetchear). Esto preserva la compatibilidad con SSR sin pre-renderizar rutas vacías.

El build genera dos bundles: `browser/` (servido por Nginx/CDN) y `server/` (para ejecutar con Node si se quiere SSR real).

### Docker — multi-stage build

```
Stage 1 (builder): node:22-alpine
  npm ci → ng build → dist/superheroes-app/browser/

Stage 2 (runner): nginx:alpine
  Copia solo el browser bundle (sin node_modules, sin fuentes)
  Expone puerto 80
```

El `nginx.conf` incluye:
- **Gzip** para JS/CSS/SVG
- **Cache inmutable** (`1y, immutable`) para assets con hash de contenido (Angular los genera automáticamente)
- **SPA fallback** (`try_files $uri /index.html`) para que el router de Angular funcione con deep links

## Comandos

### Desarrollo

```bash
npm install          # instalar dependencias
ng serve             # dev server en http://localhost:4200 (hot reload)
```

### Tests

```bash
ng test              # ejecuta tests con coverage (modo watch)
ng test --watch=false # una sola pasada (CI / verificación manual)
```

Coverage mínimo requerido: **80%** en statements, branches, functions y lines.

### Build

```bash
ng build             # build de producción (browser + server bundles)
```

Salida en `dist/superheroes-app/`.

### Docker

```bash
# Construir imagen
docker build -t superheroes-app .

# Levantar con docker compose (expone en http://localhost:4200)
docker compose up -d

# Detener
docker compose down
```

El contenedor sirve la app en el puerto 80 internamente, mapeado al 4200 del host.

### Scaffolding Angular CLI

```bash
ng generate component features/superheroes/components/mi-componente
ng generate service core/services/mi-servicio
ng generate directive shared/directives/mi-directiva
```

## Requisitos

- Node.js 22+
- npm 10+
- Docker (solo para contenerización)