import { AvatarEntity } from '../../avatar';
import { visibilityConfig } from '../../configs';
import { PositionComponentData, positionComponentKey, TerrainEntity } from '../../entities';
import { FieldOfView, FieldOfViewCell } from '../../fov';

import { Level } from '../level';

export class LevelVisibilityManager {
  protected readonly fov = new FieldOfView((x, y) => {
    if (this.level.map.isInBounds(x, y)) {
      return !this.level.map.getCell(x, y).blockLight;
    }

    return false;
  });

  protected avatarVisibilityMap = new Map<string, FieldOfViewCell>();

  protected avatarTerrainEntityMemory = new Set<string>();

  public constructor(protected readonly level: Level) {
    const avatarExplored = level.avatarExplored;

    if (avatarExplored === true) {
      level.graphics.setVisibility(visibilityConfig.maxVisibility - visibilityConfig.exploredAlpha);
    } else {
      level.graphics.setVisibility(visibilityConfig.minVisibility);
    }
  }

  public getFov(x: number, y: number, radius: number): FieldOfViewCell[] {
    return this.fov.find(x, y, radius);
  }

  public isVisibleToAvatar(x: number, y: number): boolean {
    return this.avatarVisibilityMap.has(`${x},${y}`);
  }

  public updateAvatarVisibility(avatar: AvatarEntity): void {
    const radius = 80;
    const { x, y } = avatar.getComponent<PositionComponentData>(positionComponentKey);

    const newVisibilityMap = new Map<string, FieldOfViewCell>();
    this.getFov(x, y, radius).forEach((cell) => {
      const key = `${cell.x},${cell.y}`;

      if (this.level.avatarExplored !== true) {
        this.level.avatarExplored[key] = true;
      }

      newVisibilityMap.set(key, cell);
    });

    const notVisible: FieldOfViewCell[] = [];
    for (let key of this.avatarVisibilityMap.keys()) {
      if (!newVisibilityMap.has(key)) {
        notVisible.push({
          ...this.avatarVisibilityMap.get(key),
          visibility: visibilityConfig.maxVisibility - visibilityConfig.exploredAlpha
        });
      }
    }

    this.avatarVisibilityMap = newVisibilityMap;

    const cells = [...notVisible, ...Array.from(newVisibilityMap.values())];
    this.level.graphics.setVisibilityCells(cells);
    cells.forEach(({ x, y }) => this.level.map.getCell(x, y).refresh());
  }

  public setAvatarTerrainEntityMemory(entity: TerrainEntity): this {
    if (this.avatarTerrainEntityMemory.has(entity.id)) {
      return this;
    }

    this.avatarTerrainEntityMemory.add(entity.id);

    const { x, y } = entity.getComponent<PositionComponentData>(positionComponentKey);

    this.level.graphics.setVisibilityCell(
      {
        x,
        y,
        radius: 0,
        visibility: visibilityConfig.maxVisibility - visibilityConfig.exploredAlpha
      },
      ((entity.gameobject as unknown) as Phaser.GameObjects.Components.Texture).frame
    );

    return this;
  }

  public clearAvatarTerrainEntityMemory(id: string): this {
    this.avatarTerrainEntityMemory.delete(id);
    return this;
  }
}
