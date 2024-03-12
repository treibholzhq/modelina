import { ParseOptions } from '@asyncapi/parser';
import { InterpreterOptions } from '../interpreter/Interpreter';
import {
  OpenAPIInputProcessorOptions,
  TypeScriptInputProcessorOptions
} from '../processors/index';

export interface ProcessorOptions {
  asyncapi?: ParseOptions;
  typescript?: TypeScriptInputProcessorOptions;
  openapi?: OpenAPIInputProcessorOptions;
  interpreter?: InterpreterOptions;
}
