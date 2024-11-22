/**
 * Object that will store the theme for the portal
 */
export const themeState = {
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
  if (!themeConfig) return state;

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
    if (isHexColor(config?.colors?.primary)) {
      // Convert the hex color into HSL so we can use the hue and saturation to
      // create multiple variations of this color
      const [h, s] = hexColorToHsl(config.colors.primary);
      cssVars.push(`--primary-100: ${h} ${s} 96%;`);
      cssVars.push(`--primary-200: ${h} ${s} 94%;`);
      cssVars.push(`--primary-300: ${h} ${s} 87%;`);
      cssVars.push(`--primary-400: ${h} ${s} 83%;`);
      cssVars.push(`--primary-500: ${h} ${s} 74%;`);
      cssVars.push(`--primary-900: ${h} ${s} 18%;`);
    }

    // If a secondary color is set in the theme attribute
    if (isHexColor(config?.colors?.secondary)) {
      // Convert the hex color into HSL so we can use the hue and saturation to
      // create multiple variations of this color
      const [h, s] = hexColorToHsl(config.colors.secondary);
      cssVars.push(`--secondary-100: ${h} ${s} 91%;`);
      cssVars.push(`--secondary-400: ${h} ${s} 75%;`);
      cssVars.push(`--secondary-500: ${h} ${s} 32%;`);
    }

    // If a gray color is set in the theme attribute
    if (isHexColor(config?.colors?.gray)) {
      // Convert the hex color into HSL so we can use the hue and saturation to
      // create multiple variations of this color
      const [h, s] = hexColorToHsl(config.colors.gray);
      cssVars.push(`--gray-100: ${h} ${s} 97.65%;`);
      cssVars.push(`--gray-200: ${h} ${s} 91%;`);
      cssVars.push(`--gray-500: ${h} ${s} 53%;`);
      cssVars.push(`--gray-900: ${h} ${s} 42%;`);
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

/**
 * Checks if a provided value is a valid hex color value
 */
function isHexColor(color) {
  return color && /^#[a-f\d]{6}$/i.test(color);
}

/**
 * Converts a hex color value into hsl
 */
function hexColorToHsl(color) {
  const r = parseInt(color.slice(1, 3), 16) / 255;
  const g = parseInt(color.slice(3, 5), 16) / 255;
  const b = parseInt(color.slice(5), 16) / 255;

  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  return [
    (h * 360).toFixed(2),
    `${(s * 100).toFixed(2)}%`,
    `${(l * 100).toFixed(2)}%`,
  ];
}
