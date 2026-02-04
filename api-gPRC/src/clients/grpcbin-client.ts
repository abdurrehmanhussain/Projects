import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import * as path from 'path';
import { BaseGrpcClient } from './base-client';
import { GrpcConfig } from '../config/grpc.config';
import {
  DummyMessage,
  EmptyMessage,
  IndexReply,
  HeadersMessage,
  SpecificErrorRequest,
} from '../types/grpcbin.types';

/**
 * gRPC Client for GRPCBin service
 * Provides methods for testing various gRPC patterns including CRUD-like operations
 */
export class GrpcBinClient extends BaseGrpcClient {
  constructor(useTLS: boolean = false) {
    super(useTLS);
    this.initializeClient();
  }

  private initializeClient(): void {
    const protoPath = path.join(__dirname, '../../protos/grpcbin.proto');
    const packageDefinition = protoLoader.loadSync(protoPath, GrpcConfig.protoLoaderOptions);
    const grpcObject = grpc.loadPackageDefinition(packageDefinition);
    const GRPCBinService = (grpcObject.grpcbin as any).GRPCBin;
    this.client = new GRPCBinService(this.address, this.credentials);
  }

  // ==================== CRUD-Like Operations ====================

  /**
   * CREATE: Send a DummyMessage and receive it back (simulates create operation)
   * @param message - The DummyMessage to send
   */
  async create(message: DummyMessage): Promise<DummyMessage> {
    return this.promisifyUnary<DummyMessage, DummyMessage>(
      this.client.DummyUnary,
      message
    );
  }

  /**
   * READ: Get the service index information
   */
  async read(): Promise<IndexReply> {
    return this.promisifyUnary<EmptyMessage, IndexReply>(
      this.client.Index,
      {}
    );
  }

  /**
   * UPDATE: Send an updated DummyMessage and receive it back
   * @param message - The updated DummyMessage
   */
  async update(message: DummyMessage): Promise<DummyMessage> {
    return this.promisifyUnary<DummyMessage, DummyMessage>(
      this.client.DummyUnary,
      message
    );
  }

  /**
   * DELETE: Simulates delete by sending an empty message
   * (grpcb.in doesn't have actual delete, this is a placeholder pattern)
   */
  async delete(): Promise<EmptyMessage> {
    return this.promisifyUnary<EmptyMessage, EmptyMessage>(
      this.client.Empty,
      {}
    );
  }

  // ==================== Additional Service Methods ====================

  /**
   * Get service index and available endpoints
   */
  async getIndex(): Promise<IndexReply> {
    return this.promisifyUnary<EmptyMessage, IndexReply>(
      this.client.Index,
      {}
    );
  }

  /**
   * Send empty message and receive empty response
   */
  async empty(): Promise<EmptyMessage> {
    return this.promisifyUnary<EmptyMessage, EmptyMessage>(
      this.client.Empty,
      {}
    );
  }

  /**
   * Unary call that echoes back the received message
   * @param message - The DummyMessage to echo
   */
  async dummyUnary(message: DummyMessage): Promise<DummyMessage> {
    return this.promisifyUnary<DummyMessage, DummyMessage>(
      this.client.DummyUnary,
      message
    );
  }

  /**
   * Get response headers/metadata
   */
  async getHeaders(): Promise<HeadersMessage> {
    return this.promisifyUnary<EmptyMessage, HeadersMessage>(
      this.client.HeadersUnary,
      {}
    );
  }

  /**
   * Trigger a specific gRPC error
   * @param code - The gRPC error code
   * @param reason - The error reason/message
   */
  async triggerError(code: number, reason: string): Promise<EmptyMessage> {
    return this.promisifyUnary<SpecificErrorRequest, EmptyMessage>(
      this.client.SpecificError,
      { code, reason }
    );
  }

  // ==================== Streaming Operations ====================

  /**
   * Server streaming: Receive multiple DummyMessages
   * @param message - The initial DummyMessage to send
   */
  serverStream(message: DummyMessage): grpc.ClientReadableStream<DummyMessage> {
    return this.client.DummyServerStream(message);
  }

  /**
   * Client streaming: Send multiple DummyMessages
   * @param callback - Callback for the final response
   */
  clientStream(
    callback: (error: grpc.ServiceError | null, response: DummyMessage) => void
  ): grpc.ClientWritableStream<DummyMessage> {
    return this.client.DummyClientStream(callback);
  }

  /**
   * Bidirectional streaming: Chat mode
   */
  bidirectionalStream(): grpc.ClientDuplexStream<DummyMessage, DummyMessage> {
    return this.client.DummyBidirectionalStreamStream();
  }
}
