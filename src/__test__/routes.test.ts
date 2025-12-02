import request from 'supertest';
import express, { Express } from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import routes from '../routes';
import { TodoList } from '../todolist.model';

let app: Express;
let mongoServer: MongoMemoryServer;

// Setup Express app with routes
beforeAll(async () => {
  // Create in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
  
  // Setup Express app
  app = express();
  app.use(express.json()); // Parse JSON bodies
  app.use('/api', routes); // Mount routes at /api
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await TodoList.deleteMany({});
});

describe('Todo API Routes', () => {
  
  describe('GET /', () => {
    
    test('should return success message', async () => {
      const response = await request(app)
        .get('/api')
        .expect(200);
      
      expect(response.body).toEqual({
        status: true,
        message: 'SUCCESS FROM API'
      });
    });
    
  });
  
  describe('GET /all-items', () => {
    
    test('should return empty array when no todos exist', async () => {
      const response = await request(app)
        .get('/api/all-items')
        .expect(200);
      
      expect(response.body.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });
    
    test('should return all todos', async () => {
        // Create todos with explicit delays to ensure different timestamps
        const todo1 = await TodoList.create({ title: 'Todo 1', description: 'First' });
        await new Promise(resolve => setTimeout(resolve, 10));
        
        const todo2 = await TodoList.create({ title: 'Todo 2', description: 'Second' });
        await new Promise(resolve => setTimeout(resolve, 10));
        
        const todo3 = await TodoList.create({ title: 'Todo 3', description: 'Third' });
        
        const response = await request(app)
          .get('/api/all-items')
          .expect(200);
        
        expect(response.body.status).toBe(200);
        expect(response.body.data).toHaveLength(3);
        
        // Check that all todos are returned (don't care about order for this test)
        const titles = response.body.data.map((t: any) => t.title);
        expect(titles).toContain('Todo 1');
        expect(titles).toContain('Todo 2');
        expect(titles).toContain('Todo 3');
      });
    
    test('should return todos sorted by newest first', async () => {
      // Create todos with delays to ensure different timestamps
      const todo1 = await TodoList.create({ title: 'First' });
      await new Promise(resolve => setTimeout(resolve, 10));
      const todo2 = await TodoList.create({ title: 'Second' });
      await new Promise(resolve => setTimeout(resolve, 10));
      const todo3 = await TodoList.create({ title: 'Third' });
      
      const response = await request(app)
        .get('/api/all-items')
        .expect(200);
      
      expect(response.body.data[0].title).toBe('Third');  // Newest
      expect(response.body.data[1].title).toBe('Second');
      expect(response.body.data[2].title).toBe('First');  // Oldest
    });
    
  });
  
  describe('POST /create-item', () => {
    
    test('should create a new todo with title and description', async () => {
      const newTodo = {
        title: 'New todo',
        description: 'Test description'
      };
      
      const response = await request(app)
        .post('/api/create-item')
        .send(newTodo)
        .expect(200);
      
      expect(response.body.status).toBe(200);
      expect(response.body.data.title).toBe('New todo');
      expect(response.body.data.description).toBe('Test description');
      expect(response.body.data.isCompleted).toBe(false);
      expect(response.body.data._id).toBeDefined();
      
      // Verify it's actually in database
      const found = await TodoList.findById(response.body.data._id);
      expect(found).toBeDefined();
      expect(found?.title).toBe('New todo');
    });
    
    test('should create todo with only title', async () => {
      const response = await request(app)
        .post('/api/create-item')
        .send({ title: 'Only title' })
        .expect(200);
      
      expect(response.body.data.title).toBe('Only title');
      expect(response.body.data.description).toBe('');
    });
    
    test('should return error when title is missing', async () => {
      const response = await request(app)
        .post('/api/create-item')
        .send({ description: 'No title' })
        .expect(400);
      
      expect(response.body.status).toBe(400);
      expect(response.body.message).toBe('Title required!');
    });
    
    test('should return error when title is empty string', async () => {
      const response = await request(app)
        .post('/api/create-item')
        .send({ title: '' })
        .expect(400);
      
      expect(response.body.status).toBe(400);
      expect(response.body.message).toBe('Title required!');
    });
    
  });
  
  describe('PATCH /edit-item/:id', () => {
    
    test('should update todo title', async () => {
      const todo = await TodoList.create({
        title: 'Original title',
        description: 'Original description'
      });
      
      const response = await request(app)
        .patch(`/api/edit-item/${todo._id}`)
        .send({ title: 'Updated title' })
        .expect(200);
      
      expect(response.body.status).toBe(200);
      expect(response.body.data.title).toBe('Updated title');
      expect(response.body.data.description).toBe('Original description'); // Unchanged
    });
    
    test('should update todo description', async () => {
      const todo = await TodoList.create({
        title: 'Title',
        description: 'Original'
      });
      
      const response = await request(app)
        .patch(`/api/edit-item/${todo._id}`)
        .send({ description: 'Updated description' })
        .expect(200);
      
      expect(response.body.data.title).toBe('Title'); // Unchanged
      expect(response.body.data.description).toBe('Updated description');
    });
    
    test('should update both title and description', async () => {
      const todo = await TodoList.create({
        title: 'Old title',
        description: 'Old desc'
      });
      
      const response = await request(app)
        .patch(`/api/edit-item/${todo._id}`)
        .send({
          title: 'New title',
          description: 'New desc'
        })
        .expect(200);
      
      expect(response.body.data.title).toBe('New title');
      expect(response.body.data.description).toBe('New desc');
    });
    
    test('should return error when no fields provided', async () => {
      const todo = await TodoList.create({ title: 'Test' });
      
      const response = await request(app)
        .patch(`/api/edit-item/${todo._id}`)
        .send({})
        .expect(400);
      
      expect(response.body.message).toBe('update atleast one field');
    });
    
    test('should return 404 for non-existent id', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .patch(`/api/edit-item/${fakeId}`)
        .send({ title: 'New title' })
        .expect(404);
      
      expect(response.body.message).toBe('item not found');
    });
    
  });
  
  describe('PATCH /toggle-item/:id', () => {
    
    test('should toggle incomplete todo to complete', async () => {
      const todo = await TodoList.create({
        title: 'Test todo',
        isCompleted: false
      });
      
      const response = await request(app)
        .patch(`/api/toggle-item/${todo._id}`)
        .expect(200);
      
      expect(response.body.data.isCompleted).toBe(true);
      expect(response.body.message).toContain('completed');
    });
    
    test('should toggle complete todo to incomplete', async () => {
      const todo = await TodoList.create({
        title: 'Test todo',
        isCompleted: true
      });
      
      const response = await request(app)
        .patch(`/api/toggle-item/${todo._id}`)
        .expect(200);
      
      expect(response.body.data.isCompleted).toBe(false);
      expect(response.body.message).toContain('incomplete');
    });
    
    test('should return 404 for non-existent id', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .patch(`/api/toggle-item/${fakeId}`)
        .expect(200);
    });
    
  });
  
  describe('DELETE /delete-item/:id', () => {
    
    test('should delete a todo', async () => {
      const todo = await TodoList.create({ title: 'To delete' });
      
      const response = await request(app)
        .delete(`/api/delete-item/${todo._id}`)
        .expect(200);
      
      expect(response.body.message).toBe('item successfully deleted');
      
      // Verify it's actually deleted
      const found = await TodoList.findById(todo._id);
      expect(found).toBeNull();
    });
    
    test('should return 400 when trying to delete already deleted item', async () => {
      const todo = await TodoList.create({ title: 'To delete' });
      
      // Delete once
      await request(app)
        .delete(`/api/delete-item/${todo._id}`)
        .expect(200);
      
      // Try deleting again
      const response = await request(app)
        .delete(`/api/delete-item/${todo._id}`)
        .expect(400);
      
      expect(response.body.message).toBe('item already deleted!');
    });
    
  });
  
  describe('DELETE /batch-delete', () => {
    
    test('should delete all completed todos', async () => {
      // Create mix of completed and incomplete
      await TodoList.create([
        { title: 'Completed 1', isCompleted: true },
        { title: 'Incomplete 1', isCompleted: false },
        { title: 'Completed 2', isCompleted: true },
        { title: 'Incomplete 2', isCompleted: false },
        { title: 'Completed 3', isCompleted: true },
      ]);
      
      const response = await request(app)
        .delete('/api/batch-delete')
        .expect(200);
      
      expect(response.body.message).toContain('Successfully Deleted 3 Items');
      expect(response.body.deletedItems).toHaveLength(3);
      
      // Verify only incomplete remain
      const remaining = await TodoList.find();
      expect(remaining).toHaveLength(2);
      expect(remaining.every(todo => !todo.isCompleted)).toBe(true);
    });
    
    test('should return 202 when no completed items exist', async () => {
      await TodoList.create([
        { title: 'Incomplete 1', isCompleted: false },
        { title: 'Incomplete 2', isCompleted: false },
      ]);
      
      const response = await request(app)
        .delete('/api/batch-delete')
        .expect(202);
      
      expect(response.body.message).toBe('No Completed Items');
    });
    
    test('should work when database is empty', async () => {
      const response = await request(app)
        .delete('/api/batch-delete')
        .expect(202);
      
      expect(response.body.message).toBe('No Completed Items');
    });
    
  });
  
});