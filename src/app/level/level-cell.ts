import { AvatarEntity } from '../avatar';
import {
  CreatureEntity,
  EntityType,
  EntityUnion,
  EphemeralEntity,
  ItemEntity,
  LevelCellComponentData,
  levelCellComponentKey,
  TerrainEntity,
  TerrainStaticData
} from '../entities';
import { MapCell } from '../map';
import { GlyphTile } from '../plugins/glyph';

import { Level } from './level';

export class LevelCell {
  public constructor(
    protected readonly level: Level,
    public readonly x: number,
    public readonly y: number,
    protected readonly data: MapCell,
    public readonly tile: GlyphTile
  ) {}

  public get worldX(): number {
    return this.level.cellToWorldX(this.x, this.level.levelScene.cameras.getCamera('world'));
  }

  public get worldY(): number {
    return this.level.cellToWorldY(this.y, this.level.levelScene.cameras.getCamera('world'));
  }

  public get terrainStaticData(): TerrainStaticData {
    const id = this.data.terrainStaticDataId;
    return this.level.entityStaticDataManager.getTerrain(id);
  }

  public set terrainStaticDataId(id: number) {
    this.data.terrainStaticDataId = id;
  }

  public get ids(): string[] {
    const { terrainEntityId, creatureEntityId, itemEntityIds, ephemeralEntityIds } = this.data;
    return [terrainEntityId, creatureEntityId, ...(itemEntityIds || []), ...(ephemeralEntityIds || [])].filter(Boolean);
  }

  public get entities(): EntityUnion[] {
    const ids = this.ids;
    const entityManager = this.level.entityManager;

    return ids
      .map((id) => {
        if (entityManager.has(id)) {
          return entityManager.get(id);
        }

        if (id === AvatarEntity.id) {
          return this.level.levelScene.avatar;
        }
      })
      .filter(Boolean);
  }

  public get terrain(): TerrainEntity {
    const id = this.data.terrainEntityId;

    if (!id) {
      return;
    }

    const entityManager = this.level.entityManager;

    if (entityManager.has(id)) {
      return entityManager.get(id) as TerrainEntity;
    }
  }

  public get creature(): CreatureEntity {
    const id = this.data.creatureEntityId;

    if (!id) {
      return;
    }

    const entityManager = this.level.entityManager;

    if (entityManager.has(id)) {
      return entityManager.get(id) as CreatureEntity;
    }

    if (id === AvatarEntity.id) {
      return this.level.levelScene.avatar;
    }
  }

  public get items(): ItemEntity[] {
    const ids = this.data.itemEntityIds || [];
    const entityManager = this.level.entityManager;

    return ids
      .map((id) => {
        if (entityManager.has(id)) {
          return entityManager.get(id) as ItemEntity;
        }
      })
      .filter(Boolean);
  }

  public get ephemerals(): EphemeralEntity[] {
    const ids = this.data.ephemeralEntityIds || [];
    const entityManager = this.level.entityManager;

    return ids
      .map((id) => {
        if (entityManager.has(id)) {
          return entityManager.get(id) as EphemeralEntity;
        }
      })
      .filter(Boolean);
  }

  public get blockMove(): boolean {
    const terrain = this.terrain;

    if (terrain) {
      if (terrain.hasComponent(levelCellComponentKey)) {
        return terrain.getComponent<LevelCellComponentData>(levelCellComponentKey).blockMove;
      }

      const staticData = this.level.entityStaticDataManager;

      if (terrain.hasStaticComponent(levelCellComponentKey, staticData)) {
        return terrain.getStaticComponent<LevelCellComponentData>(levelCellComponentKey, staticData).blockMove;
      }
    }

    const data = this.terrainStaticData[levelCellComponentKey];

    if (!data) {
      return true;
    }

    return data.blockMove;
  }

