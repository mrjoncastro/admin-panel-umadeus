import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "../tailwind.config.js";
import colors from "tailwindcss/colors";

// @ts-expect-error: tailwindConfig may not match the expected type, but works at runtime
const fullConfig = resolveConfig(tailwindConfig);

export const twColors = {
  primary600: (fullConfig.theme.colors as any).primary[600],
  error600: (fullConfig.theme.colors as any).error[600],
  blue500: colors.blue[500],
};

export default twColors;
