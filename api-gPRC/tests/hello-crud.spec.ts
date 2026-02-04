import { test, expect } from '@playwright/test';
import { HelloClient } from '../src/clients/hello-client';

/**
 * CRUD Operations Test Suite for Hello Service
 * Demonstrates gRPC communication patterns with CRUD-like operations
 */
test.describe('Hello Service CRUD Operations @grpc', () => {
  let client: HelloClient;

  test.beforeEach(async () => {
    client = new HelloClient(false); // Use non-TLS for testing
  });

  test.afterEach(async () => {
    client.close();
  });

  test.describe('CREATE Operations', () => {
    test('should create a new greeting', async () => {
      const greeting = 'Hello from test!';

      const response = await client.create(greeting);

      expect(response).toBeDefined();
      expect(response.reply).toBeDefined();
      expect(response.reply.length).toBeGreaterThan(0);
    });

    test('should create greeting with special characters', async () => {
      const greeting = 'Hello! @#$%^&*()';

      const response = await client.create(greeting);

      expect(response).toBeDefined();
      expect(response.reply).toBeDefined();
    });

    test('should create greeting with unicode', async () => {
      const greeting = 'Hello 你好 مرحبا שלום';

      const response = await client.create(greeting);

      expect(response).toBeDefined();
      expect(response.reply).toBeDefined();
    });
  });

  test.describe('READ Operations', () => {
    test('should read a greeting response', async () => {
      const greeting = 'Read this greeting';

      const response = await client.read(greeting);

      expect(response).toBeDefined();
      expect(response.reply).toBeDefined();
    });

    test('should read empty greeting', async () => {
      const response = await client.read('');

      expect(response).toBeDefined();
    });

    test('should read long greeting', async () => {
      const longGreeting = 'A'.repeat(1000);

      const response = await client.read(longGreeting);

      expect(response).toBeDefined();
      expect(response.reply).toBeDefined();
    });
  });

  test.describe('UPDATE Operations', () => {
    test('should update greeting message', async () => {
      // First create
      const original = 'Original greeting';
      const originalResponse = await client.create(original);
      expect(originalResponse).toBeDefined();

      // Then update
      const updated = 'Updated greeting';
      const updatedResponse = await client.update(updated);

      expect(updatedResponse).toBeDefined();
      expect(updatedResponse.reply).toBeDefined();
    });

    test('should update with different content', async () => {
      const updates = ['First', 'Second', 'Third'];

      for (const update of updates) {
        const response = await client.update(update);
        expect(response).toBeDefined();
        expect(response.reply).toBeDefined();
      }
    });
  });

  test.describe('DELETE Operations', () => {
    test('should delete (clear) greeting', async () => {
      // Create first
      await client.create('To be deleted');

      // Delete
      const response = await client.delete();

      expect(response).toBeDefined();
    });
  });

  test.describe('Unary RPC Pattern', () => {
    test('should perform unary call successfully', async () => {
      const response = await client.sayHello('Unary test');

      expect(response).toBeDefined();
      expect(response.reply).toBeDefined();
    });

    test('should handle multiple sequential unary calls', async () => {
      const greetings = ['Hello 1', 'Hello 2', 'Hello 3'];
      const responses = [];

      for (const greeting of greetings) {
        const response = await client.sayHello(greeting);
        responses.push(response);
      }

      expect(responses).toHaveLength(3);
      responses.forEach((response) => {
        expect(response.reply).toBeDefined();
      });
    });
  });

  test.describe('Server Streaming Pattern', () => {
    test('should receive multiple responses from server stream', async () => {
      const responses = await client.collectServerStreamResponses('Stream test');

      expect(Array.isArray(responses)).toBe(true);
      expect(responses.length).toBeGreaterThan(0);
      responses.forEach((response) => {
        expect(response.reply).toBeDefined();
      });
    });
  });

  test.describe('Client Streaming Pattern', () => {
    test('should send multiple greetings and receive aggregated response', async () => {
      const greetings = ['Greeting 1', 'Greeting 2', 'Greeting 3'];

      const response = await client.sendMultipleGreetings(greetings);

      expect(response).toBeDefined();
      expect(response.reply).toBeDefined();
    });

    test('should handle single greeting in client stream', async () => {
      const response = await client.sendMultipleGreetings(['Single greeting']);

      expect(response).toBeDefined();
    });
  });

  test.describe('Connection Management', () => {
    test('should wait for client to be ready', async () => {
      const newClient = new HelloClient(false);

      await expect(newClient.waitForReady(5000)).resolves.not.toThrow();

      newClient.close();
    });

    test('should close client connection properly', async () => {
      const newClient = new HelloClient(false);
      await newClient.waitForReady(5000);

      newClient.close();

      // Attempting operations after close should fail or be handled gracefully
    });
  });
});
