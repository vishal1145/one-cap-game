
const tintColorLight = '#000000';
const tintColorDark = '#FFA500'; // Orange

export const Colors = {
  light: {
    text: '#000000',
    background: '#FFFFFF',
    tint: tintColorLight,
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorLight,
    primary: '#000000',
    secondary: '#F2F2F7',
    accent: '#FFA500', // Orange
    danger: '#FF3B30',
    success: '#34C759',
    card: '#FFFFFF',
    border: '#000000', // High contrast border
    surface: '#F5F5F5',
  },
  dark: {
    text: '#FFFFFF',
    background: '#000000',
    tint: tintColorDark,
    tabIconDefault: '#555555',
    tabIconSelected: tintColorDark,
    primary: '#FFA500', // Orange
    secondary: '#1C1C1E',
    accent: '#FFA500',
    danger: '#FF453A',
    success: '#30D158',
    card: '#121212',
    border: '#333333', // Subtle but visible
    surface: '#1A1A1A',
  },
} as const;

export default Colors;
