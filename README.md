# Vegas Sales — High Rollers Floor

Dashboard de ventas en tiempo real con estética **casino Vegas premium**. Cuando un agente cierra una venta, se dispara una animación de jackpot con foto, monto y MP3 personalizado.

> **Estado actual: Fase 2 — Backend cableado**
>
> Routing real (`/`, `/admin/login`, `/admin`), Supabase Auth, Postgres + RLS, Storage buckets, Edge Function proxy a Google Sheets, hooks de datos en vivo y cola serial de jackpots. Falta el panel de admin (CRUD de agentes, uploaders, WaveSurfer trimmer) — viene en Fase 3.

## Stack

- React 18 + TypeScript + Vite
- React Router v6
- Tailwind CSS
- Framer Motion + CSS animations
- Supabase (Auth + Postgres + Storage + Edge Functions)
- WaveSurfer.js v7 (próxima fase)
- React Hook Form + Zod (próxima fase)
- Lucide React

## 1) Correr en local

```bash
cp .env.example .env       # rellenar con los valores de Supabase
npm install
npm run dev
```

Si no hay Supabase configurado todavía, el dashboard cae a `mockTeams` y el botón "🎰 Test Jackpot" sigue funcionando para iterar la animación.

> **Nota WSL:** si tu `npm` está en `/mnt/c/Program Files/nodejs/` y el repo en el filesystem Linux, npm falla con `UNC paths are not supported`. Solución: instalar Node nativo en Linux (vía nvm o apt), o correr desde PowerShell en Windows.

## 2) Configurar Supabase

1. **Crear proyecto** en [supabase.com](https://supabase.com).
2. **Copiar credenciales** desde *Project Settings → API*:
   - `VITE_SUPABASE_URL` → URL del proyecto.
   - `VITE_SUPABASE_ANON_KEY` → anon/public key.
   Pegar en `.env`.
3. **Correr la migración inicial** (crea tablas, RLS, buckets):
   - Vía Supabase CLI: `supabase db push`
   - O vía Dashboard: *SQL editor* → pegar `supabase/migrations/0001_initial_schema.sql` → Run.
4. **Seed** (3 mesas + tunables):
   - SQL editor → pegar `supabase/seed.sql` → Run.
5. **Crear el usuario admin**:
   - *Authentication → Users → Add user* → email + password → marcar *Auto Confirm*.
   - No hay signup público; sólo este usuario puede entrar a `/admin`.
6. **Desplegar la Edge Function** (con la URL del Apps Script como secret):
   ```bash
   supabase link --project-ref wocdusuclxffrwudwfwb
   supabase secrets set APPS_SCRIPT_URL="https://script.google.com/macros/s/AKfycb.../exec"
   supabase functions deploy google-sheets-proxy --no-verify-jwt
   ```

## 3) Apps Script (Google Sheets)

El proyecto reutiliza el `doGet()` que ya tienes en tu Sheet de la versión Jackpot. Debe devolver:

```json
{
  "teams": [{
    "id": "mesa-1",
    "name": "Mesa 1",
    "goal": 50000,
    "total_real": 12345,
    "agents": [{ "id": "...", "name": "Alexis", "sales": 4500, "teamId": "mesa-1" }]
  }],
  "newSales": [{ "agentName": "Alexis", "entryDate": "...", "value": 1500 }]
}
```

Si tu Sheet aún no está publicado:

1. *Extensiones → Apps Script* en tu Sheet.
2. *Implementar → Nueva implementación → Aplicación web*:
   - *Ejecutar como:* yo
   - *Quién tiene acceso:* **cualquier persona**
3. Copiar la URL `https://script.google.com/macros/s/.../exec` y pegarla en el `supabase secrets set APPS_SCRIPT_URL=...` del paso 6 de arriba.

## 4) Desplegar a producción

Recomendado: **Vercel** (Vite framework preset).

1. Importar el repo en Vercel.
2. Setear las dos env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) en *Project Settings → Environment Variables*.
3. *Deploy*.

La Edge Function vive en Supabase, no en Vercel.

## Estructura

