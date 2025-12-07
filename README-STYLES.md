# Guía de Estilos - Kraken Elite Fitness

Esta guía documenta los estilos y patrones de diseño utilizados en toda la aplicación para mantener la consistencia visual y de experiencia de usuario.

## 🎨 Esquema de Colores

### Colores Principales
- **Rojo**: `red-500`, `red-600` - Color principal de la marca (CrossFit)
- **Negro**: `black`, `slate-950` - Fondos principales
- **Blanco**: `white`, `zinc-300` - Texto principal y acentos

### Colores de Estado
- **Éxito (Success)**: Verde (`green-500/20`, `green-500/40`, `green-300`)
- **Error**: Rojo (`red-500/20`, `red-500/40`, `red-300`)
- **Advertencia (Warning)**: Amarillo (`yellow-500/20`, `yellow-500/40`, `yellow-300`)
- **Información (Info)**: Azul (`blue-500/20`, `blue-500/40`, `blue-300`)

## 🔤 Tipografía

### Fuente Principal: Orbitron
- **Uso**: Títulos, encabezados, nombres de marca, botones, badges
- **Variable CSS**: `--font-orbitron`
- **Clase Tailwind**: `font-[family-name:var(--font-orbitron)]`
- **Pesos disponibles**: 400 (normal), 700 (bold), 900 (black)

### Fuente Secundaria: Geist Sans
- **Uso**: Texto de cuerpo, párrafos, labels, inputs
- **Variable CSS**: `--font-geist-sans`
- **Aplicación**: Por defecto en `body`, `p`, `span`, `div`, `a`, `li`, `label`, `input`, `textarea`, `select`, `button`

## 🎯 Componentes de UI

### Toasts (Alertas)

Los toasts se muestran en la esquina inferior derecha con animación de entrada.

#### Estilos por Tipo

```tsx
// Success
className="bg-green-500/20 border-green-500/40 text-green-300 backdrop-blur-sm shadow-lg shadow-green-500/30"

// Error
className="bg-red-500/20 border-red-500/40 text-red-300 backdrop-blur-sm shadow-lg shadow-red-500/30"

// Warning
className="bg-yellow-500/20 border-yellow-500/40 text-yellow-300 backdrop-blur-sm shadow-lg shadow-yellow-500/30"

// Info
className="bg-blue-500/20 border-blue-500/40 text-blue-300 backdrop-blur-sm shadow-lg shadow-blue-500/30"
```

#### Características
- Fuente: Orbitron (semibold)
- Duración por defecto: 4000ms
- Animación: `slideIn` (0.3s ease-out)
- Posición: `fixed bottom-4 right-4` (móvil: `bottom-4 left-4 right-4`)
- Z-index: 50

#### Uso
```tsx
const { showToast } = useToast();

showToast("Mensaje de éxito", "success");
showToast("Mensaje de error", "error");
showToast("Mensaje de advertencia", "warning");
showToast("Mensaje informativo", "info");
```

### Modals (Diálogos)

Todos los modals siguen el mismo formato visual consistente.

#### Estructura Base

```tsx
<DialogContent className="border border-red-500/20 bg-gradient-to-br from-black via-slate-950 to-black text-white max-w-md max-h-[90vh] overflow-y-auto">
  <DialogHeader>
    {/* Logo compacto */}
    <Logo variant="compact" className="mb-2" />
    
    {/* Badge de sección con gradiente */}
    <Badge className="bg-gradient-to-r from-red-500/30 via-red-600/25 to-red-500/30 border border-red-500/30 text-white backdrop-blur-sm font-[family-name:var(--font-orbitron)] shadow-lg shadow-red-500/20 w-fit mx-auto">
      Título de Sección
    </Badge>
    
    {/* Título */}
    <DialogTitle className="text-3xl font-bold tracking-tight font-[family-name:var(--font-orbitron)] bg-gradient-to-br from-white via-white to-zinc-300 bg-clip-text text-transparent text-center pt-2">
      Título del Modal
    </DialogTitle>
    
    {/* Descripción */}
    <DialogDescription className="text-sm text-zinc-400 text-center">
      Descripción del modal
    </DialogDescription>
  </DialogHeader>
  
  {/* Contenido del formulario */}
</DialogContent>
```

