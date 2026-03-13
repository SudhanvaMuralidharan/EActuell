/**
 * Centralized Color Theme for OrbiPulse
 * 
 * Colors extracted from the OrbiPulse logo
 * All UI components should use these constants exclusively
 */

export const COLORS = {
  // Primary brand colors
  primary: "#4FB7B4",      // Main teal - primary actions
  secondary: "#3F9EA3",    // Secondary teal-blue
  accent: "#6ED0C7",       // Light accent teal
  
  // Neutral colors
  dark: "#4F6A7A",         // Dark blue-gray
  text: "#2F3E46",         // Primary text color
  
  // Backgrounds
  background: "#F4F6F7",   // App background
  card: "#FFFFFF",         // Card/surface background
  
  // Status colors
  success: "#3CB371",      // Success/open
  warning: "#F4A261",      // Warning/partial
  danger: "#E63946",       // Error/fault
  
  // Additional utility colors
  white: "#FFFFFF",
  black: "#000000",
  
  // Valve status mappings (using new theme)
  valveOpen: "#4FB7B4",        // primary
  valveClosed: "#4F6A7A",      // dark
  valvePartial: "#F4A261",     // warning
  valveFault: "#E63946",       // danger
  valveOffline: "#9CA3AF",     // medium gray
  
  // Transparency variants
  primaryTransparent: "rgba(79, 183, 180, 0.1)",
  secondaryTransparent: "rgba(63, 158, 163, 0.1)",
  successTransparent: "rgba(60, 179, 113, 0.1)",
  warningTransparent: "rgba(244, 162, 97, 0.1)",
  dangerTransparent: "rgba(230, 57, 70, 0.1)",
};

// Legacy color mapping for backward compatibility during transition
export const LEGACY_COLOR_MAP = {
  '#00E5A0': COLORS.primary,
  '#00805A': COLORS.success,
  '#4A9EFF': COLORS.secondary,
  '#F5A623': COLORS.warning,
  '#FF4D6D': COLORS.danger,
  '#5C6680': COLORS.valveOffline,
  '#E8F0FE': COLORS.text,
  '#7B8EAB': COLORS.dark,
  '#3D5068': COLORS.dark,
  '#FFFFFF': COLORS.white,
  '#050D1A': COLORS.background,
  '#0B1829': COLORS.card,
  '#112138': COLORS.card,
  '#1A2F4A': COLORS.secondary,
  '#254260': COLORS.dark,
};
