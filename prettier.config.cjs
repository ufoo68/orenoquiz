/** @type {import("prettier").Config} */
module.exports = {
  trailingComma: "es5",
  printWidth: 80,
  semi: false,
  plugins: [require.resolve("prettier-plugin-tailwindcss")],
};
