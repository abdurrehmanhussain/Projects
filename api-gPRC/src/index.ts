/**
 * Main entry point for the gRPC API module
 * Exports all clients, types, and utilities
 */

// Export clients
export { BaseGrpcClient, GrpcBinClient, HelloClient } from './clients';

// Export types
export * from './types';

// Export configuration
export { GrpcConfig } from './config/grpc.config';

// Export utilities
export { ProtoLoader } from './utils/proto-loader';
