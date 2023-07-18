/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  transform: { "\\.[jt]s?$": ["ts-jest", { tsconfig: { allowJs: true } }] }, // allowJs is required for get-port
  transformIgnorePatterns: ["node_modules/(?!get-port/.*)"], // you might need to ignore some packages
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.[jt]s$": "$1",
  },
};
