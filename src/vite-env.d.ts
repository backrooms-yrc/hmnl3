/// <reference types="vite/client" />

declare module 'miaoda-sc-plugin' {
  import type { Plugin } from 'vite';
  
  export function miaodaDevPlugin(): Plugin;
}
