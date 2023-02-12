import sha256 from 'simple-sha256';

import {
  ChangeDefinition,
  ResourceDefinition,
  ResourceType,
} from '../../../domain';
import { applyPlan } from './applyPlan';
import { applyPlanForChange } from './applyPlanForChange';
import { applyPlanForResource } from './applyPlanForResource';

jest.mock('./applyPlanForChange');
const applyPlanForChangeMock = applyPlanForChange as jest.Mock;
applyPlanForChangeMock.mockReturnValue('__CHANGE_ACTION__');

jest.mock('./applyPlanForResource');
const applyPlanForResourceMock = applyPlanForResource as jest.Mock;
applyPlanForResourceMock.mockReturnValue('__RESOURCE_ACTION__');

describe('applyPlan', () => {
  const resourceDefinition = new ResourceDefinition({
    type: ResourceType.TABLE,
    name: '__NAME__',
    path: '__PATH__',
    sql: '__SQL__',
  });
  const changeDefinition = new ChangeDefinition({
    id: '__ID__',
    path: '__PATH__',
    sql: '__SQL__',
    hash: sha256.sync('__SQL__'),
  });
  it('should applyPlanForChange if definition is a ChangeDefinition', async () => {
    const action = await applyPlan({
      connection: '__CONNECTION__' as any,
      plan: { definition: changeDefinition } as any,
    });
    expect(applyPlanForChangeMock.mock.calls.length).toEqual(1);
    expect(applyPlanForChangeMock.mock.calls[0][0]).toEqual({
      connection: '__CONNECTION__',
      plan: {
        definition: changeDefinition,
      },
    });
    expect(action).toEqual('__CHANGE_ACTION__');
  });
  it('should applyPlanForResource if definition is a ResourceDefinition', async () => {
    const action = await applyPlan({
      connection: '__CONNECTION__' as any,
      plan: { definition: resourceDefinition } as any,
    });
    expect(applyPlanForResourceMock.mock.calls.length).toEqual(1);
    expect(applyPlanForResourceMock.mock.calls[0][0]).toEqual({
      connection: '__CONNECTION__',
      plan: {
        definition: resourceDefinition,
      },
    });
    expect(action).toEqual('__RESOURCE_ACTION__');
  });
});
