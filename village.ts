export class Village {
  scene: Phaser.Scene;
  seed: string[];
  tileset: Phaser.Tilemaps.Tileset;
  tilemap: Phaser.Tilemaps.Tilemap;
  groundLayer: any;

  constructor(scene: Phaser.Scene, seed: string[]) {
    this.scene = scene;
    this.seed = seed;

    this.tilemap = scene.make.tilemap({
      tileWidth: 16,
      tileHeight: 16,
      width: 36,
      height: 36,
    });

    scene.add.existing(this.tilemap as any);

    this.tileset = this.tilemap.addTilesetImage("village", null, 16, 16, 0, 0);

    this.groundLayer = this.tilemap.createBlankDynamicLayer("groundLayer", this.tileset);
  }
}
