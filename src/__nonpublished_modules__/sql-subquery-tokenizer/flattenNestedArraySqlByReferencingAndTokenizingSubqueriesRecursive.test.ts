import { exampleSqlQueryWithSubquery } from './__test_assets__/exampleSqlQueryWithSubquery';
import { breakSqlIntoNestedSqlArraysAtParentheses } from './breakSqlIntoNestedSqlArraysAtParentheses';
import { flattenNestedArraySqlByReferencingAndTokenizingSubqueriesRecursive } from './flattenNestedArraySqlByReferencingAndTokenizingSubqueriesRecursive';

import uuid = require('uuid');
jest.mock('uuid');
const uuidMock = uuid as any as jest.Mock;
uuidMock.mockReturnValue('__UUID__');

describe('flattenNestedArraySqlByReferencingAndTokenizingSubqueriesRecursive', () => {
  it('should accurately flatten and tokenize this example', async () => {
    const sql = exampleSqlQueryWithSubquery;
    const nestedSqlArray = breakSqlIntoNestedSqlArraysAtParentheses({ sql });
    const { references, flattenedSql } =
      flattenNestedArraySqlByReferencingAndTokenizingSubqueriesRecursive({
        sqlOrNestedSqlArray: nestedSqlArray,
      });
    expect(references.length).toEqual(1);
    expect(references).toMatchSnapshot();
    expect(flattenedSql).toMatchSnapshot();
  });
});