  public addEntity(entity: string | EntityUnion): boolean {
    const normalizedEntity = this.normalizeEntity(entity);
    const data = this.data;

    switch (normalizedEntity.type) {
      case EntityType.Terrain:
        if (data.terrainEntityId) {
          return false;
        }

        data.terrainEntityId = normalizedEntity.id;
        break;
      case EntityType.Creature:
        if (data.creatureEntityId) {
          return false;
        }

        data.creatureEntityId = normalizedEntity.id;
      case EntityType.Item:
        if (!data.itemEntityIds) {
          this.data.itemEntityIds = [];
        }

        if (data.itemEntityIds.includes(normalizedEntity.id)) {
          return false;
        }

        data.itemEntityIds.push(normalizedEntity.id);
        break;
      case EntityType.Ephemeral:
        if (!data.ephemeralEntityIds) {
          this.data.ephemeralEntityIds = [];
        }

        if (data.ephemeralEntityIds.includes(normalizedEntity.id)) {
          return false;
        }

        data.ephemeralEntityIds.push(normalizedEntity.id);
        break;
      default:
        return false;
    }

    return true;
  }

  public addEntities(entities: (string | EntityUnion)[]): boolean[] {
    return entities.map((entity) => this.addEntity(entity));
  }

  public removeEntity(entity: string | EntityUnion): boolean {
    const normalizedEntity = this.normalizeEntity(entity);
    const data = this.data;

    switch (normalizedEntity.type) {
      case EntityType.Terrain:
        if (data.terrainEntityId !== normalizedEntity.id) {
          return false;
        }

        data.terrainEntityId = undefined;
        break;
      case EntityType.Creature:
        if (data.creatureEntityId !== normalizedEntity.id) {
          return false;
        }

        data.creatureEntityId = undefined;
      case EntityType.Item:
        if (!data.itemEntityIds || !data.itemEntityIds.includes(normalizedEntity.id)) {
          return false;
        }

        Phaser.Utils.Array.SpliceOne(data.itemEntityIds, data.itemEntityIds.indexOf(normalizedEntity.id));
        break;
      case EntityType.Ephemeral:
        if (!data.ephemeralEntityIds || !data.ephemeralEntityIds.includes(normalizedEntity.id)) {
          return false;
        }

        Phaser.Utils.Array.SpliceOne(data.ephemeralEntityIds, data.ephemeralEntityIds.indexOf(normalizedEntity.id));
        break;
      default:
        return false;
    }

    return true;
  }

  public removeEntities(entities: (string | EntityUnion)[]): boolean[] {
    return entities.map((entity) => this.removeEntity(entity));
  }

  public refresh(): this {
    const ids = this.ids;

    if (!ids.length) {
      const renderable = this.terrainStaticData.renderable;

      let index = -1;

      if (Array.isArray(renderable) && renderable.length) {
        index = renderable[0];
      } else if (typeof renderable === 'number') {
        index = renderable;
      }

      this.tile.index = index;
      this.tile.visible = true;

      return this;
    }

    let creatureExists = false;
    let itemExists = false;

    this.entities
      .sort((a, b) => b.type - a.type)
      .forEach((entity) => {
        const gameobject = (entity.gameobject as unknown) as Phaser.GameObjects.Components.Visible;

        if (!gameobject) {
          return;
        }

        switch (entity.type) {
          case EntityType.Creature:
            gameobject.visible = true;
            this.tile.visible = false;
            creatureExists = true;
            return;
          case EntityType.Item:
            if (!creatureExists && !itemExists) {
              gameobject.visible = true;
              this.tile.visible = false;
              itemExists = true;
            } else {
              gameobject.visible = false;
            }
            return;
          case EntityType.Terrain:
            if (!creatureExists && !itemExists) {
              gameobject.visible = true;
              this.tile.visible = false;
            } else {
              gameobject.visible = false;
            }
            return;
          case EntityType.Ephemeral:
          default:
            return;
        }
      });
  }

  protected normalizeEntity(entity: string | EntityUnion): EntityUnion {
    if (typeof entity === 'string') {
      if (this.level.entityManager.has(entity)) {
        return this.level.entityManager.get(entity);
      }

      if (entity === AvatarEntity.id) {
        return this.level.levelScene.avatar;
      }
    } else {
      return entity;
    }
  }
}
