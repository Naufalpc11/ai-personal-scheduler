const dotenv = require("dotenv");

dotenv.config();

// Polyfill check: Node 18+ provides global fetch; warn or attempt to polyfill otherwise.
if (typeof fetch === "undefined") {
  try {
    // Try to require node-fetch if it's installed (optional). If not present, we'll warn.
    // Use dynamic require so projects without node-fetch don't fail to load this file.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const nodeFetch = require("node-fetch");
    global.fetch = nodeFetch;
    console.log("Info: global.fetch polyfilled using node-fetch.");
  } catch (e) {
    console.warn(
      "Warning: global.fetch is not available. If you're running Node <18, install 'node-fetch' or upgrade Node to >=18 to allow Gemini REST calls."
    );
  }
}

const app = require("./app");

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});
