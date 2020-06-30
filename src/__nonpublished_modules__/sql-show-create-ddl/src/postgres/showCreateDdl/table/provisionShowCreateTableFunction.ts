import fs from 'fs';

import { DatabaseConnection } from '../../../types';

/**
 * fortunately for us, postgres does not come with built in `SHOW CREATE TABLE/VIEW/FUNCTION`
 *
 * we have to provide a way to do so manually. on the bright side, postgres does provide an extensive catalog system that we can leverage
 *
 * based on https://stackoverflow.com/questions/2593803/how-to-generate-the-create-table-sql-statement-for-an-existing-table-in-postgr
 */
export const provisionShowCreateTableFunction = async ({ dbConnection }: { dbConnection: DatabaseConnection }) => {
  const sql = await new Promise<string>((resolve, reject) =>
    // note: the file is defined in the `/schema` dir since tsc removes all non ts/js files and this is easier to reference than trying to "cp" into /dist postbuild
    fs.readFile(`${__dirname}/../../../../../../../schema/functions/show_create_table.postgres.sql`, (error, data) => {
      if (error) return reject(error);
      return resolve(data.toString());
    }),
  );
  await dbConnection.query({ sql });
};
