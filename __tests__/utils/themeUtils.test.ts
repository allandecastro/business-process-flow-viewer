/**
 * Tests for themeUtils utility
 */

import {
  DEFAULT_COLORS_LIGHT,
  DEFAULT_COLORS_DARK,
  extractPlatformColors,
  getCustomColors,
  resolveColors,
  getStageColor,
  getStageLabel,
  RECORD_NAME_SIZES,
} from '../../utils/themeUtils';

describe('extractPlatformColors', () => {
  it('returns null when fluentDesignLanguage is undefined', () => {
    expect(extractPlatformColors(undefined)).toBeNull();
  });

  it('returns null when tokenTheme is undefined', () => {
    expect(extractPlatformColors({} as ComponentFramework.FluentDesignState)).toBeNull();
  });

  it('extracts colors from token theme', () => {
    const fluentDesignLanguage = {
      tokenTheme: {
        colorStatusSuccessBackground3: '#22cc22',
        colorNeutralForegroundOnBrand: '#ffffff',
        colorBrandBackground: '#0055cc',
        colorNeutralBackground3: '#f0f0f0',
        colorNeutralForeground2: '#555555',
      },
    } as unknown as ComponentFramework.FluentDesignState;

    const result = extractPlatformColors(fluentDesignLanguage);
    expect(result).not.toBeNull();
    expect(result!.completed).toBe('#22cc22');
    expect(result!.active).toBe('#0055cc');
    expect(result!.inactive).toBe('#f0f0f0');
    expect(result!.inactiveText).toBe('#555555');
  });

  it('uses defaults for missing token values', () => {
    const fluentDesignLanguage = {
      tokenTheme: {},
    } as unknown as ComponentFramework.FluentDesignState;

    const result = extractPlatformColors(fluentDesignLanguage);
    expect(result).not.toBeNull();
    expect(result!.completed).toBe(DEFAULT_COLORS_LIGHT.completed);
    expect(result!.active).toBe(DEFAULT_COLORS_LIGHT.active);
  });
});

describe('getCustomColors', () => {
  it('returns custom colors when provided', () => {
    const result = getCustomColors('#111', '#222', '#333', '#444', '#555', '#666');
    expect(result.completed).toBe('#111');
    expect(result.completedText).toBe('#222');
    expect(result.active).toBe('#333');
    expect(result.activeText).toBe('#444');
    expect(result.inactive).toBe('#555');
    expect(result.inactiveText).toBe('#666');
    expect(result.track).toBe('#555'); // track uses inactiveColor
  });

  it('falls back to defaults for undefined values', () => {
    const result = getCustomColors(undefined, undefined, undefined, undefined, undefined, undefined);
    expect(result.completed).toBe(DEFAULT_COLORS_LIGHT.completed);
    expect(result.active).toBe(DEFAULT_COLORS_LIGHT.active);
    expect(result.inactive).toBe(DEFAULT_COLORS_LIGHT.inactive);
  });

  it('mixes custom and default values', () => {
    const result = getCustomColors('#custom', undefined, undefined, undefined, undefined, undefined);
    expect(result.completed).toBe('#custom');
    expect(result.completedText).toBe(DEFAULT_COLORS_LIGHT.completedText);
  });
});

describe('resolveColors', () => {
  const customColors = {
    completed: '#custom1',
    completedText: '#custom2',
    active: '#custom3',
    activeText: '#custom4',
    inactive: '#custom5',
    inactiveText: '#custom6',
    track: '#custom7',
  };

  it('returns platform colors when usePlatformTheme is true and available', () => {
    const fluentDesignLanguage = {
      tokenTheme: {
        colorStatusSuccessBackground3: '#platform',
        colorNeutralForegroundOnBrand: '#fff',
        colorBrandBackground: '#blue',
        colorNeutralBackground3: '#gray',
        colorNeutralForeground2: '#dark',
      },
    } as unknown as ComponentFramework.FluentDesignState;

    const result = resolveColors(true, fluentDesignLanguage, customColors);
    expect(result.completed).toBe('#platform');
  });

  it('returns custom colors when usePlatformTheme is false', () => {
    const result = resolveColors(false, undefined, customColors);
    expect(result).toEqual(customColors);
  });

  it('falls back to custom colors when platform theme is unavailable', () => {
    const result = resolveColors(true, undefined, customColors);
    expect(result).toEqual(customColors);
  });
});

describe('getStageColor', () => {
  const colors = {
    completed: '#10b981',
    completedText: '#ffffff',
    active: '#0078d4',
    activeText: '#ffffff',
    inactive: '#e5e5e5',
    inactiveText: '#6b6b6b',
    track: '#d1d1d1',
  };

  it('returns completed colors', () => {
    const result = getStageColor('completed', colors);
    expect(result.bg).toBe('#10b981');
    expect(result.text).toBe('#ffffff');
  });

  it('returns active colors', () => {
    const result = getStageColor('active', colors);
    expect(result.bg).toBe('#0078d4');
    expect(result.text).toBe('#ffffff');
  });

  it('returns inactive colors for inactive status', () => {
    const result = getStageColor('inactive', colors);
    expect(result.bg).toBe('#e5e5e5');
    expect(result.text).toBe('#6b6b6b');
  });
});

describe('getStageLabel', () => {
  it('returns stage name in stage mode', () => {
    expect(getStageLabel('Qualify Lead', 'Qualify', 'stage')).toBe('Qualify Lead');
  });

  it('returns category name in category mode', () => {
    expect(getStageLabel('Qualify Lead', 'Qualify', 'category')).toBe('Qualify');
  });
});

describe('constants', () => {
  it('DEFAULT_COLORS_LIGHT has all required properties', () => {
    expect(DEFAULT_COLORS_LIGHT.completed).toBeDefined();
    expect(DEFAULT_COLORS_LIGHT.completedText).toBeDefined();
    expect(DEFAULT_COLORS_LIGHT.active).toBeDefined();
    expect(DEFAULT_COLORS_LIGHT.activeText).toBeDefined();
    expect(DEFAULT_COLORS_LIGHT.inactive).toBeDefined();
    expect(DEFAULT_COLORS_LIGHT.inactiveText).toBeDefined();
    expect(DEFAULT_COLORS_LIGHT.track).toBeDefined();
  });

  it('DEFAULT_COLORS_DARK has all required properties', () => {
    expect(DEFAULT_COLORS_DARK.completed).toBeDefined();
    expect(DEFAULT_COLORS_DARK.completedText).toBeDefined();
    expect(DEFAULT_COLORS_DARK.active).toBeDefined();
    expect(DEFAULT_COLORS_DARK.activeText).toBeDefined();
    expect(DEFAULT_COLORS_DARK.inactive).toBeDefined();
    expect(DEFAULT_COLORS_DARK.inactiveText).toBeDefined();
    expect(DEFAULT_COLORS_DARK.track).toBeDefined();
  });

  it('RECORD_NAME_SIZES has all size options', () => {
    expect(RECORD_NAME_SIZES.small).toBeDefined();
    expect(RECORD_NAME_SIZES.medium).toBeDefined();
    expect(RECORD_NAME_SIZES.large).toBeDefined();
    expect(RECORD_NAME_SIZES.small.fontSize).toBe('12px');
    expect(RECORD_NAME_SIZES.medium.fontSize).toBe('14px');
    expect(RECORD_NAME_SIZES.large.fontSize).toBe('16px');
  });
});
