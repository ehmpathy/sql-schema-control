import sha256 from 'simple-sha256';

import { uuid } from '../../deps';
import {
  ChangeDefinition,
  ResourceDefinition,
  ResourceType,
  ResourceDefinitionStatus,
} from '../../types';
import { getStatusForChangeDefinition } from './changeDefinition/getStatusForChangeDefinition';
import { getStatusForDefinition } from './getStatusForDefinition';
import { getStatusForResourceDefinition } from './resourceDefinition/getStatusForResourceDefinition';

jest.mock('./changeDefinition/getStatusForChangeDefinition');
const getChangeStatusMock = getStatusForChangeDefinition as jest.Mock;

jest.mock('./resourceDefinition/getStatusForResourceDefinition');
const getResourceStatusMock = getStatusForResourceDefinition as jest.Mock;

describe('getStatusOfDefinition', () => {
  beforeEach(() => jest.clearAllMocks());
  it('should not do anything and return the input if the definition already has a status', async () => {
    const resource = new ResourceDefinition({
      name: 'example_resource',
      type: ResourceType.TABLE,
      sql: '__SQL__',
      status: ResourceDefinitionStatus.NOT_CONTROLLED, // e.g., uncontrolled resources will be discovered and identified by this status
    });
    await getStatusForDefinition({
      definition: resource,
      connection: '__CONNECTION__' as any,
    });
    expect(getResourceStatusMock.mock.calls.length).toEqual(0);
  });
  it('should throw an error if no adaptor is defined for the definition.type', async () => {
    try {
      await getStatusForDefinition({
        connection: '__CONNECTION__' as any,
        definition: {} as any,
      });
      throw new Error('should not reach here');
    } catch (error) {
      expect(error.message).toContain('unsupported controlled definition');
    }
  });
  it('should use the correct adaptor for a ChangeDefinition', async () => {
    const change = new ChangeDefinition({
      id: uuid(),
      path: '__PATH__',
      sql: '__SQL__',
      hash: sha256.sync('__SQL__'),
    });
    await getStatusForDefinition({
      definition: change,
      connection: '__CONNECTION__' as any,
    });
    expect(getChangeStatusMock.mock.calls.length).toEqual(1);
    expect(getChangeStatusMock.mock.calls[0][0]).toEqual({
      change,
      connection: '__CONNECTION__',
    });
  });
  it('should use the correct adaptor for a ResourceDefinition', async () => {
    const resource = new ResourceDefinition({
      name: 'example_resource',
      type: ResourceType.TABLE,
      sql: '__SQL__',
    });
    await getStatusForDefinition({
      definition: resource,
      connection: '__CONNECTION__' as any,
    });
    expect(getResourceStatusMock.mock.calls.length).toEqual(1);
    expect(getResourceStatusMock.mock.calls[0][0]).toEqual({
      resource,
      connection: '__CONNECTION__',
    });
  });
});
