import { AvatarEntity } from '../../avatar';
import { EntityUnion, PositionComponentData, positionComponentKey, renderableComponentKey } from '../../entities';
import { Glyph } from '../../plugins/glyph';

import { Level } from '../level';
import { LevelGameObjectDepth } from '../level-game-object-depth';

export class LevelEntityManager {
  public constructor(protected readonly level: Level) {
    const { width, height, entityManager, map } = this.level;

    entityManager.forEach((entity) => {
      const position = entity.getComponent<PositionComponentData>(positionComponentKey);

      if (!position) {
        return;
      }

      const { x, y } = position;

      map.getCell(x, y).addEntity(entity);
    });

    for (let y = 0; y < height; ++y) {
      for (let x = 0; x < width; ++x) {
        const cell = map.getCell(x, y);
        cell.entities.forEach((entity) => this.allocateGameObject(entity));
        cell.refresh();
      }
    }
  }

  public allocateGameObject(entity: string | EntityUnion): Phaser.GameObjects.GameObject {
    const normalizedEntity = this.normalizeEntity(entity);

    if (normalizedEntity.gameobject) {
      return normalizedEntity.gameobject;
    }

    if (!normalizedEntity.hasComponent(positionComponentKey)) {
      return;
    }

    const { x, y } = normalizedEntity.getComponent<PositionComponentData>(positionComponentKey);
    const renderCoordinates = this.level.map.cellCenterToWorldXY(x, y);
    const renderable = this.getRenderable(entity);

    // TODO: Handle non-glyph renderables for some entities...
    const glyphs = this.getGlyphsFromRenderable(renderable);

    if (!glyphs.length) {
      // Not found...
      glyphs.push(new Glyph('_', '#fff', undefined, this.level.levelScene.world.font));
    }

    normalizedEntity.gameobject = this.level.levelScene.add
      .glyphSprite(renderCoordinates.x, renderCoordinates.y, glyphs)
      .setInteractive()
      .setDepth(LevelGameObjectDepth[normalizedEntity.type]);

    this.level.gameObjectGroup.add(normalizedEntity.gameobject);

    return normalizedEntity.gameobject;
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

  protected getRenderable(entity: string | EntityUnion): number | number[] {
    const normalizedEntity = this.normalizeEntity(entity);

    if (normalizedEntity.hasComponent(renderableComponentKey)) {
      return normalizedEntity.getComponent(renderableComponentKey);
    }

    if (normalizedEntity.hasStaticComponent(renderableComponentKey, this.level.entityStaticDataManager)) {
      return normalizedEntity.getStaticComponent(renderableComponentKey, this.level.entityStaticDataManager);
    }
  }

  protected getGlyphsFromRenderable(renderable: number | number[]): Glyph[] {
    const glyphs: Glyph[] = [];

    if (renderable === undefined) {
      return glyphs;
    }

    const normalizedRenderable = Array.isArray(renderable) ? renderable : [renderable];
    const glyphsets = this.level.world.glyphsets.values();

    normalizedRenderable.forEach((r) => {
      for (let glyphset of glyphsets) {
        if (glyphset.containsGlyphIndex(r)) {
          glyphs.push(glyphset.getGlyph(r));
          break;
        }
      }
    });

    return glyphs;
  }
}
