/**
 * Type definitions for GRPCBin service messages
 */

export enum DummyEnum {
  ENUM_0 = 'ENUM_0',
  ENUM_1 = 'ENUM_1',
  ENUM_2 = 'ENUM_2',
}

export interface DummySub {
  f_string: string;
}

export interface DummyMessage {
  f_string?: string;
  f_strings?: string[];
  f_int32?: number;
  f_int32s?: number[];
  f_enum?: DummyEnum;
  f_enums?: DummyEnum[];
  f_sub?: DummySub;
  f_subs?: DummySub[];
  f_bool?: boolean;
  f_bools?: boolean[];
  f_int64?: string;
  f_int64s?: string[];
  f_bytes?: Buffer;
  f_bytess?: Buffer[];
  f_float?: number;
  f_floats?: number[];
}

export interface EmptyMessage {}

export interface SpecificErrorRequest {
  code: number;
  reason: string;
}

export interface HeaderValues {
  values: string[];
}

export interface HeadersMessage {
  Metadata: { [key: string]: HeaderValues };
}

export interface Endpoint {
  path: string;
  description: string;
}

export interface IndexReply {
  description: string;
  endpoints: Endpoint[];
}
