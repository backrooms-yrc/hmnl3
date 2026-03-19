// vite.config.ts
import { defineConfig } from "file:///C:/Users/Administrator/Downloads/app-883oyd7kz475%20-%20%E5%89%AF%E6%9C%AC%20(2)/app-883oyd7kz475%20-%20%E5%89%AF%E6%9C%AC%20(2)/node_modules/.pnpm/vite@5.4.21_@types+node@25.3.5/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/Administrator/Downloads/app-883oyd7kz475%20-%20%E5%89%AF%E6%9C%AC%20(2)/app-883oyd7kz475%20-%20%E5%89%AF%E6%9C%AC%20(2)/node_modules/.pnpm/@vitejs+plugin-react@4.7.0_vite@5.4.21_@types+node@25.3.5_/node_modules/@vitejs/plugin-react/dist/index.js";
import svgr from "file:///C:/Users/Administrator/Downloads/app-883oyd7kz475%20-%20%E5%89%AF%E6%9C%AC%20(2)/app-883oyd7kz475%20-%20%E5%89%AF%E6%9C%AC%20(2)/node_modules/.pnpm/vite-plugin-svgr@4.5.0_roll_013d8358b3181b81e56ddd1fd66c97cc/node_modules/vite-plugin-svgr/dist/index.js";
import path from "path";
import { miaodaDevPlugin } from "file:///C:/Users/Administrator/Downloads/app-883oyd7kz475%20-%20%E5%89%AF%E6%9C%AC%20(2)/app-883oyd7kz475%20-%20%E5%89%AF%E6%9C%AC%20(2)/node_modules/.pnpm/miaoda-sc-plugin@1.0.56_vite@5.4.21_@types+node@25.3.5_/node_modules/miaoda-sc-plugin/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\Administrator\\Downloads\\app-883oyd7kz475 - \u526F\u672C (2)\\app-883oyd7kz475 - \u526F\u672C (2)";
var vite_config_default = defineConfig({
  plugins: [react(), svgr({
    svgrOptions: {
      icon: true,
      exportType: "named",
      namedExport: "ReactComponent"
    }
  }), miaodaDevPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  server: {
    host: "0.0.0.0",
    port: 2011,
    strictPort: true
  },
  build: {
    target: "esnext",
    minify: "esbuild",
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-radix": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-popover",
            "@radix-ui/react-select",
            "@radix-ui/react-tabs"
          ],
          "vendor-ui": ["lucide-react", "class-variance-authority", "clsx", "tailwind-merge"],
          "vendor-markdown": ["react-markdown", "remark-gfm"],
          "vendor-media": ["hls.js"]
        }
      }
    },
    chunkSizeWarningLimit: 1e3
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom", "lucide-react"],
    esbuildOptions: {
      target: "esnext"
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxBZG1pbmlzdHJhdG9yXFxcXERvd25sb2Fkc1xcXFxhcHAtODgzb3lkN2t6NDc1IC0gXHU1MjZGXHU2NzJDICgyKVxcXFxhcHAtODgzb3lkN2t6NDc1IC0gXHU1MjZGXHU2NzJDICgyKVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcQWRtaW5pc3RyYXRvclxcXFxEb3dubG9hZHNcXFxcYXBwLTg4M295ZDdrejQ3NSAtIFx1NTI2Rlx1NjcyQyAoMilcXFxcYXBwLTg4M295ZDdrejQ3NSAtIFx1NTI2Rlx1NjcyQyAoMilcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL0FkbWluaXN0cmF0b3IvRG93bmxvYWRzL2FwcC04ODNveWQ3a3o0NzUlMjAtJTIwJUU1JTg5JUFGJUU2JTlDJUFDJTIwKDIpL2FwcC04ODNveWQ3a3o0NzUlMjAtJTIwJUU1JTg5JUFGJUU2JTlDJUFDJTIwKDIpL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuaW1wb3J0IHN2Z3IgZnJvbSAndml0ZS1wbHVnaW4tc3Zncic7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcblxuaW1wb3J0IHsgbWlhb2RhRGV2UGx1Z2luIH0gZnJvbSBcIm1pYW9kYS1zYy1wbHVnaW5cIjtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW3JlYWN0KCksIHN2Z3Ioe1xuICAgICAgc3Znck9wdGlvbnM6IHtcbiAgICAgICAgaWNvbjogdHJ1ZSwgZXhwb3J0VHlwZTogJ25hbWVkJywgbmFtZWRFeHBvcnQ6ICdSZWFjdENvbXBvbmVudCcsIH0sIH0pLCBtaWFvZGFEZXZQbHVnaW4oKV0sXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgJ0AnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMnKSxcbiAgICB9LFxuICB9LFxuICBzZXJ2ZXI6IHtcbiAgICBob3N0OiAnMC4wLjAuMCcsXG4gICAgcG9ydDogMjAxMSxcbiAgICBzdHJpY3RQb3J0OiB0cnVlLFxuICB9LFxuICBidWlsZDoge1xuICAgIHRhcmdldDogJ2VzbmV4dCcsXG4gICAgbWluaWZ5OiAnZXNidWlsZCcsXG4gICAgY3NzTWluaWZ5OiB0cnVlLFxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBtYW51YWxDaHVua3M6IHtcbiAgICAgICAgICAndmVuZG9yLXJlYWN0JzogWydyZWFjdCcsICdyZWFjdC1kb20nLCAncmVhY3Qtcm91dGVyLWRvbSddLFxuICAgICAgICAgICd2ZW5kb3ItcmFkaXgnOiBbXG4gICAgICAgICAgICAnQHJhZGl4LXVpL3JlYWN0LWRpYWxvZycsXG4gICAgICAgICAgICAnQHJhZGl4LXVpL3JlYWN0LWRyb3Bkb3duLW1lbnUnLFxuICAgICAgICAgICAgJ0ByYWRpeC11aS9yZWFjdC1wb3BvdmVyJyxcbiAgICAgICAgICAgICdAcmFkaXgtdWkvcmVhY3Qtc2VsZWN0JyxcbiAgICAgICAgICAgICdAcmFkaXgtdWkvcmVhY3QtdGFicycsXG4gICAgICAgICAgXSxcbiAgICAgICAgICAndmVuZG9yLXVpJzogWydsdWNpZGUtcmVhY3QnLCAnY2xhc3MtdmFyaWFuY2UtYXV0aG9yaXR5JywgJ2Nsc3gnLCAndGFpbHdpbmQtbWVyZ2UnXSxcbiAgICAgICAgICAndmVuZG9yLW1hcmtkb3duJzogWydyZWFjdC1tYXJrZG93bicsICdyZW1hcmstZ2ZtJ10sXG4gICAgICAgICAgJ3ZlbmRvci1tZWRpYSc6IFsnaGxzLmpzJ10sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiAxMDAwLFxuICB9LFxuICBvcHRpbWl6ZURlcHM6IHtcbiAgICBpbmNsdWRlOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbScsICdyZWFjdC1yb3V0ZXItZG9tJywgJ2x1Y2lkZS1yZWFjdCddLFxuICAgIGVzYnVpbGRPcHRpb25zOiB7XG4gICAgICB0YXJnZXQ6ICdlc25leHQnLFxuICAgIH0sXG4gIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBc2UsU0FBUyxvQkFBb0I7QUFDbmdCLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsT0FBTyxVQUFVO0FBRWpCLFNBQVMsdUJBQXVCO0FBTGhDLElBQU0sbUNBQW1DO0FBT3pDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVMsQ0FBQyxNQUFNLEdBQUcsS0FBSztBQUFBLElBQ3BCLGFBQWE7QUFBQSxNQUNYLE1BQU07QUFBQSxNQUFNLFlBQVk7QUFBQSxNQUFTLGFBQWE7QUFBQSxJQUFrQjtBQUFBLEVBQUcsQ0FBQyxHQUFHLGdCQUFnQixDQUFDO0FBQUEsRUFDOUYsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLElBQ3RDO0FBQUEsRUFDRjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sWUFBWTtBQUFBLEVBQ2Q7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxJQUNSLFFBQVE7QUFBQSxJQUNSLFdBQVc7QUFBQSxJQUNYLGVBQWU7QUFBQSxNQUNiLFFBQVE7QUFBQSxRQUNOLGNBQWM7QUFBQSxVQUNaLGdCQUFnQixDQUFDLFNBQVMsYUFBYSxrQkFBa0I7QUFBQSxVQUN6RCxnQkFBZ0I7QUFBQSxZQUNkO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFVBQ0Y7QUFBQSxVQUNBLGFBQWEsQ0FBQyxnQkFBZ0IsNEJBQTRCLFFBQVEsZ0JBQWdCO0FBQUEsVUFDbEYsbUJBQW1CLENBQUMsa0JBQWtCLFlBQVk7QUFBQSxVQUNsRCxnQkFBZ0IsQ0FBQyxRQUFRO0FBQUEsUUFDM0I7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsdUJBQXVCO0FBQUEsRUFDekI7QUFBQSxFQUNBLGNBQWM7QUFBQSxJQUNaLFNBQVMsQ0FBQyxTQUFTLGFBQWEsb0JBQW9CLGNBQWM7QUFBQSxJQUNsRSxnQkFBZ0I7QUFBQSxNQUNkLFFBQVE7QUFBQSxJQUNWO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
