import { CreatureStaticData } from '../creature';
import { EphemeralStaticData } from '../ephemeral';
import { ItemStaticData } from '../item';
import { TerrainStaticData } from '../terrain';

export class EntityStaticDataManager {
  /**
   * Terrain entity static data.
   */
  protected readonly terrain: TerrainStaticData[];

  /**
   * Creature entity static data.
   */
  protected readonly creature: CreatureStaticData[];

  /**
   * Item entity static data.
   */
  protected readonly item: ItemStaticData[];

  /**
   * Ephemeral entity static data.
   */
  protected readonly ephemeral: EphemeralStaticData[];

  public constructor(cache: Phaser.Cache.BaseCache) {
    this.terrain = cache.get('terrain');
    this.creature = cache.get('creature');
    this.item = cache.get('item');
    this.ephemeral = cache.get('ephemeral');
  }

  public getTerrain(id: number): TerrainStaticData {
    return this.terrain[id];
  }

  public getCreature(id: number): CreatureStaticData {
    return this.creature[id];
  }

  public getItem(id: number): ItemStaticData {
    return this.item[id];
  }

  public getEphemeral(id: number): EphemeralStaticData {
    return this.ephemeral[id];
  }
}
