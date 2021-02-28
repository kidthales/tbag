import SecureLS from 'secure-ls';

export class LocalStoragePlugin extends Phaser.Plugins.BasePlugin {
  public static readonly key = 'localStoragePlugin';

  public static readonly mapping = 'ls';

  public static get pluginDefinition(): { key: string; plugin: typeof LocalStoragePlugin; mapping: string } {
    return {
      key: LocalStoragePlugin.key,
      plugin: LocalStoragePlugin,
      mapping: LocalStoragePlugin.mapping
    };
  }

  protected readonly ls = new SecureLS({ encodingType: '', isCompression: true });

  public constructor(pluginManager: Phaser.Plugins.PluginManager) {
    super(pluginManager);
  }

  public get<T>(key: string): T {
    return this.ls.get(key);
  }

  public getAllKeys(): string[] {
    return this.ls.getAllKeys();
  }

  public set<T>(key: string, data: T): this {
    this.ls.set(key, data);
    return this;
  }

  public remove<T>(key: string): T {
    const value = this.ls.get(key);
    this.ls.remove(key);
    return value;
  }

  public removeAll(): this {
    this.ls.removeAll();
    return this;
  }

  public clear(): this {
    this.ls.clear();
    return this;
  }
}
