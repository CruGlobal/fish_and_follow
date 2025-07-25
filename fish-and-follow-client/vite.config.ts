import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const devServer = {
  target: process.env.REACT_APP_API_URL ?? 'http://localhost:3000',
  changeOrigin: true,
};

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  server: {
    proxy: {
      '/api': devServer,
      '/auth/status': devServer,
      '/signin': devServer,
      '/signout': devServer,
    }
  }
});
