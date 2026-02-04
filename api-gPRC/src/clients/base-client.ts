import * as grpc from '@grpc/grpc-js';
import { GrpcConfig } from '../config/grpc.config';

/**
 * Base class for all gRPC clients
 * Provides common functionality and connection management
 */
export abstract class BaseGrpcClient {
  protected client: any;
  protected address: string;
  protected credentials: grpc.ChannelCredentials;

  constructor(useTLS: boolean = false) {
    this.address = useTLS ? GrpcConfig.addressTLS : GrpcConfig.address;
    this.credentials = useTLS
      ? grpc.credentials.createSsl()
      : grpc.credentials.createInsecure();
  }

  /**
   * Promisify a unary gRPC call
   * @param method - The gRPC method to call
   * @param request - The request message
   */
  protected promisifyUnary<TRequest, TResponse>(
    method: Function,
    request: TRequest
  ): Promise<TResponse> {
    return new Promise((resolve, reject) => {
      method.call(
        this.client,
        request,
        { deadline: Date.now() + GrpcConfig.timeout },
        (error: grpc.ServiceError | null, response: TResponse) => {
          if (error) {
            reject(this.formatError(error));
          } else {
            resolve(response);
          }
        }
      );
    });
  }

  /**
   * Format gRPC error for better readability
   */
  protected formatError(error: grpc.ServiceError): Error {
    const formattedError = new Error(
      `gRPC Error [${error.code}]: ${error.message}`
    );
    (formattedError as any).code = error.code;
    (formattedError as any).details = error.details;
    (formattedError as any).metadata = error.metadata;
    return formattedError;
  }

  /**
   * Close the gRPC client connection
   */
  close(): void {
    if (this.client) {
      this.client.close();
    }
  }

  /**
   * Check if the client is connected
   */
  isConnected(): boolean {
    if (!this.client) return false;
    const channel = this.client.getChannel();
    const state = channel.getConnectivityState(false);
    return state === grpc.connectivityState.READY;
  }

  /**
   * Wait for the client to be ready
   */
  async waitForReady(timeoutMs: number = GrpcConfig.timeout): Promise<void> {
    return new Promise((resolve, reject) => {
      const deadline = Date.now() + timeoutMs;
      this.client.waitForReady(deadline, (error: Error | undefined) => {
        if (error) {
          reject(new Error(`Failed to connect to gRPC server: ${error.message}`));
        } else {
          resolve();
        }
      });
    });
  }
}