#### Variantes del Logo
- **`variant="default"`**: Tamaño estándar para páginas principales
- **`variant="footer"`**: Tamaño reducido para footer
- **`variant="compact"`**: Tamaño compacto para modals (recomendado)

#### Características
- Fondo: Gradiente negro (`from-black via-slate-950 to-black`)
- Borde: Rojo semitransparente (`border-red-500/20`)
- Ancho máximo: `max-w-md` (formularios) o `max-w-2xl` (contenido largo)
- Altura máxima: `max-h-[90vh]` con scroll vertical
- Texto: Blanco con gradiente en títulos

### Botones

#### Botón Principal (Acción Primaria)
Usado para acciones principales: Agregar, Guardar, Crear, Confirmar

```tsx
<Button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-red-500/50">
  Texto del Botón
</Button>
```

#### Botón Secundario (Cancelar)
Usado para cancelar acciones o cerrar modals

```tsx
<Button 
  variant="outline"
  className="border-zinc-500/40 bg-zinc-500/10 text-zinc-300 hover:bg-zinc-500/20 hover:border-zinc-500/50 active:scale-[0.98] transition-all duration-200"
>
  Cancelar
</Button>
```

#### Botón de Editar
Usado para acciones de edición

```tsx
<Button 
  variant="outline"
  size="sm"
  className="border-blue-500/40 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 hover:border-blue-500/50 active:scale-[0.98] transition-all duration-200"
>
  <Edit className="size-4" />
  Editar
</Button>
```

#### Botón de Eliminar
Usado para acciones destructivas

```tsx
<Button 
  variant="outline"
  size="sm"
  className="border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:border-red-500/50 active:scale-[0.98] transition-all duration-200"
>
  <Trash2 className="size-4" />
  Eliminar
</Button>
```

#### Características Comunes
- Todos los botones incluyen: `active:scale-[0.98] transition-all duration-200`
- Altura mínima móvil: `min-h-[44px]`
- Altura mínima desktop: `min-h-[40px]` o `sm:min-h-[40px]`
- Fuente: Orbitron (aplicada globalmente en `buttonVariants`)

### Inputs (Campos de Entrada)

#### Input Estándar

```tsx
<Input
  className="min-h-[48px] text-base sm:text-sm border-red-500/20 bg-white/5 text-white placeholder:text-zinc-500 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all"
/>
```

#### Input con Icono

```tsx
<div className="relative">
  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-zinc-400" />
  <Input
    className="min-h-[48px] pl-10 text-base sm:text-sm border-red-500/20 bg-white/5 text-white placeholder:text-zinc-500 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all"
  />
</div>
```

#### Select (Dropdown)

```tsx
<select
  className="w-full min-h-[48px] text-base sm:text-sm border border-red-500/20 bg-black text-white rounded-md px-3 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 [&>option]:bg-black [&>option]:text-white"
>
  <option value="" className="bg-black text-white">Selecciona una opción</option>
</select>
```

**Nota**: Los selects tienen estilos globales aplicados en `globals.css` que:
- Remueven la flecha nativa del navegador (`appearance: none`)
- Agregan una flecha personalizada blanca posicionada a `right 0.75rem` (12px desde el borde derecho) para mejor legibilidad
- Aseguran padding derecho suficiente (`2.5rem`) para la flecha personalizada
- La flecha está más separada del borde derecho para una mejor experiencia visual

#### Textarea

```tsx
<textarea
  className="w-full text-base sm:text-sm border border-red-500/20 bg-white/5 text-white placeholder:text-zinc-500 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 rounded-md px-3 py-2 resize-none"
  rows={8}
/>
```

#### Características
- Altura mínima: `min-h-[48px]` para mejor ergonomía móvil
- Fondo: `bg-white/5` (semitransparente)
- Borde: `border-red-500/20`
- Focus: `focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20`
- Placeholder: `text-zinc-500`

