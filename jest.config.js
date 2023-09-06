/** @type {import('jest').Config} */
module.exports = {
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest", 
      { tsconfig: "tsconfig.json" }
    ],
  },
  moduleNameMapper: {
    "@/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
  ],
};
