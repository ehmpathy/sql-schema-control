import { applyPlan } from './applyPlan';
import { RequiredAction } from '../../../types';

describe('applyPlan', () => {
  it('should throw error if action is NO_CHANGE', async () => {
    try {
      await applyPlan({ plan: { action: RequiredAction.NO_CHANGE } as any, connection: {} as any });
      throw new Error('should not reach here');
    } catch (error) {
      expect(error.message).toEqual(`plan.action must be ${RequiredAction.APPLY} or ${RequiredAction.REAPPLY}. Got ${RequiredAction.NO_CHANGE}`);
    }
  });
  it('should throw error if action is MANUAL_REAPPLY', async () => {
    try {
      await applyPlan({ plan: { action: RequiredAction.MANUAL_REAPPLY } as any, connection: {} as any });
      throw new Error('should not reach here');
    } catch (error) {
      expect(error.message).toEqual(`plan.action must be ${RequiredAction.APPLY} or ${RequiredAction.REAPPLY}. Got ${RequiredAction.MANUAL_REAPPLY}`);
    }
  });
});
