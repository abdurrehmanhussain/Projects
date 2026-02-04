# gRPC CRUD Operations with Playwright

A Playwright project demonstrating gRPC CRUD operations using the grpcb.in testing service.

## Project Structure

```
api-gPRC/
├── protos/                     # Protocol Buffer definitions
│   ├── grpcbin.proto          # GRPCBin service proto
│   └── hello.proto            # Hello service proto
├── src/
│   ├── clients/               # gRPC client implementations
│   │   ├── base-client.ts     # Base class with common functionality
│   │   ├── grpcbin-client.ts  # GRPCBin service client
│   │   ├── hello-client.ts    # Hello service client
│   │   └── index.ts           # Client exports
│   ├── config/
│   │   └── grpc.config.ts     # gRPC configuration settings
│   ├── types/                 # TypeScript type definitions
│   │   ├── grpcbin.types.ts   # GRPCBin message types
│   │   ├── hello.types.ts     # Hello message types
│   │   └── index.ts           # Type exports
│   ├── utils/
│   │   └── proto-loader.ts    # Proto loading utility
│   └── index.ts               # Main entry point
├── tests/                     # Playwright test files
│   ├── grpcbin-crud.spec.ts   # GRPCBin CRUD tests
│   ├── hello-crud.spec.ts     # Hello service CRUD tests
│   └── streaming.spec.ts      # Streaming pattern tests
├── package.json
├── playwright.config.ts
├── tsconfig.json
└── README.md
```

## Installation

```bash
npm install
```

## Running Tests

```bash
# Run all tests
npm test

# Run only gRPC tests
npm run test:grpc

# Run tests with UI
npm run test:headed

# View test report
npm run report
```

## gRPC Endpoint

- **Host**: grpcb.in
- **Port (non-TLS)**: 9000
- **Port (TLS)**: 9001

## Available Services

### GRPCBin Service
- `DummyUnary` - Echoes received messages (used for Create/Update)
- `Index` - Returns service information (used for Read)
- `Empty` - Empty operation (used for Delete)
- `DummyServerStream` - Server streaming
- `DummyClientStream` - Client streaming
- `DummyBidirectionalStreamStream` - Bidirectional streaming

### Hello Service
- `SayHello` - Unary RPC
- `LotsOfReplies` - Server streaming
- `LotsOfGreetings` - Client streaming
- `BidiHello` - Bidirectional streaming

## CRUD Operations Mapping

| Operation | GRPCBin Method   | Hello Method |
|-----------|------------------|--------------|
| CREATE    | DummyUnary       | SayHello     |
| READ      | Index            | SayHello     |
| UPDATE    | DummyUnary       | SayHello     |
| DELETE    | Empty            | SayHello     |

## Usage Example

```typescript
import { GrpcBinClient, HelloClient } from './src';

// GRPCBin Client
const grpcBinClient = new GrpcBinClient();

// CREATE
const created = await grpcBinClient.create({
  f_string: 'Hello World',
  f_int32: 42,
});

// READ
const index = await grpcBinClient.read();

// UPDATE
const updated = await grpcBinClient.update({
  f_string: 'Updated message',
});

// DELETE
await grpcBinClient.delete();

// Close connection
grpcBinClient.close();

// Hello Client
const helloClient = new HelloClient();

const response = await helloClient.sayHello('Hello!');
console.log(response.reply);

helloClient.close();
```

## Streaming Example

```typescript
const client = new GrpcBinClient();

// Server Streaming
const stream = client.serverStream({ f_string: 'Test' });
stream.on('data', (response) => console.log(response));
stream.on('end', () => console.log('Stream ended'));

// Client Streaming
const writeStream = client.clientStream((err, response) => {
  console.log('Final response:', response);
});
writeStream.write({ f_string: 'Message 1' });
writeStream.write({ f_string: 'Message 2' });
writeStream.end();

// Bidirectional Streaming
const bidiStream = client.bidirectionalStream();
bidiStream.on('data', (response) => console.log(response));
bidiStream.write({ f_string: 'Hello' });
bidiStream.end();
```

## Key Features

- Clean, maintainable code structure
- TypeScript support with full type definitions
- Promisified unary calls for async/await usage
- Stream support for all gRPC patterns
- Configurable TLS/non-TLS connections
- Comprehensive error handling
- Playwright test integration
