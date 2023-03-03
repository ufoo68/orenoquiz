/** @type {import("prettier").Config} */
module.exports = {
  trailingComma: "es5",
  printWidth: 80,
  semi: false,
  singleQuote: true,
  plugins: [require.resolve("prettier-plugin-tailwindcss")],
};
