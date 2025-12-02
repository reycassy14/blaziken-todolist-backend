import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { TodoList, ITodoListData } from '../todolist.model';

let mongoServer: MongoMemoryServer;

// Setup: Connect to in-memory database before all tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

// Cleanup: Disconnect and stop server after all tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Clear database between each test so they don't interfere
afterEach(async () => {
  await TodoList.deleteMany({});
});

describe('TodoList Model', () => {
  
  describe('Creating todos', () => {
    
    test('should create a todo with valid data', async () => {
      // Arrange
      const todoData = {
        title: 'Buy groceries',
        description: 'Milk, eggs, bread',
      };
      
      // Act
      const todo = await TodoList.create(todoData);
      
      // Assert
      expect(todo.title).toBe('Buy groceries');
      expect(todo.description).toBe('Milk, eggs, bread');
      expect(todo.isCompleted).toBe(false); // Should default to false
      expect(todo._id).toBeDefined();
      expect(todo.createdAt).toBeDefined();
    });
    
    test('should create todo with only title (description optional)', async () => {
      const todo = await TodoList.create({
        title: 'Test todo'
      });
      
      expect(todo.title).toBe('Test todo');
      expect(todo.description).toBe(''); // Should default to empty string
      expect(todo.isCompleted).toBe(false);
    });
    
    test('should set isCompleted to false by default', async () => {
      const todo = await TodoList.create({
        title: 'Default completion test'
      });
      
      expect(todo.isCompleted).toBe(false);
    });
    
    test('should set createdAt automatically', async () => {
      const beforeCreate = new Date();
      
      const todo = await TodoList.create({
        title: 'Timestamp test'
      });
      
      const afterCreate = new Date();
      
      expect(todo.createdAt).toBeDefined();
      expect(todo.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(todo.createdAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
    });
    
  });
  
  describe('Field validations', () => {
    
    test('should allow creating todo with isCompleted true', async () => {
      const todo = await TodoList.create({
        title: 'Already done',
        isCompleted: true
      });
      
      expect(todo.isCompleted).toBe(true);
    });
    
    test('should save and retrieve todo correctly', async () => {
      // Create
      const created = await TodoList.create({
        title: 'Test persistence',
        description: 'Testing if save works'
      });
      
      // Retrieve
      const found = await TodoList.findById(created._id);
      
      expect(found).toBeDefined();
      expect(found?.title).toBe('Test persistence');
      expect(found?.description).toBe('Testing if save works');
    });
    
  });
  
  describe('Updating todos', () => {
    
    test('should update todo fields', async () => {
      // Create initial todo
      const todo = await TodoList.create({
        title: 'Original title',
        description: 'Original description'
      });
      
      // Update
      const updated = await TodoList.findByIdAndUpdate(
        todo._id,
        { title: 'Updated title', description: 'Updated description' },
        { new: true }
      );
      
      expect(updated?.title).toBe('Updated title');
      expect(updated?.description).toBe('Updated description');
    });
    
    test('should toggle isCompleted status', async () => {
      const todo = await TodoList.create({
        title: 'Toggle test',
        isCompleted: false
      });
      
      // Toggle to true
      const toggled = await TodoList.findByIdAndUpdate(
        todo._id,
        { isCompleted: true },
        { new: true }
      );
      
      expect(toggled?.isCompleted).toBe(true);
    });
    
  });
  
  describe('Deleting todos', () => {
    
    test('should delete a todo', async () => {
      const todo = await TodoList.create({
        title: 'To be deleted'
      });
      
      await TodoList.findByIdAndDelete(todo._id);
      
      const found = await TodoList.findById(todo._id);
      expect(found).toBeNull();
    });
    
    test('should delete multiple completed todos', async () => {
      // Create mix of completed and incomplete
      await TodoList.create([
        { title: 'Todo 1', isCompleted: true },
        { title: 'Todo 2', isCompleted: false },
        { title: 'Todo 3', isCompleted: true },
        { title: 'Todo 4', isCompleted: false },
      ]);
      
      // Delete all completed
      const result = await TodoList.deleteMany({ isCompleted: true });
      
      expect(result.deletedCount).toBe(2);
      
      // Verify only incomplete remain
      const remaining = await TodoList.find();
      expect(remaining).toHaveLength(2);
      expect(remaining.every(todo => !todo.isCompleted)).toBe(true);
    });
    
  });
  
});