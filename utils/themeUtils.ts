/**
 * Theme Utilities
 * 
 * Extracts colors from platform theme (fluentDesignLanguage)
 * or falls back to custom colors from manifest properties
 */

import { IStageColors } from '../types';

// Default colors (Fluent UI semantic colors)
export const DEFAULT_COLORS_LIGHT: IStageColors = {
  completed: '#107C10',      // colorStatusSuccessBackground3
  completedText: '#FFFFFF',
  active: '#0078D4',         // colorBrandBackground
  activeText: '#FFFFFF',
  inactive: '#E1E1E1',       // colorNeutralBackground3
  inactiveText: '#616161',   // colorNeutralForeground2
  track: '#E1E1E1',
};

export const DEFAULT_COLORS_DARK: IStageColors = {
  completed: '#4EC94E',
  completedText: '#FFFFFF',
  active: '#4BA3E8',
  activeText: '#FFFFFF',
  inactive: '#3E3E3E',
  inactiveText: '#808080',
  track: '#3E3E3E',
};

/**
 * Extract colors from platform fluentDesignLanguage
 */
export function extractPlatformColors(
  fluentDesignLanguage: ComponentFramework.FluentDesignState | undefined
): IStageColors | null {
  if (!fluentDesignLanguage?.tokenTheme) {
    return null;
  }

  const tokens = fluentDesignLanguage.tokenTheme;

  try {
    return {
      completed: tokens.colorStatusSuccessBackground3 || DEFAULT_COLORS_LIGHT.completed,
      completedText: tokens.colorNeutralForegroundOnBrand || DEFAULT_COLORS_LIGHT.completedText,
      active: tokens.colorBrandBackground || DEFAULT_COLORS_LIGHT.active,
      activeText: tokens.colorNeutralForegroundOnBrand || DEFAULT_COLORS_LIGHT.activeText,
      inactive: tokens.colorNeutralBackground3 || DEFAULT_COLORS_LIGHT.inactive,
      inactiveText: tokens.colorNeutralForeground2 || DEFAULT_COLORS_LIGHT.inactiveText,
      track: tokens.colorNeutralBackground3 || DEFAULT_COLORS_LIGHT.track,
    };
  } catch {
    return null;
  }
}

/**
 * Get colors from manifest properties (custom colors)
 */
export function getCustomColors(
  completedColor: string | undefined,
  completedTextColor: string | undefined,
  activeColor: string | undefined,
  activeTextColor: string | undefined,
  inactiveColor: string | undefined,
  inactiveTextColor: string | undefined
): IStageColors {
  return {
    completed: completedColor || DEFAULT_COLORS_LIGHT.completed,
    completedText: completedTextColor || DEFAULT_COLORS_LIGHT.completedText,
    active: activeColor || DEFAULT_COLORS_LIGHT.active,
    activeText: activeTextColor || DEFAULT_COLORS_LIGHT.activeText,
    inactive: inactiveColor || DEFAULT_COLORS_LIGHT.inactive,
    inactiveText: inactiveTextColor || DEFAULT_COLORS_LIGHT.inactiveText,
    track: inactiveColor || DEFAULT_COLORS_LIGHT.track,
  };
}

/**
 * Resolve final colors based on settings
 */
export function resolveColors(
  usePlatformTheme: boolean,
  fluentDesignLanguage: ComponentFramework.FluentDesignState | undefined,
  customColors: IStageColors
): IStageColors {
  if (usePlatformTheme) {
    const platformColors = extractPlatformColors(fluentDesignLanguage);
    if (platformColors) {
      return platformColors;
    }
  }
  return customColors;
}

/**
 * Get stage color based on status
 */
export function getStageColor(
  status: 'completed' | 'active' | 'inactive',
  colors: IStageColors
): { bg: string; text: string } {
  switch (status) {
    case 'completed':
      return { bg: colors.completed, text: colors.completedText };
    case 'active':
      return { bg: colors.active, text: colors.activeText };
    default:
      return { bg: colors.inactive, text: colors.inactiveText };
  }
}

/**
 * Get stage label based on display mode
 */
export function getStageLabel(
  stageName: string,
  categoryName: string,
  displayMode: 'stage' | 'category'
): string {
  return displayMode === 'stage' ? stageName : categoryName;
}

/**
 * Record name size styles
 */
export const RECORD_NAME_SIZES = {
  small: { fontSize: '12px', fontWeight: 500 },
  medium: { fontSize: '14px', fontWeight: 600 },
  large: { fontSize: '16px', fontWeight: 600 },
} as const;
