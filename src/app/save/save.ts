import { AvatarEntity } from '../avatar';
import { LevelData, LevelDataConfig } from '../level';
import { LocalStoragePlugin } from '../plugins/local-storage';
import { Type } from '../utils';
import { World, WorldDataConfig } from '../world';
import {
  avatarSaveEntryKey,
  AvatarSaveEntryValue,
  currentLevelSaveEntryKey,
  CurrentLevelSaveEntryValue,
  levelSaveEntryKey,
  LevelSaveEntryValue
} from './entries';

import { SaveEntry } from './save-entry';
import { SaveTransform } from './save-transform';

export class Save {
  public constructor(protected readonly ls: LocalStoragePlugin) {}

  protected get avatarSaveEntry(): SaveEntry<AvatarSaveEntryValue> {
    return new SaveEntry<AvatarSaveEntryValue>(this.ls, avatarSaveEntryKey);
  }

  protected get currentLevelSaveEntry(): SaveEntry<CurrentLevelSaveEntryValue> {
    return new SaveEntry<CurrentLevelSaveEntryValue>(this.ls, currentLevelSaveEntryKey);
  }

  public applyTransforms(transforms: Type<SaveTransform>[]): this {
    transforms.forEach((transform) => new transform(this.ls).run());
    return this;
  }

  public clear(): this {
    this.ls.clear();
    return this;
  }

  public saveWorld(world: World): this {
    const { avatar, currentLevel, levels } = world;
    const level = levels.get(currentLevel);
    return this.saveAvatar(avatar).saveCurrentLevel(currentLevel).saveLevel(currentLevel, level);
  }

  public loadWorld(): Partial<WorldDataConfig> {
    const avatar = this.loadAvatar();
    const currentLevel = this.loadCurrentLevel();
    const levels = this.loadLevels();

    return {
      avatarData: avatar.data,
      avatarStaticDataId: avatar.staticDataId,
      currentLevel,
      levels: levels as Record<string, LevelDataConfig>
    };
  }

  public saveAvatar(avatar: AvatarEntity): this {
    const { staticDataId, data } = avatar;
    this.avatarSaveEntry.write({ staticDataId, data });
    return this;
  }

  public loadAvatar(): Partial<AvatarEntity> {
    return this.avatarSaveEntry.read();
  }

  public saveCurrentLevel(currentLevel: string): this {
    this.currentLevelSaveEntry.write(currentLevel);
    return this;
  }

  public loadCurrentLevel(): string {
    return this.currentLevelSaveEntry.read();
  }

  public saveLevel(id: string, level: LevelData): this {
    const { type, seed, persist, entityManager, rngState, schedulerState } = level;
    const entityManagerState = entityManager.state;

    const levelSaveEntry = this.getLevelSaveEntry(id);

    levelSaveEntry.write({
      type,
      seed,
      rngState,
      persist,
      entityManagerState,
      schedulerState
    });

    return this;
  }

  public loadLevel(id: string): Partial<LevelDataConfig> {
    return this.getLevelSaveEntry(id).read();
  }

  public loadLevels(): Record<string, Partial<LevelDataConfig>> {
    const levels: Record<string, Partial<LevelDataConfig>> = {};

    this.ls.getAllKeys().forEach((key) => {
      if (!key.includes(levelSaveEntryKey)) {
        return;
      }

      const id = key.replace(levelSaveEntryKey, '');
      const levelSaveEntry = this.getLevelSaveEntry(id);

      levels[id] = levelSaveEntry.read();
    });

    return levels;
  }

  protected getLevelSaveEntry(id: string): SaveEntry<LevelSaveEntryValue> {
    return new SaveEntry<LevelSaveEntryValue>(this.ls, `${levelSaveEntryKey}${id}`);
  }
}