### Labels (Etiquetas)

```tsx
<label className="text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">
  Nombre del Campo *
</label>
```

### Badges

#### Badge Principal

```tsx
<Badge className="bg-red-500/20 border border-red-500/30 text-white backdrop-blur-sm font-[family-name:var(--font-orbitron)] shadow-lg shadow-red-500/20">
  Texto del Badge
</Badge>
```

#### Badge de Estado

```tsx
// Success
<Badge className="bg-green-500/20 border border-green-500/30 text-green-400 font-[family-name:var(--font-orbitron)]">
  Activo
</Badge>

// Error
<Badge className="bg-red-500/20 border border-red-500/30 text-red-400 font-[family-name:var(--font-orbitron)]">
  Error
</Badge>

// Info
<Badge className="bg-blue-500/20 border border-blue-500/30 text-blue-400 font-[family-name:var(--font-orbitron)]">
  Info
</Badge>
```

## 📱 Responsive Design

### Breakpoints
- **Móvil**: Por defecto (< 640px)
- **Tablet**: `sm:` (≥ 640px)
- **Desktop**: `lg:` (≥ 1024px)

### Alturas Mínimas
- **Botones móvil**: `min-h-[44px]` (mejor para touch)
- **Botones desktop**: `sm:min-h-[40px]`
- **Inputs**: `min-h-[48px]` (mejor para touch)

### Tamaños de Texto
- **Móvil**: `text-base` (16px)
- **Desktop**: `sm:text-sm` (14px)
- **Títulos móvil**: `text-2xl` o `text-3xl`
- **Títulos desktop**: `sm:text-3xl` o `lg:text-4xl`

## 🎭 Animaciones y Transiciones

### Transiciones Estándar
```css
transition-all duration-200
transition-all duration-300
```

### Efectos de Hover
- **Botones**: `hover:scale-[1.02]` (solo desktop con `sm:hover:`)
- **Cards**: `sm:hover:shadow-xl sm:hover:border-red-500/30`

### Efectos de Active
- **Botones**: `active:scale-[0.98]` (feedback táctil)

### Animaciones
- **Toasts**: `slideIn` (0.3s ease-out)
- **Modals**: Animaciones de entrada/salida de Radix UI

## 🎨 Gradientes

### Gradiente de Fondo (Modals, Cards)
```css
bg-gradient-to-br from-black via-slate-950 to-black
```

### Gradiente de Texto (Títulos)
```css
bg-gradient-to-br from-white via-white to-zinc-300 bg-clip-text text-transparent
```

### Gradiente de Botón Principal
```css
bg-gradient-to-r from-red-500 to-red-600
hover:from-red-600 hover:to-red-700
```

## 📐 Espaciado

### Padding de Cards
- **Móvil**: `p-4` o `p-5`
- **Tablet**: `sm:p-6` o `sm:p-7`
- **Desktop**: `lg:p-8`

### Gap entre Elementos
- **Formularios**: `space-y-5` o `space-y-6`
- **Grids**: `gap-4` o `gap-6`
- **Flex**: `gap-2`, `gap-3`, `gap-4`

## ✅ Mejores Prácticas

### 1. Consistencia de Colores
- Siempre usar los colores definidos en el esquema
- Mantener la opacidad consistente (`/20`, `/40`, `/50`, etc.)

### 2. Tipografía
- Usar Orbitron para títulos, botones y elementos destacados
- Usar Geist Sans para texto de cuerpo y formularios

### 3. Accesibilidad
- Alturas mínimas de 44px para elementos interactivos en móvil
- Contraste adecuado entre texto y fondo
- Estados de focus visibles

### 4. Responsive
- Diseñar primero para móvil
- Usar breakpoints `sm:`, `lg:` para ajustes desktop
- Probar en diferentes tamaños de pantalla

### 5. Feedback Visual
- Usar toasts para todas las acciones del usuario
- Incluir estados de loading en botones
- Mostrar mensajes de error claros y útiles

