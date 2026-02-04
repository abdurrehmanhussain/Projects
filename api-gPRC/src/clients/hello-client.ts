import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import * as path from 'path';
import { BaseGrpcClient } from './base-client';
import { GrpcConfig } from '../config/grpc.config';
import { HelloRequest, HelloResponse } from '../types/hello.types';

/**
 * gRPC Client for Hello service
 * Demonstrates all four gRPC communication patterns
 */
export class HelloClient extends BaseGrpcClient {
  constructor(useTLS: boolean = false) {
    super(useTLS);
    this.initializeClient();
  }

  private initializeClient(): void {
    const protoPath = path.join(__dirname, '../../protos/hello.proto');
    const packageDefinition = protoLoader.loadSync(protoPath, GrpcConfig.protoLoaderOptions);
    const grpcObject = grpc.loadPackageDefinition(packageDefinition);
    const HelloService = (grpcObject.hello as any).HelloService;
    this.client = new HelloService(this.address, this.credentials);
  }

  // ==================== CRUD-Like Operations ====================

  /**
   * CREATE: Send a greeting (simulates creating a new greeting)
   * @param greeting - The greeting message to send
   */
  async create(greeting: string): Promise<HelloResponse> {
    return this.sayHello(greeting);
  }

  /**
   * READ: Get a greeting response
   * @param greeting - The greeting to read/echo
   */
  async read(greeting: string): Promise<HelloResponse> {
    return this.sayHello(greeting);
  }

  /**
   * UPDATE: Update a greeting (send a new greeting)
   * @param greeting - The updated greeting message
   */
  async update(greeting: string): Promise<HelloResponse> {
    return this.sayHello(greeting);
  }

  /**
   * DELETE: Delete/clear greeting (send empty greeting)
   */
  async delete(): Promise<HelloResponse> {
    return this.sayHello('');
  }

  // ==================== Service Methods ====================

  /**
   * Unary RPC: Send a greeting and receive a response
   * @param greeting - The greeting message
   */
  async sayHello(greeting: string): Promise<HelloResponse> {
    return this.promisifyUnary<HelloRequest, HelloResponse>(
      this.client.SayHello,
      { greeting }
    );
  }

  /**
   * Server Streaming: Receive multiple replies for one greeting
   * @param greeting - The greeting message
   */
  lotsOfReplies(greeting: string): grpc.ClientReadableStream<HelloResponse> {
    return this.client.LotsOfReplies({ greeting });
  }

  /**
   * Client Streaming: Send multiple greetings and receive one response
   * @param callback - Callback for the final response
   */
  lotsOfGreetings(
    callback: (error: grpc.ServiceError | null, response: HelloResponse) => void
  ): grpc.ClientWritableStream<HelloRequest> {
    return this.client.LotsOfGreetings(callback);
  }

  /**
   * Bidirectional Streaming: Send and receive multiple messages
   */
  bidiHello(): grpc.ClientDuplexStream<HelloRequest, HelloResponse> {
    return this.client.BidiHello();
  }

  // ==================== Helper Methods ====================

  /**
   * Collect all responses from a server stream
   * @param greeting - The greeting to send
   */
  async collectServerStreamResponses(greeting: string): Promise<HelloResponse[]> {
    return new Promise((resolve, reject) => {
      const responses: HelloResponse[] = [];
      const stream = this.lotsOfReplies(greeting);

      stream.on('data', (response: HelloResponse) => {
        responses.push(response);
      });

      stream.on('error', (error: Error) => {
        reject(error);
      });

      stream.on('end', () => {
        resolve(responses);
      });
    });
  }

  /**
   * Send multiple greetings via client stream
   * @param greetings - Array of greetings to send
   */
  async sendMultipleGreetings(greetings: string[]): Promise<HelloResponse> {
    return new Promise((resolve, reject) => {
      const stream = this.lotsOfGreetings((error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });

      greetings.forEach((greeting) => {
        stream.write({ greeting });
      });

      stream.end();
    });
  }
}
