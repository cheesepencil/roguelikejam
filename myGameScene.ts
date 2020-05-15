import { Forest } from "./forest";
import { GameObjects } from "phaser";
import { WangManager } from "./wangManager";
import { DIRT, DARK_GREEN_GRASS } from "./tileSpriteMappings";

export class MyGameScene extends Phaser.Scene {
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super({
      key: "MyGameScene",
    });
  }

  create(): void {
    this.cameras.main.setBounds(0, 0, 256, 256);
    this.cameras.main.useBounds = true;
    this.cursors = this.input.keyboard.createCursorKeys();

    this.add.image(0,0, 'village').setOrigin(0,0);

    // const layer = map.createBlankDynamicLayer("ground1", tileset);

    // layer.fill(96);

    // // path
    // layer.fill(43, 0, Math.floor(map.height / 2), Math.floor(map.width / 2), 1);
    // layer.fill(
    //   43,
    //   Math.floor(map.width / 2),
    //   Math.floor(map.height / 2),
    //   1,
    //   Math.floor(map.height / 4)
    // );
    // layer.fill(
    //   43,
    //   Math.floor(map.width / 2),
    //   Math.floor(map.height * 0.75),
    //   map.width,
    //   1
    // );
    // layer.putTileAt(43, 10, 2);
    // layer.putTileAt(43, 9, 3);
    // layer.putTileAt(43, 0, 2);
    // layer.putTileAt(43, 1, 2);
    // layer.putTileAt(43, 2, 2);
    // layer.putTileAt(43, 3, 2);
    // layer.putTileAt(43, 4, 2);
    // layer.putTileAt(43, 4, 3);
    // layer.putTileAt(43, 4, 4);
    // layer.putTileAt(43, 4, 5);
    // let wangifier: WangManager = new WangManager(layer, DIRT);
    // wangifier.wangify();

    // let wangifier2: WangManager = new WangManager(layer, DARK_GREEN_GRASS);
    // wangifier2.addPoints([new Phaser.Geom.Point(0, 0)]);
    // wangifier2.addPoints([new Phaser.Geom.Point(map.width, map.height)]);
    // wangifier2.draw();

    // border
    // layer.putTileAt(41, 0, 0);
    // layer.putTileAt(40, map.width - 1, 0);
    // layer.putTileAt(9, 0, map.height - 1);
    // layer.putTileAt(8, map.width - 1, map.height - 1);
    // layer.fill(70, 1, 0, map.width - 2, 1);
    // layer.fill(6, 1, map.height - 1, map.width - 2, 1);
    // layer.fill(39, 0, 1, 1, map.height - 2);
    // layer.fill(37, map.width - 1, 1, 1, map.height - 2);

    // random dark grass patches
    // let patchPoints: Phaser.Geom.Point[] = [
    //     new Phaser.Geom.Point(6, 6),
    //     new Phaser.Geom.Point(8, 6),
    //     new Phaser.Geom.Point(7, 7),
    //     new Phaser.Geom.Point(6, 7),
    //     new Phaser.Geom.Point(7, 6),
    //     new Phaser.Geom.Point(7, 8),
    //     new Phaser.Geom.Point(1, 1)
    // ];
    // let wangManager = new WangManager(layer);
    // wangManager.addPoints(patchPoints);
    // wangManager.draw();

    // let forest = new Forest(5, 5).debugDrawForest(this);
  }

  update(time: number, delta: number): void {
    if (this.cursors.up.isDown) {
      this.cameras.main.scrollY -= 0.25 * delta;
    }
    if (this.cursors.down.isDown) {
      this.cameras.main.scrollY += 0.25 * delta;
    }
    if (this.cursors.right.isDown) {
      this.cameras.main.scrollX += 0.25 * delta;
    }
    if (this.cursors.left.isDown) {
      this.cameras.main.scrollX -= 0.25 * delta;
    }
    if (this.cursors.shift.isDown) {
      let zoom = this.cameras.main.zoom - 0.0005 * delta;
      this.cameras.main.zoom = zoom > 0 ? zoom : 0.001;
    }
    if (this.cursors.space.isDown) {
      this.cameras.main.zoom = 1;
    }
  }
}
