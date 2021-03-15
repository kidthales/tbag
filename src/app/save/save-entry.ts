import { LocalStoragePlugin } from '../plugins/local-storage';

import { SaveEntryValue } from './save-entry-value';

export class SaveEntry<T extends SaveEntryValue = SaveEntryValue> {
  public constructor(protected readonly ls: LocalStoragePlugin, public readonly key: string) {}

  public read(defaultValue?: T): T {
    return this.ls.get(this.key) || defaultValue;
  }

  public write(value: T): this {
    this.ls.set(this.key, value);
    return this;
  }
}
