import { getSqlDifference } from './getSqlDifference';

describe('getSqlDifference', () => {
  it('should find that a colored diff of changes if sql is different', async () => {
    const oldSql = `
CREATE TABLE IF NOT EXISTS some_table (
id              INT(11) PRIMARY KEY AUTO_INCREMENT,
created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
) ENGINE = InnoDB;
    `;
    const newSql = `
CREATE TABLE IF NOT EXISTS some_table (
id              BIGINT PRIMARY KEY AUTO_INCREMENT,
created_at      DATETIME(3) DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB;
    `;

    // get the diff
    const result = await getSqlDifference({ oldSql, newSql });
    expect(typeof result).toEqual('string');
    expect(result).toMatchSnapshot(); // result is purely visual, so log an example of it
  });

});