```
src/
├── pages/
│   ├── Index.tsx              # Dashboard público
│   ├── AdminLogin.tsx
│   ├── AdminDashboard.tsx     # Placeholder — Fase 3
│   └── NotFound.tsx
├── components/
│   ├── dashboard/             # CasinoBackground, StartScreen, DashboardView,
│   │                          # TeamCard, AgentRow, JackpotOverlay, NeonText, CasinoChip
│   ├── admin/ProtectedRoute.tsx
│   └── ui/button.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useAgents.ts
│   ├── useAppSettings.ts
│   ├── useGoogleSheetData.ts
│   └── useAudioPlayer.ts
├── lib/                       # supabase.ts, buildTeams.ts, utils.ts, logger.ts
├── types/                     # index.ts (UI), database.ts (rows)
├── config/                    # constants.ts, mockData.ts (fallback)
├── index.css
└── main.tsx

supabase/
├── migrations/0001_initial_schema.sql
├── functions/google-sheets-proxy/index.ts
└── seed.sql
```

## Variables de entorno

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_BRAND_NAME=
VITE_BRAND_LOGO=
```

## Clonar este dashboard para otro proyecto (con nueva identidad visual)

Este repo ya viene preparado para **replicar la misma experiencia** y solo cambiar branding + datos.

### Qué debes cambiar para una nueva marca

1. **Nombre y logo** (sin tocar componentes):
   - `VITE_BRAND_NAME`: nombre comercial del nuevo proyecto.
   - `VITE_BRAND_LOGO`: ruta del logo en `/public` (ej: `/logos/nueva-marca.svg`).
2. **Tagline / monograma base** en `src/config/branding.ts`:
   - `tagline`
   - `monogram` (1–3 letras para fallback SVG).
3. **Assets visuales** en `public/`:
   - logos, imágenes de fondo, favicon.
4. **Datos / backend**:
   - nuevo proyecto Supabase (o schema equivalente),
   - nueva URL de Apps Script (si cambia la hoja),
   - mismas tablas/seed/migraciones de este repo.

### Prompt listo para pedirle a la IA que lo clone

Copia y pega esto, rellenando los placeholders:

```text
Clona este dashboard exactamente igual en estructura, animaciones, flujos y comportamiento.
Quiero el mismo producto base, pero para otra marca.

Reglas:
1) Mantener arquitectura y UX tal cual (rutas, hooks, componentes, lógica de jackpot, admin/login, integración Supabase y proxy de Google Sheets).
2) Cambiar solo identidad visual y textos de marca.
3) No romper contratos de datos ni nombres de campos.
4) Entregar cambios aplicados directamente en el código + README actualizado del nuevo proyecto.

Nueva identidad:
- BRAND_NAME: <NOMBRE_NUEVO>
- BRAND_LOGO_PUBLIC_PATH: </logos/nuevo-logo.svg>
- TAGLINE: <TAGLINE_NUEVO>
- MONOGRAM: <1-3 letras>
- Paleta/estilo visual: <describir estilo>

Backend nuevo:
- VITE_SUPABASE_URL: <URL>
- VITE_SUPABASE_ANON_KEY: <KEY>
- APPS_SCRIPT_URL: <URL_APPS_SCRIPT>

Tareas exactas:
- Configurar branding en variables de entorno y `src/config/branding.ts`.
- Reemplazar assets visuales en `public/`.
- Validar que `/`, `/admin/login` y `/admin` funcionen.
- Validar que la animación jackpot siga disparando igual.
- Dejar instrucciones de setup/deploy en README del nuevo repo.
```

### Checklist de verificación post-clonado

- [ ] El nombre de marca se refleja en login, headers y título del navegador.
- [ ] El logo nuevo carga correctamente (si falla, aparece fallback con monograma).
- [ ] El dashboard público funciona con datos reales (o mock fallback).
- [ ] El flujo de jackpot conserva animación, audio y cola serial.
- [ ] Admin login funciona con Supabase Auth.
- [ ] Build y deploy (`npm run build`) sin errores.
- [ ] README del nuevo repo documenta env vars y pasos de despliegue.

## Próximos pasos (Fase 3 — Admin)

- shadcn/ui completo (dialog, table, tabs, select, alert-dialog).
- `/admin` con tabs **Agentes / Mesas / Configuración**.
- `PhotoUploader` y `AudioUploader` a Supabase Storage.
- `AudioTrimmer` con WaveSurfer.js v7 + plugin Regions para elegir `song_start_seconds`.
- Botón "Probar venta" para disparar jackpot desde el admin.
