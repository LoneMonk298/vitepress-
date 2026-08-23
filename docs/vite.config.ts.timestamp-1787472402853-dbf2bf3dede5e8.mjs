// docs/vite.config.ts
import { defineConfig } from "file:///E:/Project/Web/vitepress-/node_modules/.pnpm/vite@5.0.3_@types+node@26.2.0/node_modules/vite/dist/node/index.js";
import Components from "file:///E:/Project/Web/vitepress-/node_modules/.pnpm/unplugin-vue-components@0.2_2004582d7660a90f3b32b6cea4e98261/node_modules/unplugin-vue-components/dist/vite.mjs";
import { ArcoResolver } from "file:///E:/Project/Web/vitepress-/node_modules/.pnpm/unplugin-vue-components@0.2_2004582d7660a90f3b32b6cea4e98261/node_modules/unplugin-vue-components/dist/resolvers.mjs";
var vite_config_default = defineConfig({
  plugins: [
    Components({
      dirs: [".vitepress/theme/components"],
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
      resolvers: [ArcoResolver({ sideEffect: true, resolveIcons: true })]
    })
  ],
  ssr: { noExternal: ["@arco-design/web-vue"] },
  resolve: {
    alias: {
      "mermaid": "mermaid/dist/mermaid.esm.mjs"
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiZG9jcy92aXRlLmNvbmZpZy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkU6XFxcXFByb2plY3RcXFxcV2ViXFxcXHZpdGVwcmVzcy1cXFxcZG9jc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRTpcXFxcUHJvamVjdFxcXFxXZWJcXFxcdml0ZXByZXNzLVxcXFxkb2NzXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9FOi9Qcm9qZWN0L1dlYi92aXRlcHJlc3MtL2RvY3Mvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcclxuaW1wb3J0IENvbXBvbmVudHMgZnJvbSAndW5wbHVnaW4tdnVlLWNvbXBvbmVudHMvdml0ZSc7XHJcbmltcG9ydCB7IEFyY29SZXNvbHZlciB9IGZyb20gJ3VucGx1Z2luLXZ1ZS1jb21wb25lbnRzL3Jlc29sdmVycyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIHBsdWdpbnM6IFtcclxuICAgIENvbXBvbmVudHMoe1xyXG4gICAgICBkaXJzOiBbJy52aXRlcHJlc3MvdGhlbWUvY29tcG9uZW50cyddLFxyXG4gICAgICBpbmNsdWRlOiBbL1xcLnZ1ZSQvLCAvXFwudnVlXFw/dnVlLywgL1xcLm1kJC9dLFxyXG4gICAgICByZXNvbHZlcnM6IFtBcmNvUmVzb2x2ZXIoeyBzaWRlRWZmZWN0OiB0cnVlLCByZXNvbHZlSWNvbnM6IHRydWUgfSldXHJcbiAgICB9KSxcclxuICBdLFxyXG4gIHNzcjogeyBub0V4dGVybmFsOiBbJ0BhcmNvLWRlc2lnbi93ZWItdnVlJ10gfSxcclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczoge1xyXG4gICAgICAnbWVybWFpZCc6ICdtZXJtYWlkL2Rpc3QvbWVybWFpZC5lc20ubWpzJyxcclxuICAgIH0sXHJcbiAgfSxcclxufSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBc1IsU0FBUyxvQkFBb0I7QUFDblQsT0FBTyxnQkFBZ0I7QUFDdkIsU0FBUyxvQkFBb0I7QUFFN0IsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsV0FBVztBQUFBLE1BQ1QsTUFBTSxDQUFDLDZCQUE2QjtBQUFBLE1BQ3BDLFNBQVMsQ0FBQyxVQUFVLGNBQWMsT0FBTztBQUFBLE1BQ3pDLFdBQVcsQ0FBQyxhQUFhLEVBQUUsWUFBWSxNQUFNLGNBQWMsS0FBSyxDQUFDLENBQUM7QUFBQSxJQUNwRSxDQUFDO0FBQUEsRUFDSDtBQUFBLEVBQ0EsS0FBSyxFQUFFLFlBQVksQ0FBQyxzQkFBc0IsRUFBRTtBQUFBLEVBQzVDLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLFdBQVc7QUFBQSxJQUNiO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
