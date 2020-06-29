import { ConnectionConfig } from './ConnectionConfig';

describe('ConnectionConfig', () => {
  it('should initialize for valid inputs', () => {
    const changeDefinition = new ConnectionConfig({
      host: 'localhost',
      port: 3306,
      database: 'awesome_database',
      schema: 'awesome_schema',
      username: 'service_user',
      password: 'super_secure_password',
    });
    expect(changeDefinition).toMatchObject({
      host: 'localhost',
      port: 3306,
      database: 'awesome_database',
      schema: 'awesome_schema',
      username: 'service_user',
      password: 'super_secure_password',
    });
  });
  it('should throw error on invalid input', () => {
    try {
      new ConnectionConfig({
        host: 'localhost',
        port: '3306', // should be a number
        schema: 'awesome_schema',
        username: 'service_user',
        password: 'super_secure_password',
      } as any); // tslint:disable-line no-unused-expression
    } catch (error) {
      expect(error.constructor.name).toEqual('ValidationError');
    }
  });
});
