module.exports = {
  "src/**/*.{ts,tsx}": filenames => [
    `yarn format ${filenames.join(" ")}`,
    "yarn lint:fix",
    "yarn typecheck",
  ],
}
