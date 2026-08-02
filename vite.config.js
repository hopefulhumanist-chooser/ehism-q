import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// If you deploy to https://<username>.github.io/<repo-name>/ (a project site,
// not a user/org site), set base to "/<repo-name>/". For a custom domain or
// a user/org site (https://<username>.github.io/), leave it as "/".
export default defineConfig({
  plugins: [react()],
  base: "/ehism-q/",
});
