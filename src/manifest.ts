import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest({
  manifest_version: 3,
  name: "UChiSchedule",
  version: "1.0.0",
  description:
    "Plan your UChicago class schedule with visual calendar, conflict detection, and quick access to course reviews.",
  permissions: ["storage"],
  background: {
    service_worker: "src/background/index.ts",
    type: "module",
  },
  content_scripts: [
    {
      matches: ["https://mpcs-courses.cs.uchicago.edu/*"],
      js: ["src/content/index.tsx"],
      css: ["src/content/content.css"],
    },
  ],
  action: {
    default_popup: "src/popup/index.html",
    default_icon: {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png",
    },
  },
  icons: {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png",
  },
});
