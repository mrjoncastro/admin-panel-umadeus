const resolveConfig = require('tailwindcss/resolveConfig');
const tailwindConfig = require('../tailwind.config.js');
const colors = require('tailwindcss/colors');

const fullConfig = resolveConfig(tailwindConfig);

module.exports = {
  primary600: fullConfig.theme.extend.colors.primary[600],
  error600: fullConfig.theme.extend.colors.error[600],
  blue500: colors.blue[500],
};
