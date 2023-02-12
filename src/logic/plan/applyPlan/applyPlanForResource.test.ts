import {
  ResourceDefinition,
  ResourceType,
  DefinitionPlan,
  RequiredAction,
} from '../../../types';
import { applyPlanForResource } from './applyPlanForResource';

describe('applyPlanForResource', () => {
  it('should throw error if attempting to REAPPLY a resource.type=TABLE', async () => {
    const plan = new DefinitionPlan({
      id: '__ID__',
      definition: new ResourceDefinition({
        path: '__PATH__',
        sql: '__SOME_SQL__',
        type: ResourceType.TABLE,
        name: '__SOME_NAME__',
      }),
      difference: '__APPLY_DIFFERENCE__',
      action: RequiredAction.REAPPLY,
    });
    try {
      await applyPlanForResource({ connection: '__CONNECTION__' as any, plan });
      throw new Error('should not reach here');
    } catch (error) {
      expect(error.message).toEqual(`resource ${plan.id} is not reappliable`);
    }
  });
});
