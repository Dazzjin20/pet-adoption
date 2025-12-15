module.exports = {
  projects: [
  
    {
      displayName: 'backend',
      testEnvironment: 'node',
      // Look for tests in the top-level 'tests' folder
      testMatch: ['<rootDir>/tests/__tests__/**/*.test.js'],
      setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
      testTimeout: 15000, // Increased timeout for integration tests
      collectCoverageFrom: [
        'backend/src/**/*.js',
        '!backend/src/config/database.js',
        '!backend/src/models/index.js',
        '!backend/server.js'
      ],
    },
  
    {
      displayName: 'frontend',
      testEnvironment: 'jsdom',
      rootDir: 'frontend',
      testMatch: ['<rootDir>/tests/**/*.test.js'],
      
    },
  ],
  // Global coverage settings
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
};