import {
  createThemes,
  DEFAULT_PALETTE,
  DEFAULT_SUBDUED_PALETTE,
} from '@bsky.app/alf'

/**
 * Solid companions for links, focus rings, and controls that cannot use a
 * gradient. Keep the middle tones dark enough for text on light backgrounds.
 */
const primaryPalette = {
  primary_25: '#FAF6F1',
  primary_50: '#FFF0E9',
  primary_100: '#FFDFD1',
  primary_200: '#FFB199',
  primary_300: '#F39B7F',
  primary_400: '#DC7959',
  primary_500: '#A3472C',
  primary_600: '#8C3D26',
  primary_700: '#75331F',
  primary_800: '#5E291B',
  primary_900: '#472218',
  primary_950: '#361D16',
  primary_975: '#291812',
}

const DEFAULT_THEMES = createThemes({
  defaultPalette: {...DEFAULT_PALETTE, ...primaryPalette},
  subduedPalette: {...DEFAULT_SUBDUED_PALETTE, ...primaryPalette},
})

export const themes = {
  lightPalette: DEFAULT_THEMES.light.palette,
  darkPalette: DEFAULT_THEMES.dark.palette,
  dimPalette: DEFAULT_THEMES.dim.palette,
  light: DEFAULT_THEMES.light,
  dark: DEFAULT_THEMES.dark,
  dim: DEFAULT_THEMES.dim,
}

/**
 * @deprecated use ALF and access palette from `useTheme()`
 */
export const lightPalette = DEFAULT_THEMES.light.palette
/**
 * @deprecated use ALF and access palette from `useTheme()`
 */
export const darkPalette = DEFAULT_THEMES.dark.palette
/**
 * @deprecated use ALF and access palette from `useTheme()`
 */
export const dimPalette = DEFAULT_THEMES.dim.palette
/**
 * @deprecated use ALF and access theme from `useTheme()`
 */
export const light = DEFAULT_THEMES.light
/**
 * @deprecated use ALF and access theme from `useTheme()`
 */
export const dark = DEFAULT_THEMES.dark
/**
 * @deprecated use ALF and access theme from `useTheme()`
 */
export const dim = DEFAULT_THEMES.dim
