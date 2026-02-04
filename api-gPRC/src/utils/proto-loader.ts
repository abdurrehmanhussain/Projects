import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import * as path from 'path';
import { GrpcConfig } from '../config/grpc.config';

/**
 * Utility class for loading proto definitions
 */
export class ProtoLoader {
  private static protoDir = path.join(__dirname, '../../protos');

  /**
   * Load a proto file and return the package definition
   * @param protoFile - Name of the proto file (e.g., 'grpcbin.proto')
   */
  static loadProto(protoFile: string): grpc.GrpcObject {
    const protoPath = path.join(this.protoDir, protoFile);
    const packageDefinition = protoLoader.loadSync(protoPath, GrpcConfig.protoLoaderOptions);
    return grpc.loadPackageDefinition(packageDefinition);
  }

  /**
   * Create gRPC credentials (insecure for non-TLS, secure for TLS)
   * @param useTLS - Whether to use TLS connection
   */
  static createCredentials(useTLS: boolean = false): grpc.ChannelCredentials {
    if (useTLS) {
      return grpc.credentials.createSsl();
    }
    return grpc.credentials.createInsecure();
  }

  /**
   * Get the server address based on TLS setting
   * @param useTLS - Whether to use TLS connection
   */
  static getAddress(useTLS: boolean = false): string {
    return useTLS ? GrpcConfig.addressTLS : GrpcConfig.address;
  }
}
