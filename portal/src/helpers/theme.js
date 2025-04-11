import { parseColor } from '@ark-ui/react/color-picker';

export const parseHexColor = color => {
  try {
    return parseColor(color);
  } catch (e) {
    return null;
  }
};

/**
 * Object that will store the theme for the portal
 */
export const themeState = {
  // Has the theme been initialized
  ready: false,
  // Is the theme editor enabled
  editor: false,
  // A string of css variable overrides to alter the theme
  css: null,
  // URL to logo image
  logo: null,
  // The parsed Theme attribute values
  parsed: { Space: {}, Kapp: {} },
};

/**
 * Function that updates a state object with the provided theme data.
 *
 * @param {Object} state
 * @param {string} themeConfig JSON string of theme configurations.
 * @param {string} name Namespace for the theme config
 * @param {boolean} updateLive Should the live styles be updated
 * @param {boolean} init Is the theme being set as part of the initial load
 * @returns {Object}
 */
export const calculateThemeState = (
  state,
  themeConfig,
  name = 'Space',
  updateLive = true,
  init = false,
) => {
  state.ready = true;

  if (!themeConfig) {
    state.css = null;
    state.logo = null;
    state.parsed[name] = {};
    return state;
  }

  try {
    // Parse the provided attribute value
    const config = JSON.parse(themeConfig);
    const isFirstTheme = !state.parsed[name].colors;
    state.parsed[name] = config;

    // Set logo into state
    state.logo = config?.logo?.standard;

    if (updateLive && (!init || isFirstTheme)) {
      // Create an array to store any css variable overrides
      const cssVars = [];

      // If a primary color is set in the theme attribute, build variants from
      // that color and set into the appropriate css variables
      const primaryVariants = createPrimaryVariants(config?.colors?.primary);
      if (primaryVariants) {
        primaryVariants.forEach(([step, { hue, saturation, lightness }]) =>
          cssVars.push(
            `--primary-${step}: ${hue} ${saturation}% ${lightness}%;`,
          ),
        );
      }

      // If a secondary color is set in the theme attribute, build variants from
      // that color and set into the appropriate css variables
      const secondaryVariants = createSecondaryVariants(
        config?.colors?.secondary,
      );
      if (secondaryVariants) {
        secondaryVariants.forEach(([step, { hue, saturation, lightness }]) =>
          cssVars.push(
            `--secondary-${step}: ${hue} ${saturation}% ${lightness}%;`,
          ),
        );
      }

      // If a gray color is set in the theme attribute, build variants from
      // that color and set into the appropriate css variables
      const grayVariants = createGrayVariants(config?.colors?.gray);
      if (grayVariants) {
        grayVariants.forEach(([step, { hue, saturation, lightness }]) =>
          cssVars.push(`--gray-${step}: ${hue} ${saturation}% ${lightness}%;`),
        );
      }

      // Concatenate all of the css variable overrides into a single string that
      // can be set into a style sheet to override the current styles
      state.css = ':root {\n' + cssVars.join('\n') + '\n}';
    }

    return state;
  } catch (e) {
    console.error('Invalid Theme Configuration');
    return state;
  }
};

export function createPrimaryVariants(value, overrides, toHex = false) {
  return createColorVariants(value, overrides, toHex, [
    [900, 18],
    [500, 74],
    [400, 83],
    [300, 87],
    [200, 94],
    [100, 96],
  ]);
}
export function createSecondaryVariants(value, overrides, toHex = false) {
  return createColorVariants(value, overrides, toHex, [
    [500, 32],
    [400, 75],
    [100, 91],
  ]);
}
export function createGrayVariants(value, overrides, toHex = false) {
  return createColorVariants(value, overrides, toHex, [
    [950, 12],
    [900, 42],
    [500, 53],
    [200, 91],
    [100, 97.65],
  ]);
}

function createColorVariants(value, overrides, toHex, lightnesses) {
  const rgb = parseHexColor(value);
  if (!rgb) return null;

  const hsl = rgb.toHSL();

  const [closest] = lightnesses.reduce(
    ([closestStep, closestDist], [step, lightness]) => {
      const dist = Math.abs(hsl.lightness - lightness);
      if (dist < closestDist) return [step, dist];
      return [closestStep, closestDist];
    },
    [null, 100],
  );

  return lightnesses.map(([step, lightness]) => {
    const variant = hsl.clone();
    if (step === closest) variant.lightness = hsl.lightness;
    else variant.lightness = lightness;
    return [step, toHex ? variant.toString('hex') : variant];
  });
}
