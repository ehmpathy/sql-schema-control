import { exampleSqlQueryWithSubquery } from './.test/assets/exampleSqlQueryWithSubquery';
import { breakSqlIntoNestedSqlArraysAtParentheses } from './breakSqlIntoNestedSqlArraysAtParentheses';
import { flattenNestedArraySqlByReferencingAndTokenizingSubqueriesRecursive } from './flattenNestedArraySqlByReferencingAndTokenizingSubqueriesRecursive';

jest.mock('../../deps', () => ({
  uuid: jest.fn(() => '__UUID__'),
}));

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
