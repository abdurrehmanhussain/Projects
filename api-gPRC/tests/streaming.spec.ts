import { test, expect } from '@playwright/test';
import { GrpcBinClient } from '../src/clients/grpcbin-client';
import { DummyMessage } from '../src/types/grpcbin.types';

/**
 * Streaming Operations Test Suite
 * Tests all gRPC streaming patterns: server, client, and bidirectional
 */
test.describe('gRPC Streaming Operations @grpc', () => {
  let client: GrpcBinClient;

  test.beforeEach(async () => {
    client = new GrpcBinClient(false);
  });

  test.afterEach(async () => {
    client.close();
  });

  test.describe('Server Streaming', () => {
    test('should receive multiple messages from server stream', async () => {
      const message: DummyMessage = {
        f_string: 'Server stream test',
        f_int32: 123,
      };

      const responses: DummyMessage[] = [];

      await new Promise<void>((resolve, reject) => {
        const stream = client.serverStream(message);

        stream.on('data', (response: DummyMessage) => {
          responses.push(response);
        });

        stream.on('error', (error: Error) => {
          reject(error);
        });

        stream.on('end', () => {
          resolve();
        });
      });

      expect(responses.length).toBeGreaterThan(0);
      // grpcb.in sends back 10 copies of the message
      expect(responses.length).toBe(10);
      responses.forEach((response) => {
        expect(response.f_string).toBe(message.f_string);
        expect(response.f_int32).toBe(message.f_int32);
      });
    });

    test('should handle server stream with complex data', async () => {
      const message: DummyMessage = {
        f_string: 'Complex stream',
        f_sub: { f_string: 'Nested' },
        f_strings: ['a', 'b', 'c'],
      };

      const responses: DummyMessage[] = [];

      await new Promise<void>((resolve, reject) => {
        const stream = client.serverStream(message);

        stream.on('data', (response: DummyMessage) => {
          responses.push(response);
        });

        stream.on('error', reject);
        stream.on('end', resolve);
      });

      expect(responses.length).toBe(10);
      responses.forEach((response) => {
        expect(response.f_sub?.f_string).toBe('Nested');
        expect(response.f_strings).toEqual(['a', 'b', 'c']);
      });
    });
  });

  test.describe('Client Streaming', () => {
    test('should send multiple messages via client stream', async () => {
      const messages: DummyMessage[] = Array.from({ length: 10 }, (_, i) => ({
        f_string: `Message ${i + 1}`,
        f_int32: i + 1,
      }));

      const response = await new Promise<DummyMessage>((resolve, reject) => {
        const stream = client.clientStream((error, response) => {
          if (error) {
            reject(error);
          } else {
            resolve(response);
          }
        });

        messages.forEach((message) => {
          stream.write(message);
        });

        stream.end();
      });

      // Server returns the last message received
      expect(response).toBeDefined();
      expect(response.f_string).toBe('Message 10');
      expect(response.f_int32).toBe(10);
    });

    test('should handle minimum required messages in client stream', async () => {
      // Note: grpcb.in expects exactly 10 messages for client streaming
      const messages: DummyMessage[] = Array.from({ length: 10 }, (_, i) => ({
        f_string: `Batch message ${i + 1}`,
        f_int32: i + 100,
      }));

      const response = await new Promise<DummyMessage>((resolve, reject) => {
        const stream = client.clientStream((error, response) => {
          if (error) reject(error);
          else resolve(response);
        });

        messages.forEach((msg) => stream.write(msg));
        stream.end();
      });

      // Server returns the last message
      expect(response.f_string).toBe('Batch message 10');
      expect(response.f_int32).toBe(109);
    });
  });

  test.describe('Bidirectional Streaming', () => {
    test('should handle bidirectional communication', async () => {
      const sentMessages: DummyMessage[] = [];
      const receivedMessages: DummyMessage[] = [];

      await new Promise<void>((resolve, reject) => {
        const stream = client.bidirectionalStream();
        let messagesToSend = 5;
        let messagesReceived = 0;

        stream.on('data', (response: DummyMessage) => {
          receivedMessages.push(response);
          messagesReceived++;

          if (messagesReceived >= messagesToSend) {
            stream.end();
          }
        });

        stream.on('error', reject);
        stream.on('end', resolve);

        // Send messages
        for (let i = 0; i < messagesToSend; i++) {
          const message: DummyMessage = {
            f_string: `Bidi message ${i + 1}`,
            f_int32: i + 1,
          };
          sentMessages.push(message);
          stream.write(message);
        }
      });

      expect(sentMessages.length).toBe(5);
      expect(receivedMessages.length).toBe(5);

      // Verify echo behavior - each sent message should be echoed back
      for (let i = 0; i < sentMessages.length; i++) {
        expect(receivedMessages[i].f_string).toBe(sentMessages[i].f_string);
        expect(receivedMessages[i].f_int32).toBe(sentMessages[i].f_int32);
      }
    });

    test('should handle interleaved send and receive', async () => {
      const receivedMessages: DummyMessage[] = [];

      await new Promise<void>((resolve, reject) => {
        const stream = client.bidirectionalStream();
        let sendCount = 0;
        const maxSend = 3;

        stream.on('data', (response: DummyMessage) => {
          receivedMessages.push(response);

          // Send another message after receiving
          if (sendCount < maxSend) {
            sendCount++;
            stream.write({
              f_string: `Follow-up ${sendCount}`,
              f_int32: sendCount,
            });
          } else {
            stream.end();
          }
        });

        stream.on('error', reject);
        stream.on('end', resolve);

        // Start the conversation
        stream.write({
          f_string: 'Initial message',
          f_int32: 0,
        });
      });

      expect(receivedMessages.length).toBeGreaterThan(0);
    });
  });

  test.describe('Stream Error Handling', () => {
    test('should handle stream cancellation gracefully', async () => {
      const message: DummyMessage = {
        f_string: 'Cancelled stream',
      };

      const responses: DummyMessage[] = [];

      await new Promise<void>((resolve) => {
        const stream = client.serverStream(message);

        stream.on('data', (response: DummyMessage) => {
          responses.push(response);
          // Cancel after receiving first message
          stream.cancel();
        });

        stream.on('error', () => {
          // Expected - stream was cancelled
          resolve();
        });

        stream.on('end', resolve);
      });

      // Should have received at least one message before cancellation
      expect(responses.length).toBeGreaterThanOrEqual(1);
    });
  });
});
