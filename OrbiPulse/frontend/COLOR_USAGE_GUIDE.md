# OrbiPulse Color System Usage Guide

## 🎨 How to Use COLORS

### Basic Usage

```typescript
import { COLORS } from '../constants/theme';

// In your component styles
const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
  },
  text: {
    color: COLORS.text,
  },
  button: {
    backgroundColor: COLORS.primary,
  },
});
```

### Inline Styles

```typescript
<View style={{ backgroundColor: COLORS.card }}>
  <Text style={{ color: COLORS.primary }}>Hello</Text>
</View>
```

### Dynamic Colors

```typescript
<View style={[
  styles.badge, 
  { 
    borderColor: statusColor, 
    backgroundColor: statusColor + '22' // 20% opacity
  }
]}>
```

### Transparency Variants

```typescript
// Use predefined transparency colors
backgroundColor: COLORS.primaryTransparent

// Or create custom opacity
backgroundColor: COLORS.primary + '80' // ~50% opacity
```

## 📋 Color Reference

### Primary Colors (Brand)
```typescript
COLORS.primary      // #4FB7B4 - Main teal for primary actions
COLORS.secondary    // #3F9EA3 - Teal-blue for secondary elements
COLORS.accent       // #6ED0C7 - Light teal for accents
```

### Neutral Colors
```typescript
COLORS.dark         // #4F6A7A - Dark blue-gray for secondary text
COLORS.text         // #2F3E46 - Primary text color
COLORS.white        // #FFFFFF - White
COLORS.black        // #000000 - Black
```

### Backgrounds
```typescript
COLORS.background   // #F4F6F7 - App background
COLORS.card         // #FFFFFF - Card/surface background
```

### Status Colors
```typescript
COLORS.success      // #3CB371 - Success states, open valves
COLORS.warning      // #F4A261 - Warning states, partial valves
COLORS.danger       // #E63946 - Error states, faults
```

### Valve Status Colors
```typescript
COLORS.valveOpen      // #4FB7B4 - Open valve indicator
COLORS.valveClosed    // #4F6A7A - Closed valve indicator
COLORS.valvePartial   // #F4A261 - Partial valve indicator
COLORS.valveFault     // #E63946 - Fault valve indicator
COLORS.valveOffline   // #9CA3AF - Offline valve indicator
```

### Transparency Variants
```typescript
COLORS.primaryTransparent    // rgba(79, 183, 180, 0.1)
COLORS.secondaryTransparent  // rgba(63, 158, 163, 0.1)
COLORS.successTransparent    // rgba(60, 179, 113, 0.1)
COLORS.warningTransparent    // rgba(244, 162, 97, 0.1)
COLORS.dangerTransparent     // rgba(230, 57, 70, 0.1)
```

## 🎯 Common Patterns

### 1. Card with Shadow
```typescript
card: {
  backgroundColor: COLORS.card,
  borderRadius: 12,
  shadowColor: COLORS.black,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
}
```

### 2. Status Badge
```typescript
badge: {
  backgroundColor: COLORS.successTransparent,
  borderColor: COLORS.success,
  borderWidth: 1,
}
```

### 3. Primary Button
```typescript
button: {
  backgroundColor: COLORS.primary,
  borderRadius: 8,
  paddingVertical: 12,
}
buttonText: {
  color: COLORS.white,
  fontWeight: '700',
}
```

### 4. Secondary Button (Outline)
```typescript
button: {
  backgroundColor: COLORS.card,
  borderColor: COLORS.primary,
  borderWidth: 2,
  borderRadius: 8,
  paddingVertical: 12,
}
buttonText: {
  color: COLORS.primary,
  fontWeight: '700',
}
```

### 5. Input Field
```typescript
input: {
  backgroundColor: COLORS.card,
  borderColor: COLORS.secondary,
  borderWidth: 1,
  borderRadius: 8,
  paddingHorizontal: 12,
  color: COLORS.text,
}
```

### 6. Section Header
```typescript
sectionLabel: {
  fontSize: 12,
  fontWeight: '700',
  color: COLORS.dark,
  letterSpacing: 1,
  marginBottom: 8,
}
```

## ⚠️ DO's and DON'Ts

### ✅ DO:
```typescript
// Use COLORS for all colors
backgroundColor: COLORS.background
color: COLORS.text

// Import from theme
import { COLORS } from '../constants/theme';

// Use semantic names
backgroundColor: COLORS.danger  // Clear meaning
```

### ❌ DON'T:
```typescript
// Don't use hardcoded colors
backgroundColor: '#F4F6F7'  // BAD!

// Don't import from colors.ts directly in components
import { COLORS } from '../constants/colors';  // Use theme.ts instead

// Don't use vague color names
backgroundColor: '#4FB7B4'  // What does this mean?
```

## 🔧 Changing the Theme

To update the entire app's color scheme:

1. Open `constants/colors.ts`
2. Update the color values
3. All components automatically reflect the changes

Example - Changing primary brand color:
```typescript
export const COLORS = {
  primary: "#NEW_COLOR",  // Change this ONE line
  // ... rest stays the same
};
```

## 🎨 Component Examples

### Metric Card
```typescript
<MetricCard
  label="Temperature"
  value={temp}
  color={COLORS.primary}
  warning={isWarning}  // Uses COLORS.danger when true
/>
```

### Status Badge
```typescript
// Automatically uses correct colors based on status
<StatusBadge status="open" />    // COLORS.valveOpen
<StatusBadge status="fault" />   // COLORS.valveFault
```

### Valve Gauge
```typescript
// Automatically colored based on status
<ValveGauge position={75} status="open" />
```

### Sparkline Chart
```typescript
// Default color is COLORS.primary
<Sparkline data={data} />

// Custom color
<Sparkline data={data} color={COLORS.accent} />
```

## 📱 Screen-Specific Guidelines

### Map Screen (index.tsx)
- Logo: `COLORS.primary`
- Stats pills: `COLORS.card` with `COLORS.secondary` border
- Filter chips: Active state uses status color
- Gateway icons: `COLORS.primaryTransparent` background

### Control Screen (control.tsx)
- Sliders: `COLORS.primary` for active track
- Buttons: `COLORS.primary` background
- Status indicators: `COLORS.primary` for pending
- Error states: `COLORS.danger`

### Scheduler Screen (scheduler.tsx)
- Summary stats: Use `COLORS.primary`, `COLORS.secondary`, `COLORS.warning`
- Active schedules: Highlighted with `COLORS.primary`
- Form inputs: `COLORS.dark` placeholder text

### Telemetry Screen (telemetry.tsx)
- Metric cards: `COLORS.card` background
- Charts: `COLORS.primary` by default
- Warnings: `COLORS.warning` or `COLORS.danger`

### Valve Detail Screen ([id].tsx)
- Follow same patterns as other screens
- Use consistent card styling
- Status badge uses valve status colors

## 🚀 Quick Start for New Components

When creating a new component:

1. Import COLORS:
```typescript
import { Colors, COLORS } from '../../constants/theme';
```

2. Use semantic color names:
```typescript
backgroundColor: COLORS.card
color: COLORS.text
borderColor: COLORS.secondary
```

3. Add shadows for elevation:
```typescript
shadowColor: COLORS.black
shadowOffset: { width: 0, height: 2 }
shadowOpacity: 0.1
elevation: 3
```

4. Use transparency variants for overlays:
```typescript
backgroundColor: COLORS.primaryTransparent
```

---

**Happy coding with the new color system!** 🎨✨

All colors are now centralized, making your codebase cleaner, more maintainable, and easier to theme.
