import {createReadStream} from 'node:fs';
import {stat} from 'node:fs/promises';
import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({
  publicDir: process.env.VITE_HOSTED_DEMO==='true'?'public-demo':'public',
  build: {outDir:process.env.VITE_HOSTED_DEMO==='true'?'dist-hosted':'dist'},
  worker: { format: 'es' },
  plugins: [{name:'local-model-assets',configureServer(server){
    server.middlewares.use(async(req,res,next)=>{
      const pathname=new URL(req.url,'http://localhost').pathname;
      if(!pathname.startsWith('/models/')&&!pathname.startsWith('/wasm/'))return next();
      const root=path.resolve(server.config.publicDir);
      const file=path.resolve(root,'.'+decodeURIComponent(pathname));
      if(!file.startsWith(root+path.sep)){res.statusCode=403;return res.end();}
      try{
        const info=await stat(file);if(!info.isFile())throw new Error('Not a file');
        res.setHeader('Content-Type',file.endsWith('.json')?'application/json':file.endsWith('.mjs')?'text/javascript':file.endsWith('.wasm')?'application/wasm':'application/octet-stream');
        res.setHeader('Content-Length',info.size);createReadStream(file).pipe(res);
      }catch{res.statusCode=404;res.end('Local model file not installed');}
    });
  }},react(), VitePWA({ registerType: 'autoUpdate', includeAssets: ['favicon.svg'], manifest: { name: 'Safar Local', short_name: 'Safar', description: 'Talk. Understand. Learn. Offline.', theme_color: '#ef702b', background_color: '#fffdf8', display: 'standalone', start_url: '/', icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }, { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }] }, workbox: { globPatterns: ['**/*.{js,css,html,svg,png,woff2}'], globIgnores:['models/**','wasm/**','assets/shared-llm.worker-*.js'], maximumFileSizeToCacheInBytes: 6000000, runtimeCaching:[{urlPattern:/\/assets\/shared-llm\.worker-.*\.js$/,handler:'CacheFirst',options:{cacheName:'safar-optional-runtime-v1',cacheableResponse:{statuses:[200]}}},{urlPattern:({url})=>url.origin===self.location.origin&&!url.pathname.includes('-MLC/')&&(url.pathname.startsWith('/models/')||url.pathname.startsWith('/wasm/')),handler:'CacheFirst',options:{cacheName:'safar-model-v1',matchOptions:{ignoreVary:true},cacheableResponse:{statuses:[200]}}}], navigateFallback: '/index.html' } })]
});
