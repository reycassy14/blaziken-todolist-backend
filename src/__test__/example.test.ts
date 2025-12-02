// This is a simple test to verify Jest is working

describe('Example Test Suite', () => {
  
    test('basic math works', () => {
      // Arrange: Set up test data
      const a = 2;
      const b = 3;
      
      // Act: Perform the action
      const result = a + b;
      
      // Assert: Check if result is correct
      expect(result).toBe(5);
    });
    
    test('strings can be compared', () => {
      const greeting = 'Hello, World!';
      
      expect(greeting).toBe('Hello, World!');
      expect(greeting).toContain('World');
      expect(greeting.length).toBeGreaterThan(5);
    });
    
  });