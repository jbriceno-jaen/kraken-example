# Guía de Estilos - Kraken Elite Fitness

Esta guía documenta los estilos y patrones de diseño utilizados en toda la aplicación para mantener la consistencia visual y de experiencia de usuario.

## 🎨 Esquema de Colores

### Colores Principales
- **Rojo**: `red-500`, `red-600` - Color principal de la marca (CrossFit) - usado para acentos y bordes
- **Negro**: `black` - Fondo principal de toda la aplicación (diseño minimalista)
- **Blanco**: `white` - Texto principal
- **Zinc**: `zinc-500`, `zinc-600` - Texto secundario y placeholders

### Filosofía de Diseño
- **Minimalista y Profesional**: Fondos negros puros (`bg-black`) sin gradientes
- **Bordes Difuminados**: Bordes negros sutiles (`border-black/50`) que se integran con el fondo
- **Sin Bordes Primarios**: Las Cards principales no tienen bordes visibles para un look más limpio
- **Espaciado Expandido**: Elementos con más padding y spacing para mejor legibilidad

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
<DialogContent className="border border-red-500/50 bg-black text-white max-w-md max-h-[90vh] overflow-y-auto">
  <DialogHeader>
    {/* Logo compacto */}
    <Logo variant="compact" className="mb-2" />
    
    {/* Badge de sección minimalista */}
    <Badge className="bg-black border border-red-500/30 text-red-500/90 backdrop-blur-sm font-[family-name:var(--font-orbitron)] text-xs sm:text-sm px-4 sm:px-5 py-1.5 w-fit mx-auto">
      Título de Sección
    </Badge>
    
    {/* Título minimalista */}
    <DialogTitle className="text-2xl sm:text-3xl font-black tracking-tighter font-[family-name:var(--font-orbitron)] text-white text-center pt-2">
      TÍTULO
      <br />
      <span className="text-red-500">DEL MODAL</span>
    </DialogTitle>
    
    {/* Descripción */}
    <DialogDescription className="text-sm text-zinc-500 text-center font-light">
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
- Fondo: Negro puro (`bg-black`) - diseño minimalista
- Borde: Rojo semitransparente (`border-red-500/50`) - más visible que antes
- Ancho máximo: `max-w-md` (formularios) o `max-w-2xl` (contenido largo)
- Altura máxima: `max-h-[90vh]` con scroll vertical
- Texto: Blanco con partes en rojo para títulos (`font-black tracking-tighter`)

### Botones

#### Botón Principal (Acción Primaria)
Usado para acciones principales: Agregar, Guardar, Crear, Confirmar

```tsx
<Button className="bg-gradient-to-r from-red-500 via-red-600 to-red-500 hover:from-red-600 hover:via-red-700 hover:to-red-600 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-red-500/50">
  Texto del Botón
</Button>
```

#### Botón Secundario (Cancelar)
Usado para cancelar acciones o cerrar modals

```tsx
<Button 
  variant="outline"
  className="border-black/50 bg-black/30 text-white hover:bg-black/50 hover:border-red-500/50 active:scale-[0.98] transition-all duration-200"
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
  className="min-h-[48px] text-base sm:text-sm border-red-500/50 bg-black/30 text-white placeholder:text-zinc-500 focus:border-red-500/70 focus:ring-2 focus:ring-red-500/20 transition-all"
/>
```

#### Input con Icono

```tsx
<div className="relative">
  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-zinc-600" />
  <Input
    className="min-h-[48px] pl-10 text-base sm:text-sm border-red-500/50 bg-black/30 text-white placeholder:text-zinc-500 focus:border-red-500/70 focus:ring-2 focus:ring-red-500/20 transition-all"
  />
</div>
```

#### Select (Dropdown)

```tsx
<select
  className="w-full min-h-[48px] text-base sm:text-sm border border-red-500/50 bg-black text-white rounded-md px-3 focus:border-red-500/70 focus:ring-2 focus:ring-red-500/20 [&>option]:bg-black [&>option]:text-white"
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
  className="w-full text-base sm:text-sm border border-red-500/50 bg-black/30 text-white placeholder:text-zinc-500 focus:border-red-500/70 focus:ring-2 focus:ring-red-500/20 rounded-md px-3 py-2 resize-none"
  rows={8}
/>
```

#### Características
- Altura mínima: `min-h-[48px]` para mejor ergonomía móvil
- Fondo: `bg-black/30` (negro semitransparente para integración con fondo)
- Borde: `border-red-500/50` (más visible, 50% opacidad)
- Focus: `focus:border-red-500/70 focus:ring-2 focus:ring-red-500/20`
- Placeholder: `text-zinc-500`
- Iconos: `text-zinc-600` (más sutiles)

### Labels (Etiquetas)

```tsx
<label className="text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">
  Nombre del Campo *
</label>
```

### Badges

#### Badge Principal

