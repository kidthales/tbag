import { GlyphTile } from '../../plugins/glyph';

import {
  TerrainStaticData,
  EntityUnion,
  TerrainEntity,
  EntityType,
  CreatureEntity,
  ItemEntity,
  EphemeralEntity
} from '../entity';
import { MapCell, mapCellTerrainStaticDataIdIndex, mapCellEntityIdsIndex } from '../map';

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
    return this.level.cellToWorldX(this.x);
  }

  public get worldY(): number {
    return this.level.cellToWorldY(this.y);
  }

  public get terrainStaticData(): TerrainStaticData {
    return this.level.world.terrain[this.data[mapCellTerrainStaticDataIdIndex]];
  }

  public set terrainStaticDataId(id: number) {
    this.data[mapCellTerrainStaticDataIdIndex] = id;
  }

  public get ids(): string[] {
    return (this.data[mapCellEntityIdsIndex] || []).slice();
  }

  public get entities(): EntityUnion[] {
    const ids = this.ids;
    const entities = this.level.entityManager;
    return ids.map((id) => entities.get(id));
  }

  public get terrain(): TerrainEntity {
    return this.entities.find((entity) => entity.type === EntityType.Terrain) as TerrainEntity;
  }

  public get creature(): CreatureEntity {
    return this.entities.find((entity) => entity.type === EntityType.Creature) as CreatureEntity;
  }

  public get items(): ItemEntity[] {
    return this.entities.filter((entity) => entity.type === EntityType.Item) as ItemEntity[];
  }

  public get ephemerals(): EphemeralEntity[] {
    return this.entities.filter((entity) => entity.type === EntityType.Ephemeral) as EphemeralEntity[];
  }

  public get blockMove(): boolean {
    const terrain = this.terrain?.data || this.terrainStaticData;
    return terrain.blockMove;
  }

  public addEntity(entity: string | EntityUnion): boolean {
    const ids = (this.data[mapCellEntityIdsIndex] = Array.isArray(this.data[mapCellEntityIdsIndex])
      ? this.data[mapCellEntityIdsIndex]
      : []);

    const normalizedEntity = typeof entity === 'string' ? this.level.entityManager.get(entity) : entity;

    switch (normalizedEntity.type) {
      case EntityType.Terrain:
        if (this.terrain) {
          return false;
        }

        return !!ids.push(normalizedEntity.id);
      case EntityType.Creature:
        if (this.terrain) {
          return false;
        }

        return !!ids.push(normalizedEntity.id);
      case EntityType.Item:
      case EntityType.Ephemeral:
        return !!ids.push(normalizedEntity.id);
      default:
        return false;
    }
  }

  public addEntities(entities: (string | EntityUnion)[]): boolean[] {
    return entities.map((entity) => this.addEntity(entity));
  }

  public removeEntity(entity: string | EntityUnion): boolean {
    const ids = this.data[mapCellEntityIdsIndex];

    if (!Array.isArray(ids)) {
      return false;
    }

    const id = typeof entity === 'string' ? entity : entity.id;
    const ix = ids.indexOf(id);

    if (ix === -1) {
      return false;
    }

    const result = Phaser.Utils.Array.SpliceOne(ids, ix);

    return result === id;
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
}
