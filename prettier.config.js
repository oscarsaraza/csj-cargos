/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
const config = {
  plugins: ["prettier-plugin-tailwindcss"],
  semi: false,
  arrowParens: "always",
  printWidth: 120,
  singleQuote: true,
};

export default config;
