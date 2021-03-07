export function binaryPartition(area: Phaser.Geom.Rectangle, depth: number): Phaser.Geom.Rectangle[] {
  if (depth <= 0) {
    return [area];
  }

  const { x: x1, y: y1, width, height } = area;

  const subWidth = width >= height ? Math.floor(width / 2) : width;
  const subHeight = width >= height ? height : Math.floor(height / 2);

  if (!subWidth || !subHeight) {
    return [area];
  }

  const x2 = width >= height ? x1 + subWidth : x1;
  const y2 = width >= height ? y1 : y1 + subHeight;

  return [].concat(
    binaryPartition(new Phaser.Geom.Rectangle(x1, y1, subWidth, subHeight), depth - 1),
    binaryPartition(new Phaser.Geom.Rectangle(x2, y2, subWidth, subHeight), depth - 1)
  );
}
