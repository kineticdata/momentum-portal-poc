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
  // Has the theme been initialized from the space attribute
  ready: false,
  // Is the theme editor enabled
  editor: false,
  // A string of css variable overrides to alter the theme
  css: null,
  // URLs to logo images
  logo: null,
  inverseLogo: null,
  // The parsed Theme space attribute value
  parsed: {},
};

/**
 * Function that updates a state object with the provided theme data.
 *
 * @param {Object} state
 * @param {string} themeConfig JSON string of theme configurations.
 * @returns {Object}
 */
export const calculateThemeState = (state, themeConfig) => {
  state.ready = true;

  if (!themeConfig) {
    state.css = null;
    state.logo = null;
    state.inverseLogo = null;
    state.parsed = {};
    return state;
  }

  try {
    // Parse the provided attribute value
    const config = JSON.parse(themeConfig);
    state.parsed = config;

    // Set logos into state
    state.logo = config?.logo?.standard;
    state.inverseLogo = config?.logo?.inverse;

    // Create an array to store any css variable overrides
    const cssVars = [];

    // If a primary color is set in the theme attribute
    const primary = parseHexColor(config?.colors?.primary);
    if (primary) {
      // Convert the hex color into HSL so we can use the hue and saturation to
      // create multiple variations of this color
      const { hue: h, saturation: s } = primary.toHSL();
      cssVars.push(`--primary-100: ${h} ${s}% 96%;`);
      cssVars.push(`--primary-200: ${h} ${s}% 94%;`);
      cssVars.push(`--primary-300: ${h} ${s}% 87%;`);
      cssVars.push(`--primary-400: ${h} ${s}% 83%;`);
      cssVars.push(`--primary-500: ${h} ${s}% 74%;`);
      cssVars.push(`--primary-900: ${h} ${s}% 18%;`);
    }

    // If a secondary color is set in the theme attribute
    const secondary = parseHexColor(config?.colors?.secondary);
    if (secondary) {
      // Convert the hex color into HSL so we can use the hue and saturation to
      // create multiple variations of this color
      const { hue: h, saturation: s } = secondary.toHSL();
      cssVars.push(`--secondary-100: ${h} ${s}% 91%;`);
      cssVars.push(`--secondary-400: ${h} ${s}% 75%;`);
      cssVars.push(`--secondary-500: ${h} ${s}% 32%;`);
    }

    // If a gray color is set in the theme attribute
    const gray = parseHexColor(config?.colors?.gray);
    if (gray) {
      // Convert the hex color into HSL so we can use the hue and saturation to
      // create multiple variations of this color
      const { hue: h, saturation: s } = gray.toHSL();
      cssVars.push(`--gray-100: ${h} ${Math.min(s, 12)}% 97.65%;`);
      cssVars.push(`--gray-200: ${h} ${Math.min(s, 12)}% 91%;`);
      cssVars.push(`--gray-500: ${h} ${Math.min(s, 12)}% 53%;`);
      cssVars.push(`--gray-900: ${h} ${Math.min(s, 12)}% 42%;`);
    }

    // Concatenate all of the css variable overrides into a single string that
    // can be set into a style sheet to override the current styles
    state.css = ':root {\n' + cssVars.join('\n') + '\n}';
    return state;
  } catch (e) {
    console.error('Invalid Theme Configuration');
    return state;
  }
};
