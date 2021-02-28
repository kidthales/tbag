export enum FontStyle {
  Normal = 'normal',
  Italic = 'italic',
  Oblique = 'oblique'
}

export enum FontVariant {
  Normal = 'normal',
  SmallCaps = 'small-caps'
}

export enum FontWeight {
  Normal = 'normal',
  Bold = 'bold',
  Bolder = 'bolder',
  Lighter = 'lighter',
  OneHundred = '100',
  TwoHundred = '200',
  ThreeHundred = '300',
  FourHundred = '400',
  FiveHundred = '500',
  SixHundred = '600',
  SevenHundred = '700',
  EightHundred = '800',
  NineHundred = '900'
}

export interface FontObject {
  style: FontStyle;
  variant: FontVariant;
  weight: FontWeight;
  size: number;
  family: string;
}

export type FontArray = [FontStyle, FontVariant, FontWeight, number, string];

export type FontLike = Font | FontObject | FontArray;

export class Font {
  public static normalize(font: FontLike): Font {
    if (font instanceof Font) {
      return font;
    } else if (Array.isArray(font)) {
      return Font.fromArray(font);
    }

    return Font.fromObject(font);
  }

  public static clone(f: Font): Font {
    return Font.fromObject(f.object);
  }

  public static fromJson(j: string): Font {
    return Font.fromObject(JSON.parse(j));
  }

  public static fromObject(o: Partial<FontObject>): Font {
    const { size, family, style, variant, weight } = o;
    return new Font(size, family, style, variant, weight);
  }

  public static fromArray(a: FontArray): Font {
    const [style, variant, weight, size, family] = a;
    return new Font(size, family, style, variant, weight);
  }

  public constructor(
    public size = 10,
    public family = 'sans-serif',
    public style = FontStyle.Normal,
    public variant = FontVariant.Normal,
    public weight = FontWeight.Normal
  ) {}

  public get css(): string {
    const { style, variant, weight, size, family } = this;
    return `${style} ${variant} ${weight} ${size}px ${family}`;
  }

  public get json(): string {
    return JSON.stringify(this.object);
  }

  public get object(): FontObject {
    const { style, variant, weight, size, family } = this;
    return { style, variant, weight, size, family };
  }

  public get array(): FontArray {
    const { style, variant, weight, size, family } = this;
    return [style, variant, weight, size, family];
  }
}
