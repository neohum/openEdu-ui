import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

/** Preloads the main stylesheet and the icon font so the first paint is not blocked on discovering them. */
function preloadCriticalAssets(): Plugin {
  return {
    name: "preload-critical-assets",
    transformIndexHtml: {
      order: "post",
      handler(_html, ctx) {
        const files = Object.keys(ctx.bundle ?? {});
        const tags: { tag: string; attrs: Record<string, string | boolean>; injectTo: "head-prepend" }[] = [];
        const css = files.find((f) => f.endsWith(".css") && f.startsWith("assets/index"));
        const font = files.find((f) => /uicons-regular-rounded.*\.woff2$/.test(f));
        if (css) tags.push({ tag: "link", attrs: { rel: "preload", as: "style", href: `/${css}` }, injectTo: "head-prepend" });
        if (font) tags.push({ tag: "link", attrs: { rel: "preload", as: "font", type: "font/woff2", href: `/${font}`, crossorigin: "" }, injectTo: "head-prepend" });
        return tags;
      },
    },
  };
}

export default defineConfig({
  plugins: [react(), preloadCriticalAssets()],
  build: { target: "es2022", sourcemap: false },
});