```tsx
<Badge className="bg-black border border-red-500/30 text-red-500/90 backdrop-blur-sm font-[family-name:var(--font-orbitron)] text-xs sm:text-sm px-4 sm:px-5 py-1.5">
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

## 🎨 Gradientes y Fondos

### Fondo Minimalista (Modals, Cards)
```css
bg-black
```
**Nota**: Se eliminaron los gradientes en favor de fondos negros puros para un look más minimalista y profesional.

### Estilo de Títulos
```css
/* Títulos minimalistas con partes en rojo */
font-black tracking-tighter text-white
/* Parte destacada en rojo */
text-red-500
```

### Gradiente de Botón Principal
```css
bg-gradient-to-r from-red-500 via-red-600 to-red-500
hover:from-red-600 hover:via-red-700 hover:to-red-600
```

## 📐 Espaciado

### Padding de Cards
- **Cards Principales**:
  - **Móvil**: `p-4`
  - **Tablet**: `sm:p-6`
  - **Desktop**: `lg:p-8`
  - **XL**: `xl:p-10` (expansión para mejor uso del espacio)
- **Cards Internas**:
  - **Móvil**: `p-5`
  - **Tablet**: `sm:p-6`
  - **Desktop**: `lg:p-7`
- **Sin Bordes Primarios**: Las Cards principales no tienen bordes visibles para un look más limpio

### Gap entre Elementos
- **Formularios**: `space-y-5 sm:space-y-6` (expandido para mejor legibilidad)
- **Grids**: `gap-4 sm:gap-5` o `gap-6 sm:gap-8` (más espacio en desktop)
- **Flex**: `gap-2`, `gap-3`, `gap-4`
- **Secciones**: `mt-8 sm:mt-10` (más espacio vertical entre secciones)

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

## 🏠 Homepage Sections

### Estructura del Homepage
El homepage está organizado siguiendo principios de marketing (AIDA) para maximizar la conversión:

1. **Hero**: Sección principal con mensaje motivacional y badge de metodología
2. **Testimonials**: Testimonios de la comunidad
3. **Physical Changes (Resultados)**: Gráficos interactivos de cambios físicos reales basados en estudios científicos
4. **Workout Highlights**: Destacados de la programación de entrenamientos
5. **Pricing**: Planes de membresía
6. **Location**: Información de ubicación, horarios y contacto

### Navegación del Homepage
El navbar del homepage incluye los siguientes enlaces:
- **Workouts**: Enlace a la sección de destacados de entrenamientos
- **Comunidad**: Enlace a la sección de testimonios
- **Resultados**: Enlace a la sección de cambios físicos reales (nuevo)
- **Pricing**: Enlace a la sección de membresías

### Componente Physical Changes
El componente `PhysicalChanges` (`components/physical-changes.tsx`) muestra:
- 6 gráficos interactivos de progreso (Reducción de grasa, Aumento de masa muscular, Aumento de fuerza máxima, Capacidad cardiovascular, Flexibilidad y movilidad, Resistencia muscular)
- Efectos hover con animaciones
- Iconos únicos por métrica
- Indicador de porcentaje al hacer hover
- Grid responsive
- Cita motivacional relacionada con CrossFit

### Footer
El componente `Footer` (`components/footer.tsx`) incluye:
- Logo y descripción
- Enlaces de navegación (Privacidad, Términos, Contacto)
- Sección "Sobre CrossFit" con enlace a `/que-es-crossfit`
- Iconos de redes sociales (Instagram, Facebook) con efectos hover
- Copyright con branding consistente
- Diseño responsive optimizado para mobile

### Página "Que es CrossFit"
La página `/que-es-crossfit` (`app/que-es-crossfit/page.tsx`) incluye:
- Definición de CrossFit
- Explicación del WOD
- 6 beneficios principales con iconos
- Resultados de estudios científicos
- Sección "¿Es para mí?"
- Fuentes científicas
- Call-to-action
- Diseño minimalista consistente con el resto de la aplicación

## 📐 Mejoras de UX Recientes

### Diseño Minimalista y Profesional
- **Fondos Negros Puros**: Todas las Cards y secciones usan `bg-black` sin gradientes
- **Bordes Difuminados**: Bordes negros sutiles (`border-black/50`) que se integran con el fondo
- **Sin Bordes Primarios**: Las Cards principales no tienen bordes visibles para un look más limpio
- **Expansión de Elementos**: Más padding (`xl:p-10`) y spacing (`mt-8 sm:mt-10`) para mejor uso del espacio
- **Bordes Rojos Más Visibles**: Cards internas con `border-red-500/50` (50% opacidad) para mejor definición

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
- Elementos expandidos con más padding y spacing para mejor legibilidad

### Eliminación de Bordes Blancos
- Todos los bordes blancos (`border-white/10`, `border-white/15`, etc.) fueron reemplazados por `border-black/50`
- Fondos blancos sutiles (`bg-white/5`, `bg-white/10`) cambiados a `bg-black/30` o `bg-black/50`
- Mejor integración visual con el fondo negro de la aplicación

### Manejo de Fechas
- Parsing de fechas en timezone local para evitar desplazamientos de día
- Uso de `new Date(year, month, day, 0, 0, 0, 0)` para crear fechas locales
- Aplicado en WOD management y otros componentes que manejan fechas

---

**Última actualización**: Enero 2025
**Versión**: 2.1.0

### Cambios en Versión 2.1.0
- 📈 Nueva sección "Resultados" en el navbar del homepage
- 📚 Nueva página "Que es CrossFit" con información educativa y fuentes científicas
- 📊 Componente PhysicalChanges con gráficos interactivos de cambios físicos reales
- 🔗 Footer actualizado con sección "Sobre CrossFit" e iconos de redes sociales
- 🎯 Reordenamiento de secciones del homepage basado en principios de marketing (AIDA)
- 🎨 Mejoras en interactividad de sección Location con cards mejoradas

### Cambios en Versión 2.0.0
- ✨ Rediseño completo con estilo minimalista y profesional
- 🖤 Fondos negros puros sin gradientes
- 🎨 Bordes rojos más visibles (50% opacidad)
- 📐 Expansión de elementos con más padding y spacing
- 🔲 Eliminación de bordes primarios en Cards principales
- 🌫️ Bordes blancos difuminados con el fondo negro
- 📱 Mejor responsividad con breakpoints expandidos

