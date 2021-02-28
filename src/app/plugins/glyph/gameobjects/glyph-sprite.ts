import { GlyphLike } from '../glyph';
import { GlyphPlugin } from '../plugins';

type PhaserPlayAnimationKey = string | Phaser.Animations.Animation | Phaser.Types.Animations.PlayAnimationConfig;

/**
 * Play glyph animation configuration.
 */
export interface PlayGlyphAnimationConfig {
  /**
   * The glyph data to animate.
   */
  glyphLike: GlyphLike;

  /**
   * The frame rate of playback in frames per second (default 24 if duration is null)
   */
  frameRate?: number;

  /**
   * How long the animation should play for in milliseconds. If not given its derived from frameRate.
   */
  duration?: number;

  /**
   * Delay before starting playback. Value given in milliseconds.
   */
  delay?: number;

  /**
   * Number of times to repeat the animation (-1 for infinity)
   */
  repeat?: number;

  /**
   * Delay before the animation repeats. Value given in milliseconds.
   */
  repeatDelay?: number;

  /**
   * Should the animation yoyo? (reverse back down to the start) before repeating?
   */
  yoyo?: boolean;

  /**
   * Should sprite.visible = true when the animation starts to play?
   */
  showOnStart?: boolean;

  /**
   * Should sprite.visible = false when the animation finishes?
   */
  hideOnComplete?: boolean;

  /**
   * The frame of the animation to start playback from.
   */
  startFrame?: number;

  /**
   * The time scale to be applied to playback of this animation.
   */
  timeScale?: number;
}

/**
 * Glyph sprite configuration. Used with corresponding GameObjectCreator method.
 */
export interface GlyphSpriteConfig extends Phaser.Types.GameObjects.GameObjectConfig {
  /**
   * Glyph data.
   */
  glyphLike: GlyphLike;

  /**
   * Animation configuration.
   */
  anims?:
    | string
    | {
        startFrame?: string | number;
        delay?: number;
        repeat?: number;
        repeatDelay?: number;
        yoyo?: boolean;
        play?: boolean;
        delayedPlay?: boolean;
      };
}

export type GlyphSpriteFactory = { [GlyphSprite.key]: typeof GlyphSprite['factory'] };

export type GlyphSpriteCreator = { [GlyphSprite.key]: typeof GlyphSprite['creator'] };

export type GameObjectFactoryWithGlyphSprite = Phaser.GameObjects.GameObjectFactory & GlyphSpriteFactory;

export type GameObjectCreatorWithGlyphSprite = Phaser.GameObjects.GameObjectCreator & GlyphSpriteCreator;

export class GlyphSprite extends Phaser.GameObjects.Sprite {
  public static readonly key = 'glyphSprite';

  protected static readonly factory = function glyphSpriteFactory(
    x: number,
    y: number,
    glyphLike: GlyphLike
  ): GlyphSprite {
    return (this.displayList as Phaser.Structs.List<GlyphSprite>).add(new GlyphSprite(this.scene, x, y, glyphLike));
  };

  protected static readonly creator = function glyphSpriteCreator(
    config: GlyphSpriteConfig,
    addToScene?: boolean
  ): GlyphSprite {
    const sprite = new GlyphSprite(this.scene, 0, 0, config.glyphLike);

    if (addToScene !== undefined) {
      config.add = addToScene;
    }

    Phaser.GameObjects.BuildGameObject(this.scene, sprite, config);
    GlyphSprite.buildAnimation(sprite, config);

    return sprite;
  };

  public static get gameObjectDefinition(): [string, typeof GlyphSprite.factory, typeof GlyphSprite.creator] {
    return [GlyphSprite.key, GlyphSprite.factory, GlyphSprite.creator];
  }

  protected static buildAnimation(sprite: GlyphSprite, config: GlyphSpriteConfig) {
    const GetAdvancedValue = Phaser.Utils.Objects.GetAdvancedValue;

    const animConfig = GetAdvancedValue(config, 'anims', null);

    if (animConfig === null) {
      return sprite;
    }

    if (typeof animConfig === 'string') {
      //  { anims: 'key' }
      sprite.anims.play(animConfig);
      return sprite;
    }
    //  { anims: {
    //              key: string
    //              startFrame: [string|number]
    //              delay: [float]
    //              repeat: [integer]
    //              repeatDelay: [float]
    //              yoyo: [boolean]
    //              play: [boolean]
    //              delayedPlay: [boolean]
    //           }
    //  }

    const anims = sprite.anims;
    const key = sprite.glyphPlugin.getTexture(config.glyphLike).key;

    const startFrame = GetAdvancedValue(animConfig, 'startFrame', undefined);

    const delay = GetAdvancedValue(animConfig, 'delay', 0);
    const repeat = GetAdvancedValue(animConfig, 'repeat', 0);
    const repeatDelay = GetAdvancedValue(animConfig, 'repeatDelay', 0);
    const yoyo = GetAdvancedValue(animConfig, 'yoyo', false);

    const play = GetAdvancedValue(animConfig, 'play', false);
    const delayedPlay = GetAdvancedValue(animConfig, 'delayedPlay', 0);

    const playConfig = {
      key: key,
      delay: delay,
      repeat: repeat,
      repeatDelay: repeatDelay,
      yoyo: yoyo,
      startFrame: startFrame
    };

    if (play) {
      anims.play(playConfig);
    } else if (delayedPlay > 0) {
      anims.playAfterDelay(playConfig, delayedPlay);
    } else {
      anims['load'](playConfig);
    }

    return sprite;
  }

