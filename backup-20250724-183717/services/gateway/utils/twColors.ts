import resolveConfig from 'tailwindcss/resolveConfig'
import tailwindConfig from '../../../tailwind.config.js'
import colors from 'tailwindcss/colors'

// @ts-expect-error: tailwindConfig may not match the expected type, but works at runtime
const fullConfig = resolveConfig(tailwindConfig)

function resolveColor(value: any) {
  return typeof value === 'function' ? value({}) : value
}

export const twColors = {
  primary600: resolveColor(
    (fullConfig.theme.colors as unknown as { [key: string]: any })
      .primary?.[600],
  ),
  error600: resolveColor(
    (fullConfig.theme.colors as unknown as { [key: string]: any }).error?.[600],
  ),
  blue500: colors.blue[500],
}

export default twColors
