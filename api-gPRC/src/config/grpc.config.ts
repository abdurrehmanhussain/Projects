/**
 * gRPC Configuration
 * Contains connection settings for grpcb.in service
 */
export const GrpcConfig = {
  // grpcb.in endpoints
  host: 'grpcb.in',

  // Port without TLS
  port: 9000,

  // Port with TLS
  portTLS: 9001,

  // Full addresses
  get address(): string {
    return `${this.host}:${this.port}`;
  },

  get addressTLS(): string {
    return `${this.host}:${this.portTLS}`;
  },

  // Proto loader options
  protoLoaderOptions: {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  },

  // Connection timeout in milliseconds
  timeout: 10000,
};