  protected readonly glyphPlugin: GlyphPlugin;

  public constructor(scene: Phaser.Scene, x: number, y: number, glyphLike: GlyphLike) {
    super(scene, x, y, undefined);

    this.type = 'GlyphSprite';
    this.glyphPlugin = this.scene.sys.plugins.get(GlyphPlugin.key) as GlyphPlugin;

    this.setTexture(glyphLike);
  }

  public play(key: PhaserPlayAnimationKey | PlayGlyphAnimationConfig, ignoreIfPlaying?: boolean): this {
    return this.playAnimationHelper((k, i: boolean) => super.play(k, i), key, ignoreIfPlaying);
  }

  public playReverse(key: PhaserPlayAnimationKey | PlayGlyphAnimationConfig, ignoreIfPlaying?: boolean): this {
    return this.playAnimationHelper((k, i: boolean) => super.playReverse(k, i), key, ignoreIfPlaying);
  }

  public playAfterDelay(key: PhaserPlayAnimationKey | PlayGlyphAnimationConfig, delay: number): this {
    return this.playAnimationHelper((k, i: number) => super.playAfterDelay(k, i), key, delay);
  }

  public playAfterRepeat(key: PhaserPlayAnimationKey | PlayGlyphAnimationConfig, repeatCount?: number): this {
    return this.playAnimationHelper((k, i: number) => super.playAfterRepeat(k, i), key, repeatCount);
  }

  public chain(
    key:
      | PhaserPlayAnimationKey
      | PlayGlyphAnimationConfig
      | string[]
      | Phaser.Animations.Animation[]
      | Phaser.Types.Animations.PlayAnimationConfig[]
      | PlayGlyphAnimationConfig[]
  ): this {
    if (
      typeof key === 'string' ||
      key instanceof Phaser.Animations.Animation ||
      typeof (key as Phaser.Types.Animations.PlayAnimationConfig).key === 'string'
    ) {
      return super.chain(key as PhaserPlayAnimationKey);
    }

    if (Array.isArray(key)) {
      if (!key.length) {
        return this;
      }

      const c = key[0];

      if (
        typeof c === 'string' ||
        c instanceof Phaser.Animations.Animation ||
        typeof (c as Phaser.Types.Animations.PlayAnimationConfig).key === 'string'
      ) {
        return super.chain(
          key as string[] | Phaser.Animations.Animation[] | Phaser.Types.Animations.PlayAnimationConfig[]
        );
      }
    }

    const keys = (Array.isArray(key) ? key : [key]) as PlayGlyphAnimationConfig[];
    return super.chain(keys.map((k) => ({ ...k, key: this.glyphPlugin.getTexture(k.glyphLike).key })));
  }

  public setTexture(key: string | GlyphLike, frame?: string | number): this {
    /*if (typeof key === 'string') {
      return super.setTexture(key, frame);
    }

    return super.setTexture(this.glyphPlugin.getTexture(key).key, frame);*/

    if (key === undefined) {
      this.texture = this.scene.sys.textures.get(key as string);
      return this.setFrame(frame);
    }

    if (typeof key !== 'string') {
      //key = this.glyphPlugin.getTexture(key).key;
      if (!this.glyphPlugin) {
        key = (this.scene.sys.plugins.get(GlyphPlugin.key) as GlyphPlugin).getTexture(key).key;
      } else {
        key = this.glyphPlugin.getTexture(key).key;
      }
    }

    this.texture = this.scene.sys.textures.get(key);

    return this.setFrame(frame);
  }

  protected playAnimationHelper(
    op: (key: PhaserPlayAnimationKey, param?: boolean | number) => this,
    key: PhaserPlayAnimationKey | PlayGlyphAnimationConfig,
    param?: boolean | number
  ): this {
    if (
      typeof key === 'string' ||
      key instanceof Phaser.Animations.Animation ||
      typeof (key as Phaser.Types.Animations.PlayAnimationConfig).key === 'string'
    ) {
      return op(key as PhaserPlayAnimationKey, param);
    }

    key = key as PlayGlyphAnimationConfig;

    return op({ ...key, key: this.glyphPlugin.getTexture(key.glyphLike).key }, param);
  }
}
