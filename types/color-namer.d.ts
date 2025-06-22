declare module 'color-namer' {
  interface NamerResult {
    name: string
    hex: string
    distance: number
  }
  interface NamerPalette {
    name: string
    hex: string
    distance: number
  }
  ;[]
  interface NamerReturn {
    [palette: string]: NamerPalette
  }
  function namer(
    input:
      | string
      | [number, number, number]
      | { r: number; g: number; b: number },
    options?: { pick?: string[] },
  ): NamerReturn
  export default colorNamer
}
