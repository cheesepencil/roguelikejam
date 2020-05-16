import { Forest } from "./forest";
import { VillageConfig } from "./villageConfig";
import { DARK_GREEN_GRASS, DIRT, LIGHT_GREEN_GRASS } from "./tileSpriteMappings";
import { WangManager } from "./wangManager";
import { Dir } from "fs";

export class Village {
    config: VillageConfig;
    scene: Phaser.Scene;
    seed: string[];
    tileset: Phaser.Tilemaps.Tileset;
    tilemap: Phaser.Tilemaps.Tilemap;
    groundLayer: Phaser.Tilemaps.DynamicTilemapLayer;
    forest: Forest;
    randomizer: Phaser.Math.RandomDataGenerator;

    constructor(config: VillageConfig) {
        // props
        this.config = config;
        this.randomizer = new Phaser.Math.RandomDataGenerator(config.seed);
        this.forest = new Forest(config.width, config.height, this.randomizer);
        const scene = config.scene;

        // tilemap init
        this.tilemap = scene.make.tilemap({
            tileWidth: 16,
            tileHeight: 16,
            width: config.forestNodeWidth * this.forest.width,
            height: config.forestNodeHeight * this.forest.height,
        });
        scene.add.existing(this.tilemap as any);
        this.tileset = this.tilemap.addTilesetImage(
            "village",
            null,
            16,
            16,
            0,
            0
        );

        // groundlayer
        this.groundLayer = this.tilemap.createBlankDynamicLayer(
            "groundLayer",
            this.tileset
        );
        this.groundLayer.fill(96);

        const wangifier = new WangManager(this.groundLayer, DARK_GREEN_GRASS);
        this.groundLayer.forEachTile((t) => {
            if (
                t.x % (config.forestNodeWidth - 1) === 0 ||
                t.y % (config.forestNodeHeight - 1) === 0
            ) {
                t.index = DARK_GREEN_GRASS[15];
            }
            if (this.randomizer.between(0, 20) === 0) {
                wangifier.addPoints([new Phaser.Geom.Point(t.x, t.y)]);
            }
        });
        wangifier.wangify();

        const wangifier2 = new WangManager(this.groundLayer, LIGHT_GREEN_GRASS);
        this.groundLayer.forEachTile((t) => {
            if (this.randomizer.between(0, 20) === 0) {
                wangifier2.addPoints([new Phaser.Geom.Point(t.x, t.y)]);
            }
        });
        wangifier2.wangify();
    }

    private foo(): void {}
}
