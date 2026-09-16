import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            // React y su runtime: un chunk estable y cacheable aparte
            {
              name: 'react-vendor',
              test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              priority: 30,
            },
            // Gráficas (recharts): solo se carga junto con el Dashboard
            {
              name: 'charts',
              test: /node_modules[\\/]recharts[\\/]/,
              priority: 20,
            },
            // Iconos
            {
              name: 'icons',
              test: /node_modules[\\/]lucide-react[\\/]/,
              priority: 15,
            },
            // NOTA: xlsx y exceljs NO se agrupan aquí a propósito — se importan
            // dinámicamente (solo al importar/exportar), así que Rolldown les
            // crea su propio chunk que se descarga bajo demanda.
          ],
        },
      },
    },
  },
})