### 6. Ergonómica
- Espaciado generoso entre elementos interactivos
- Tamaños de touch target adecuados (mínimo 44x44px)
- Transiciones suaves para mejor UX

## 🔧 Utilidades CSS Personalizadas

### Variables CSS
```css
--font-orbitron: 'Orbitron', sans-serif;
--font-geist-sans: 'Geist Sans', sans-serif;
--kraken-red: oklch(0.577 0.245 27.325);
--kraken-red-dark: oklch(0.488 0.243 22.216);
--kraken-red-light: oklch(0.704 0.191 22.216);
--kraken-red-vibrant: oklch(0.577 0.245 27.325);
--kraken-red-gradient-start: oklch(0.577 0.245 27.325);
--kraken-red-gradient-end: oklch(0.488 0.243 22.216);
```

### Estilos Globales para Selects
```css
/* Custom select arrow positioning - move arrow more to the left */
select {
  appearance: none;
  background-image: url("data:image/svg+xml,..."); /* Flecha blanca personalizada */
  background-repeat: no-repeat;
  background-position: right 0.75rem center; /* 12px desde el borde derecho */
  background-size: 1rem;
}

select:not([class*="pr-"]) {
  padding-right: 2.5rem; /* Espacio suficiente para la flecha */
}
```

### Animaciones
```css
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Componente Logo
El componente `Logo` está disponible en `components/logo.tsx` con las siguientes características:
- **Sin animación hover**: El logo no tiene efectos hover para mantener consistencia visual en todas las áreas (modals, páginas, etc.)
- **Variantes**: `default`, `footer`, `compact`
- **Estilo**: "KRAKEN" en blanco + "ELITE FITNESS" en rojo con fuente Orbitron
- **Uso en modals**: Se recomienda usar `variant="compact"` para modals junto con un badge de sección

## 📚 Referencias

- **Tailwind CSS**: [https://tailwindcss.com](https://tailwindcss.com)
- **Radix UI**: [https://www.radix-ui.com](https://www.radix-ui.com)
- **Lucide Icons**: [https://lucide.dev](https://lucide.dev)
- **Google Fonts - Orbitron**: [https://fonts.google.com/specimen/Orbitron](https://fonts.google.com/specimen/Orbitron)

## 🎨 Componente Logo

El logo de Kraken Elite Fitness es un componente reutilizable disponible en `components/logo.tsx`.

### Características
- **Sin animación hover**: Mantiene consistencia visual sin efectos hover
- **Fuente**: Orbitron para ambos textos
- **Colores**: "KRAKEN" en blanco, "ELITE FITNESS" en rojo (`red-500`)
- **Variantes**: `default`, `footer`, `compact`

### Uso
```tsx
import { Logo } from "@/components/logo";

// Logo estándar
<Logo />

// Logo en footer
<Logo variant="footer" />

// Logo compacto (para modals)
<Logo variant="compact" />

// Logo sin enlace
<Logo showLink={false} />
```

## 📐 Mejoras de UX Recientes

### Posicionamiento de Tags de Información
- Los badges de información (rol, PRO, "Hoy", "Pendiente") aparecen inline con los títulos/nombres para mejor legibilidad
- Ejemplo: En WOD, el badge "Hoy" aparece junto al nombre del WOD en la misma línea
- Ejemplo: En Usuarios, los badges de rol y PRO aparecen junto al nombre del usuario
- Ejemplo: En Usuarios Pendientes, el badge "Pendiente" aparece junto al nombre del usuario

### Ajustes de Espaciado
- Footer más compacto en mobile view (padding y gaps reducidos)
- Enlaces en footer con espaciado reducido para mobile
- Dropdown arrows con mejor posicionamiento (12px desde el borde derecho) en todos los selects
- Flechas personalizadas en todos los dropdowns para consistencia visual

### Manejo de Fechas
- Parsing de fechas en timezone local para evitar desplazamientos de día
- Uso de `new Date(year, month, day, 0, 0, 0, 0)` para crear fechas locales
- Aplicado en WOD management y otros componentes que manejan fechas

---

**Última actualización**: Enero 2025
**Versión**: 1.1.0

