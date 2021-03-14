import { AvatarEntity } from '../avatar';
import { LevelData } from '../level';
import { LocalStoragePlugin } from '../plugins/local-storage';
import { World } from '../world';

import { ParsedAvatarSave } from './parsed-avatar-save';
import { ParsedLevelSave } from './parsed-level-save';
import { ParsedSave } from './parsed-save';

export class SaveManager {
  public constructor(protected readonly ls: LocalStoragePlugin) {}

  public save(world: World): void {
    const { avatar, currentLevel, levels } = world;
    const levelData = levels.get(currentLevel);

    this.saveAvatar(avatar).saveLevel(currentLevel, levelData);
  }

  public load(): ParsedSave {
    const avatar = this.loadAvatar();
    const { currentLevel, levels } = this.loadLevels();

    return {
      avatar,
      currentLevel,
      levels
    };
  }

  public clear(): void {
    this.ls.clear();
  }

  protected saveAvatar(avatar: AvatarEntity): this {
    const { staticDataId, data } = avatar;
    this.ls.set('avatar', { staticDataId, data });
    return this;
  }

  protected loadAvatar(): ParsedAvatarSave {
    return this.ls.get('avatar');
  }

  protected saveLevel(currentLevel: string, levelData: LevelData): this {
    const { type, seed, persist, entityManager, rngState, schedulerState } = levelData;
    const entityManagerState = entityManager.state;

    this.ls.set('currentLevel', currentLevel).set(`level_${currentLevel}`, {
      type,
      seed,
      rngState,
      persist,
      entityManagerState,
      schedulerState
    });

    return this;
  }

  protected loadLevels(): { currentLevel: string; levels: Record<string, ParsedLevelSave> } {
    const ls = this.ls;
    const levels: Record<string, ParsedLevelSave> = {};

    ls.getAllKeys().forEach((key) => {
      if (!key.includes('level_')) {
        return;
      }

      const id = key.split('_').slice(1).join('_');
      const level = ls.get(key) as ParsedLevelSave;

      levels[id] = level;
    });

    return { currentLevel: ls.get('currentLevel'), levels };
  }
}
