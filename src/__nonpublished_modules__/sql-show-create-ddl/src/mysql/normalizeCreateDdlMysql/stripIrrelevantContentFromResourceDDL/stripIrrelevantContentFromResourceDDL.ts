import { ResourceType } from '../../../../../../types';

export const stripIrrelevantContentFromResourceDDL = ({
  ddl,
  resourceType,
}: {
  ddl: string;
  resourceType: ResourceType;
}) => {
  let relevantSql = ddl;

  // if resource type is FUNCTION / PROCEDURE / VIEW, strip the definer and all else between the "CREATE" and "${RESOURCE_NAME}"
  if (
    resourceType === ResourceType.FUNCTION ||
    resourceType === ResourceType.PROCEDURE ||
    resourceType === ResourceType.VIEW
  ) {
    // e.g., "CREATE DEFINER=`root`@`%` PROCEDURE `upsert_user_description`(" -> "CREATE PROCEDURE `upsert_user_description`("
    const regex = new RegExp(`(?<=CREATE )(.*)(?=${resourceType})`);
    relevantSql = relevantSql.replace(regex, '');
  }

  // if resource type is TABLE, strip the auto increment record
  if (resourceType === ResourceType.TABLE) {
    // e.g., ") ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci" -> ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    const regex = new RegExp('(AUTO_INCREMENT=[0-9]+ )');
    relevantSql = relevantSql.replace(regex, '');
  }

  // return relevant sql
  return relevantSql;
};
