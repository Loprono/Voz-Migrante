# Voz Migrante

Asistente de comunicación para latinos en EE.UU.

## Features
- **Explicar documentos** — Sube foto de una carta/factura, recibe resumen en español simple + pasos a seguir
- **Traducción en vivo** — Habla español, la app traduce a inglés. La otra persona habla inglés, la app traduce a español. Con voz en ambos lados.

## Setup

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
Copia `.env.example` a `.env` y llena los valores:
```
EXPO_PUBLIC_ANTHROPIC_API_KEY=sk-ant-...
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 3. Supabase — crear tabla `history`
En el SQL Editor de Supabase:
```sql
create table history (
  id uuid default gen_random_uuid() primary key,
  type text not null check (type in ('document', 'translation')),
  title text not null,
  category text not null check (category in ('doctor', 'banco', 'escuela', 'legal', 'otro')),
  content text not null,
  created_at timestamptz default now()
);

alter table history enable row level security;
create policy "public access" on history for all using (true);
```

### 4. Correr la app
```bash
npx expo start
```
Escanea el QR con la app **Expo Go** en tu teléfono.

---

## Arquitectura

```
app/
  (tabs)/
    index.tsx          ← Pantalla principal
    history.tsx        ← Historial guardado
  explain/
    index.tsx          ← Captura de documento
    result.tsx         ← Resultado del análisis
  translate/
    index.tsx          ← Traductor en vivo
  _layout.tsx          ← Navegación raíz

components/
  DisclaimerBanner.tsx ← Aviso legal/médico
  MicButton.tsx        ← Botón animado de micrófono
  PrimaryButton.tsx    ← Botón reutilizable
  QuickPhrases.tsx     ← Frases rápidas (Doctor/Banco/Escuela)
  TermChip.tsx         ← Chip de término con explicación en modal

lib/
  anthropic.ts         ← Claude API (análisis de docs + traducción)
  supabase.ts          ← Guardar/cargar historial

constants/
  Colors.ts            ← Paleta de colores del sistema de diseño
```

## Notas importantes

### STT (Speech-to-Text)
La app usa `expo-av` para grabar el audio. Para producción, conecta el audio a:
- **OpenAI Whisper** (mejor soporte de acentos latinos)
- **Google Cloud Speech-to-Text**

El archivo `app/translate/index.tsx` tiene un `mockTranscribe()` como placeholder — reemplázalo con tu llamada real al API de STT.

### Claude API
- Análisis de documentos: `claude-sonnet-4-6` con visión (imagen en base64)
- Traducción: `claude-sonnet-4-6` con prompt de intérprete

### Permisos
- **Cámara**: para fotografiar documentos
- **Micrófono**: para la traducción en vivo
- **Galería**: para subir documentos desde el teléfono
