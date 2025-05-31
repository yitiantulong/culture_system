/// <reference types="vite/client" />
// env.d.ts
declare module "*.png" {
  const value: string
  export default value
}

declare module "@arcgis/core/*" {
  const content: any
  export default content
}
