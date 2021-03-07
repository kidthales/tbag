export class MapCell {
  public constructor(
    public terrainStaticDataId: number,
    public terrainEntityId?: string,
    public creatureEntityId?: string,
    public itemEntityIds?: string[],
    public ephemeralEntityIds?: string[]
  ) {}
}
