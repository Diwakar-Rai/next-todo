import type { Config } from "jest";
const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverage: true,
  collectCoverageFrom: [
    "src/lib/**/*.ts",
    "!src/lib/db.ts",
    "!src/lib/swagger.ts",
  ],
  setupFilesAfterEnv: ["<rootDir>/src/test/jest.setup.ts"],
};

export default config;
