module.exports = {
    // Tell Jest to use ts-jest for TypeScript files
    preset: 'ts-jest',
    
    // Run tests in Node environment (not browser)
    testEnvironment: 'node',
    
    // Where to find test files
    testMatch: [
      '**/__tests__/**/*.ts',  // Files in __tests__ folders
      '**/*.test.ts',          // Files ending in .test.ts
      '**/*.spec.ts'           // Files ending in .spec.ts
    ],
    
    // Ignore these folders when looking for tests
    testPathIgnorePatterns: [
      '/node_modules/',
      '/dist/'
    ],
    
    // Coverage settings (what % of code is tested)
    collectCoverageFrom: [
      'src/**/*.ts',           // Check all TypeScript files in src/
      '!src/**/*.d.ts',        // Ignore type definition files
    ],
    
    // Show detailed test results
    verbose: true,
  };