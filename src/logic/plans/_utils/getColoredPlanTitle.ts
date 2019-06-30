import chalk from 'chalk';
import { RequiredAction, DefinitionPlan, ResourceDefinition, ChangeDefinition } from '../../../types';

export const getColoredPlanTitle = ({ plan }: { plan: DefinitionPlan }) => {
  // define action string
  const actionChalk = {
    [RequiredAction.APPLY]: chalk.green,
    [RequiredAction.NO_CHANGE]: chalk.gray,
    [RequiredAction.REAPPLY]: chalk.yellow,
    [RequiredAction.MANUAL_REAPPLY]: chalk.red,
    [RequiredAction.MANUAL_MIGRATION]: chalk.red,
    [RequiredAction.MANUAL_PULL]: chalk.red,
  }[plan.action];
  const actionString = actionChalk(`[${plan.action}]`);

  // define extra details
  const definitionType = (plan.definition.constructor === ChangeDefinition) ? 'change' : 'resource';
  const definitionId = (plan.definition.constructor === ChangeDefinition)
    ? (plan.definition as ChangeDefinition).id
    : `${(plan.definition as ResourceDefinition).type.toLowerCase()}:${(plan.definition as ResourceDefinition).name}`;
  const extraDetails = chalk.gray(`(${definitionType}:${definitionId})`);

  // define the header
  const title = chalk.bold((`${actionString} ${plan.definition.path} ${extraDetails}`));

  // return header
  return title;
};
