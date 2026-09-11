import { build } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function runBuild() {
  console.log('🚀 [1/3] Building Popup & Copying Manifest/Icons...');
  await build({
    base: '',
    configFile: false,
    root: rootDir,
    plugins: [react()],
    publicDir: path.resolve(rootDir, 'public'),
    build: {
      outDir: path.resolve(rootDir, 'dist'),
      emptyOutDir: true,
      rollupOptions: {
        input: {
          popup: path.resolve(rootDir, 'popup.html')
        },
        output: {
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]'
        }
      }
    }
  });

  console.log('⚡ [2/3] Building Background Service Worker...');
  await build({
    configFile: false,
    root: rootDir,
    publicDir: false,
    build: {
      outDir: path.resolve(rootDir, 'dist'),
      emptyOutDir: false,
      lib: {
        entry: path.resolve(rootDir, 'src/background/index.ts'),
        name: 'background',
        formats: ['es'],
        fileName: () => 'background.js'
      },
      rollupOptions: {
        output: {
          inlineDynamicImports: true
        }
      }
    }
  });

  console.log('🧩 [3/3] Building Content Script (IIFE)...');
  await build({
    configFile: false,
    root: rootDir,
    publicDir: false,
    build: {
      outDir: path.resolve(rootDir, 'dist'),
      emptyOutDir: false,
      lib: {
        entry: path.resolve(rootDir, 'src/content/index.ts'),
        name: 'LeetLogContent',
        formats: ['iife'],
        fileName: () => 'content.js'
      },
      rollupOptions: {
        output: {
          inlineDynamicImports: true
        }
      }
    }
  });

  console.log('✅ Extension build completed successfully in dist/ !');
}

runBuild().catch((err) => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});
