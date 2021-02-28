import * as Components from 'phaser/src/gameobjects/components';

/**
 * Provides methods used for setting the alpha properties of a Game Object.
 * Should be applied as a mixin and not used directly.
 */
export const Alpha: Phaser.GameObjects.Components.Alpha = Components.Alpha;

/**
 * Provides methods used for setting the alpha property of a Game Object.
 * Should be applied as a mixin and not used directly.
 */
export const AlphaSingle: Phaser.GameObjects.Components.AlphaSingle = Components.AlphaSingle;

/**
 * Provides methods used for setting the blend mode of a Game Object. Should be
 * applied as a mixin and not used directly.
 */
export const BlendMode: Phaser.GameObjects.Components.BlendMode = Components.BlendMode;

/**
 * Provides methods used for calculating and setting the size of a non-Frame
 * based Game Object. Should be applied as a mixin and not used directly.
 */
export const ComputedSize: Phaser.GameObjects.Components.ComputedSize = Components.ComputedSize;

/**
 * Provides methods used for getting and setting the texture of a Game Object.
 */
export const Crop: Phaser.GameObjects.Components.Crop = Components.Crop;

/**
 * Provides methods used for setting the depth of a Game Object. Should be
 * applied as a mixin and not used directly.
 */
export const Depth: Phaser.GameObjects.Components.Depth = Components.Depth;

/**
 * Provides methods used for visually flipping a Game Object. Should be applied
 * as a mixin and not used directly.
 */
export const Flip: Phaser.GameObjects.Components.Flip = Components.Flip;

/**
 * Provides methods used for obtaining the bounds of a Game Object. Should be
 * applied as a mixin and not used directly.
 */
export const GetBounds: Phaser.GameObjects.Components.GetBounds = Components.GetBounds;

/**
 * Provides methods used for getting and setting the mask of a Game Object.
 */
export const Mask: Phaser.GameObjects.Components.Mask = Components.Mask;

/**
 * Provides methods used for getting and setting the origin of a Game Object.
 * Values are normalized, given in the range 0 to 1. Display values contain the
 * calculated pixel values. Should be applied as a mixin and not used directly.
 */
export const Origin: Phaser.GameObjects.Components.Origin = Components.Origin;

/**
 * Provides methods used for managing a Game Object following a Path. Should be
 * applied as a mixin and not used directly.
 */
export const PathFollower: Phaser.GameObjects.Components.PathFollower = Components.PathFollower;

/**
 * Provides methods used for setting the WebGL rendering pipeline of a Game
 * Object.
 */
export const Pipeline: Phaser.GameObjects.Components.Pipeline = Components.Pipeline;

/**
 * Provides methods used for getting and setting the Scroll Factor of a Game
 * Object.
 */
export const ScrollFactor: Phaser.GameObjects.Components.ScrollFactor = Components.ScrollFactor;

/**
 * Provides methods used for getting and setting the size of a Game Object.
 */
export const Size: Phaser.GameObjects.Components.Size = Components.Size;

/**
 * Provides methods used for getting and setting the texture of a Game Object.
 */
export const Texture: Phaser.GameObjects.Components.Texture = Components.Texture;

/**
 * Provides methods used for getting and setting the texture of a Game Object.
 */
export const TextureCrop: Phaser.GameObjects.Components.TextureCrop = Components.TextureCrop;

/**
 * Provides methods used for setting the tint of a Game Object. Should be
 * applied as a mixin and not used directly.
 */
export const Tint: Phaser.GameObjects.Components.Tint = Components.Tint;

/**
 * Build a JSON representation of the given Game Object.
 *
 * This is typically extended further by Game Object specific implementations.
 */
export const ToJSON: Phaser.GameObjects.Components.ToJSON = Components.ToJSON;

/**
 * Provides methods used for getting and setting the position, scale and
 * rotation of a Game Object.
 */
export const Transform: Phaser.GameObjects.Components.Transform = Components.Transform;

/**
 * A Matrix used for display transformations for rendering.
 *
 * It is represented like so:
 *
 * | a | c | tx |
 *
 * | b | d | ty |
 *
 * | 0 | 0 | 1  |
 */
export const TransformMatrix: Phaser.GameObjects.Components.TransformMatrix = Components.TransformMatrix;

/**
 * Provides methods used for setting the visibility of a Game Object. Should be
 * applied as a mixin and not used directly.
 */
export const Visible: Phaser.GameObjects.Components.Visible = Components.Visible;

/**
 * Phaser GameObject Component union.
 */
export type ComponentUnion =
  | typeof Alpha
  | typeof AlphaSingle
  | typeof BlendMode
  | typeof ComputedSize
  | typeof Crop
  | typeof Depth
  | typeof Flip
  | typeof GetBounds
  | typeof Mask
  | typeof Origin
  | typeof PathFollower
  | typeof Pipeline
  | typeof ScrollFactor
  | typeof Size
  | typeof Texture
  | typeof TextureCrop
  | typeof Tint
  | typeof ToJSON
  | typeof Transform
  | typeof TransformMatrix
  | typeof Visible;
