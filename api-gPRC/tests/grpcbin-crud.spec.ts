import { test, expect } from '@playwright/test';
import { GrpcBinClient } from '../src/clients/grpcbin-client';
import { DummyMessage, DummyEnum } from '../src/types/grpcbin.types';

/**
 * CRUD Operations Test Suite for GRPCBin Service
 * Tests Create, Read, Update, Delete patterns using gRPC
 */
test.describe('GRPCBin CRUD Operations @grpc', () => {
  let client: GrpcBinClient;

  test.beforeEach(async () => {
    client = new GrpcBinClient(false); // Use non-TLS for testing
  });

  test.afterEach(async () => {
    client.close();
  });

  test.describe('CREATE Operations', () => {
    test('should create a simple DummyMessage', async () => {
      const message: DummyMessage = {
        f_string: 'Test message',
        f_int32: 42,
        f_bool: true,
      };

      const response = await client.create(message);

      expect(response).toBeDefined();
      expect(response.f_string).toBe(message.f_string);
      expect(response.f_int32).toBe(message.f_int32);
      expect(response.f_bool).toBe(message.f_bool);
    });

    test('should create a DummyMessage with nested data', async () => {
      const message: DummyMessage = {
        f_string: 'Parent message',
        f_sub: {
          f_string: 'Nested message',
        },
        f_subs: [
          { f_string: 'Nested 1' },
          { f_string: 'Nested 2' },
        ],
      };

      const response = await client.create(message);

      expect(response.f_sub?.f_string).toBe('Nested message');
      expect(response.f_subs).toHaveLength(2);
      expect(response.f_subs?.[0].f_string).toBe('Nested 1');
    });

    test('should create a DummyMessage with array fields', async () => {
      const message: DummyMessage = {
        f_strings: ['one', 'two', 'three'],
        f_int32s: [1, 2, 3],
        f_bools: [true, false, true],
      };

      const response = await client.create(message);

      expect(response.f_strings).toEqual(['one', 'two', 'three']);
      expect(response.f_int32s).toEqual([1, 2, 3]);
      expect(response.f_bools).toEqual([true, false, true]);
    });

    test('should create a DummyMessage with enum fields', async () => {
      const message: DummyMessage = {
        f_string: 'Enum test',
        f_enum: DummyEnum.ENUM_1,
        f_enums: [DummyEnum.ENUM_0, DummyEnum.ENUM_2],
      };

      const response = await client.create(message);

      expect(response.f_enum).toBe(DummyEnum.ENUM_1);
      expect(response.f_enums).toContain(DummyEnum.ENUM_0);
      expect(response.f_enums).toContain(DummyEnum.ENUM_2);
    });
  });

  test.describe('READ Operations', () => {
    test('should read service index information', async () => {
      const response = await client.read();

      expect(response).toBeDefined();
      expect(response.description).toBeDefined();
      expect(response.endpoints).toBeDefined();
      expect(Array.isArray(response.endpoints)).toBe(true);
    });

    test('should read available endpoints', async () => {
      const response = await client.getIndex();

      expect(response.endpoints.length).toBeGreaterThan(0);
      response.endpoints.forEach((endpoint) => {
        expect(endpoint.path).toBeDefined();
        expect(endpoint.description).toBeDefined();
      });
    });

    test('should read response headers', async () => {
      const response = await client.getHeaders();

      expect(response).toBeDefined();
      expect(response.Metadata).toBeDefined();
    });
  });

  test.describe('UPDATE Operations', () => {
    test('should update a DummyMessage with new values', async () => {
      // First create
      const originalMessage: DummyMessage = {
        f_string: 'Original value',
        f_int32: 100,
      };

      const originalResponse = await client.create(originalMessage);
      expect(originalResponse.f_string).toBe('Original value');

      // Then update
      const updatedMessage: DummyMessage = {
        f_string: 'Updated value',
        f_int32: 200,
      };

      const updatedResponse = await client.update(updatedMessage);

      expect(updatedResponse.f_string).toBe('Updated value');
      expect(updatedResponse.f_int32).toBe(200);
    });

    test('should update nested structures', async () => {
      const message: DummyMessage = {
        f_sub: {
          f_string: 'Updated nested value',
        },
      };

      const response = await client.update(message);

      expect(response.f_sub?.f_string).toBe('Updated nested value');
    });

    test('should update array fields', async () => {
      const message: DummyMessage = {
        f_strings: ['updated', 'array', 'values'],
      };

      const response = await client.update(message);

      expect(response.f_strings).toEqual(['updated', 'array', 'values']);
    });
  });

  test.describe('DELETE Operations', () => {
    test('should successfully execute delete operation', async () => {
      const response = await client.delete();

      expect(response).toBeDefined();
      // Empty response indicates successful deletion
      expect(Object.keys(response).length).toBe(0);
    });

    test('should handle empty operation', async () => {
      const response = await client.empty();

      expect(response).toBeDefined();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle specific gRPC errors', async () => {
      try {
        await client.triggerError(3, 'Invalid argument');
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toContain('gRPC Error');
        expect(error.code).toBe(3); // INVALID_ARGUMENT
      }
    });

    test('should handle NOT_FOUND error', async () => {
      try {
        await client.triggerError(5, 'Resource not found');
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.code).toBe(5); // NOT_FOUND
      }
    });
  });
});
