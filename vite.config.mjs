import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
  return {
    server: {
      watch: { ignored: ['**/screenshots/**', '**/test-results/**', '**/playwright-report/**'] },
    },
    build: {
      outDir: 'build',
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                name: 'three',
                test: /node_modules[\\/]three[\\/]/,
                maxSize: 450000,
              },
            ],
          },
        },
      },
    },
    plugins: [react()],
  };
});