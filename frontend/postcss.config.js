// postcss.config.js
// Tailwind v4 uses @tailwindcss/postcss instead of the old tailwindcss plugin.
// autoprefixer is now built into Tailwind v4 — no need to list it separately.
module.exports = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
