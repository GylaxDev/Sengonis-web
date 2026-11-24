import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

// The SPA is served directly from public/assets (symlinks to resources),
// so Vite is optional. This config is kept for projects that prefer a build.
export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.js'],
            refresh: true,
        }),
    ],
});
