import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
// Removed separate inspector plugin; using built-in SvelteKit integration via svelte.config.js

export default defineConfig({
    plugins: [
        sveltekit(),
        tailwindcss()
    ],
    optimizeDeps: {
        include: ['@maptiler/sdk']
    },
    build: {
        minify: 'esbuild', // Faster than terser, built-in
        target: 'esnext',
        cssMinify: true,
        chunkSizeWarningLimit: 1000
    },
    server: {
        allowedHosts: ['valle-sagrado.test', '.test']
    }
});
