import { exampleSqlQueryWithSubquery } from './.test/assets/exampleSqlQueryWithSubquery';
import { breakSqlIntoNestedSqlArraysAtParentheses } from './breakSqlIntoNestedSqlArraysAtParentheses';

describe('breakSqlIntoNestedSqlArraysAtParentheses', () => {
  it('should accurately break up this example', async () => {
    const sql = exampleSqlQueryWithSubquery;
    const nestedSqlArray = breakSqlIntoNestedSqlArraysAtParentheses({ sql });
    expect(nestedSqlArray).toHaveLength(3);
    expect(nestedSqlArray).toMatchSnapshot();
  });
  it('should retain the parentheses inside of the nested sql arrays', () => {
    const sql = "SELECT CONCAT('hel', 'lo');";
    const nestedSqlArray = breakSqlIntoNestedSqlArraysAtParentheses({ sql });
    expect(nestedSqlArray).toHaveLength(3);
    expect(nestedSqlArray[1]?.[0]?.[0]).toEqual('(');
    expect(nestedSqlArray[1]?.[0]?.slice(-1)[0]).toEqual(')');
  });
});
