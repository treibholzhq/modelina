import * as fs from 'fs';
import * as path from 'path';
import { OpenAPIInputProcessor } from '../../src/processors/OpenAPIInputProcessor';
const basicDoc = JSON.parse(
  fs.readFileSync(
    path.resolve(__dirname, './OpenAPIInputProcessor/basic.json'),
    'utf8'
  )
);
const schemasOnlyDoc = JSON.parse(
  fs.readFileSync(
    path.resolve(__dirname, './OpenAPIInputProcessor/schemas_only.json'),
    'utf8'
  )
);
jest.mock('../../src/utils/LoggingInterface');
const processorSpy = jest.spyOn(
  OpenAPIInputProcessor,
  'convertToInternalSchema'
);
describe('OpenAPIInputProcessor', () => {
  afterAll(() => {
    jest.restoreAllMocks();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('shouldProcess()', () => {
    const processor = new OpenAPIInputProcessor();
    test('should be able to process OpenAPI 3.0.0 documents', () => {
      const parsedObject = { openapi: '3.0.0' };
      expect(processor.shouldProcess(parsedObject)).toEqual(true);
    });
    test('should be able to process OpenAPI 3.0.1 documents', () => {
      const parsedObject = { openapi: '3.0.1' };
      expect(processor.shouldProcess(parsedObject)).toEqual(true);
    });
    test('should be able to process OpenAPI 3.0.2 documents', () => {
      const parsedObject = { openapi: '3.0.2' };
      expect(processor.shouldProcess(parsedObject)).toEqual(true);
    });
    test('should be able to process OpenAPI 3.0.3 documents', () => {
      const parsedObject = { openapi: '3.0.3' };
      expect(processor.shouldProcess(parsedObject)).toEqual(true);
    });
    test('should be able to process OpenAPI 3.1.0 documents', () => {
      const parsedObject = { openapi: '3.1.0' };
      expect(processor.shouldProcess(parsedObject)).toEqual(true);
    });
    test('should not be able to process other OpenAPI docs', () => {
      const parsedObject = { openapi: '1.0' };
      expect(processor.shouldProcess(parsedObject)).toEqual(false);
    });
    test('should not be able to process document without OpenAPI version', () => {
      const parsedObject = {};
      expect(processor.shouldProcess(parsedObject)).toEqual(false);
    });
  });
  describe('tryGetVersionOfDocument()', () => {
    const processor = new OpenAPIInputProcessor();
    test('should be able to find OpenAPI version from object', () => {
      expect(processor.tryGetVersionOfDocument(basicDoc)).toEqual('3.0.3');
    });
    test('should not be able to find OpenAPI version if not present', () => {
      expect(processor.tryGetVersionOfDocument({})).toBeUndefined();
    });
  });

  describe('process()', () => {
    test('should throw error when trying to process wrong schema', async () => {
      const processor = new OpenAPIInputProcessor();
      await expect(processor.process({})).rejects.toThrow(
        'Input is not a OpenAPI document so it cannot be processed'
      );
    });
    test('should process the OpenAPI document accurately', async () => {
      const processor = new OpenAPIInputProcessor();
      const commonInputModel = await processor.process(basicDoc);
      expect(commonInputModel).toMatchSnapshot();
      expect(processorSpy.mock.calls).toMatchSnapshot();
    });
    test('should include schema for parameters', async () => {
      const doc = {
        openapi: '3.0.3',
        info: {},
        paths: {
          '/test': {
            parameters: [
              {
                name: 'path_parameter',
                in: 'header',
                schema: { type: 'string' }
              }
            ],
            get: {
              parameters: [
                {
                  name: 'operation_parameter',
                  in: 'query',
                  schema: { type: 'string' }
                }
              ],
              responses: {
                204: {}
              }
            }
          }
        }
      };
      const processor = new OpenAPIInputProcessor();
      const model = await processor.process(doc);
      expect(Object.keys(model.models)).toContain(
        'test_get_parameters_query_operation_parameter'
      );
      expect(Object.keys(model.models)).toContain(
        'test_parameters_header_path_parameter'
      );
    });
    test('should include schemas when paths are empty and alwaysIncludeComponents is true', async () => {
      const processor = new OpenAPIInputProcessor();
      const model = await processor.process(schemasOnlyDoc, {
        openapi: { alwaysIncludeComponents: true }
      });
      expect(Object.keys(model.models)).toContain('User');
      expect(Object.keys(model.models)).toContain('UserRole');
      expect(Object.keys(model.models)).toContain('Address');
    });
    test('should not include schemas when paths are empty and alwaysIncludeComponents is false', async () => {
      const processor = new OpenAPIInputProcessor();
      const model = await processor.process(schemasOnlyDoc, {
        openapi: { alwaysIncludeComponents: false }
      });
      expect(Object.keys(model.models)).toHaveLength(0);
    });
  });
});
