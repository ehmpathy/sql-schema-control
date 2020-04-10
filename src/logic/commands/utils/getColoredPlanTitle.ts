import { DefinitionPlan } from '../../../types';
import { getColoredActionTitle } from './getColoredActionTitle';
import { getColoredActionToken } from './getColoredActionToken';

export const getColoredPlanTitle = ({ plan }: { plan: DefinitionPlan }) => {
  // get the action token
  const actionToken = getColoredActionToken({ action: plan.action });

  // return the action title
  return getColoredActionTitle({ actionToken, definition: plan.definition });
};
