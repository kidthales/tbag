import { WorldStaticData } from '../world';

import { EntityType, EntityUnion } from './type';

export function getEntityComponentData<T>(key: string, entity: EntityUnion, staticData: WorldStaticData): T {
  const componentName = key as string;
  const componentData = (entity.data[componentName] as unknown) as T;

  if (componentData !== undefined) {
    return componentData;
  }

  const staticDataId = entity.staticDataId;

  switch (entity.type) {
    case EntityType.Creature:
      return (staticData.creature[staticDataId][componentName] as unknown) as T;
    case EntityType.Terrain:
      return (staticData.terrain[staticDataId][componentName] as unknown) as T;
    case EntityType.Item:
      return (staticData.item[staticDataId][componentName] as unknown) as T;
    case EntityType.Ephemeral:
      return (staticData.ephemeral[staticDataId][componentName] as unknown) as T;
    default:
      return;
  }
}
