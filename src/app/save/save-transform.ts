import { LocalStoragePlugin } from '../plugins/local-storage';

import { TransformsSaveEntryKey, TransformsSaveEntryValue } from './entries';
import { SaveEntry } from './save-entry';

export abstract class SaveTransform {
  public abstract readonly name: string;

  public constructor(protected readonly ls: LocalStoragePlugin) {}

  public run(): void {
    const { ls, name } = this;

    const transformsSaveEntry = new SaveEntry<TransformsSaveEntryValue>(ls, TransformsSaveEntryKey);
    const transforms = transformsSaveEntry.read([]);

    if (transforms.includes(name)) {
      return;
    }

    this.transform();

    transforms.push(name);
    transformsSaveEntry.write(transforms);
  }

  protected abstract transform(): void;
}
