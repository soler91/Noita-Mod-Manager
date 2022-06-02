import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import {sveltePreprocess} from "svelte-preprocess"
import path from "path"
// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.IS_DEV !== 'true' ? './' : '/',
  build: {
    outDir: 'app/build',
  },
  plugins: [svelte({ preprocess: sveltePreprocess }), vue()]
})
