import sqlFormatter from 'sql-formatter';
import strip from 'sql-strip-comments';

import { ResourceType } from '../../../../../../types';
import { recursivelyHeavilyNormalizeViewDdl } from '../../../generic/recursivelyHeavilyNormalizeViewDdl/recursivelyHeavilyNormalizeViewDdl';

const RESOURCES_WITH_LOSSY_SHOW_CREATE_STATEMENTS = [ResourceType.TABLE, ResourceType.VIEW];

/**
 * some SHOW CREATE statements are not lossy:
 * - procedures and functions preserve formatting and comments, making getting the sql diff a dream
 *
 * some SHOW CREATE statements are lossy:
 * - tables strip comments and apply their own standard formatting
 * - views strip comments and remove all newlines (which technically _is_ a special kind of formatting) - and apply all sorts of fun additions
 */
export const normalizeDDLToSupportLossyShowCreateStatements = ({
  ddl,
  resourceType,
}: {
  ddl: string;
  resourceType: ResourceType;
}) => {
  if (!RESOURCES_WITH_LOSSY_SHOW_CREATE_STATEMENTS.includes(resourceType)) return ddl; // if does not have lossy show create, return the ddl without formatting

  // strip comments from tables and views, since these are not preserved by the SHOW CREATEs
  const strippedDDL = strip(ddl);

  // if view, fix a few fun "features" that the SHOW CREATE statement adds
  const extraNormalizedDDL =
    resourceType === ResourceType.VIEW
      ? recursivelyHeavilyNormalizeViewDdl({ ddl: strippedDDL }) // SHOW CREATE for view has a lot of fun features, so extra normalization is needed
      : strippedDDL;

  // apply formatting, since views have bad formatting
  const formattedDDL = sqlFormatter.format(extraNormalizedDDL);

  // return the cleaned ddl
  return formattedDDL;
};
