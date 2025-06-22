// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // Ensure you have this if you're using React
import tailwindcss from '@tailwindcss/vite'; // Your existing TailwindCSS import

export default defineConfig({
  plugins: [
    react(), // Add react plugin if you are using React
    tailwindcss(), // Your existing TailwindCSS plugin
  ],
  server: {
    port: 3000, // Your frontend development server port (e.g., where 'npm run dev' runs)
    proxy: {
      // Proxy requests starting with '/api' to your backend server
      '/api': {
        target: 'http://localhost:5000', // Your Node.js backend URL
        changeOrigin: true, // Needed for virtual hosted sites
        // Rewrite rule: this sends '/api/payment/initialize' as '/api/payment/initialize' to backend
        // If your backend routes are defined WITHOUT the '/api' prefix, you'd use:
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
