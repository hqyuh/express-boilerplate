import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  collectCoverage: true,
  collectCoverageFrom: ['**/modules/**/*.ts'],
  moduleDirectories: ['node_modules', __dirname],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'graphql', 'json', 'node'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  roots: ['<rootDir>/src'],
  setupFiles: ['<rootDir>/src/__tests__/.jest/setEnvVars.ts'],
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.+(ts|tsx|js)'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testTimeout: 30_000,
};

export default config;
