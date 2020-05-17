import { Forest } from "./forest";
import { VillageConfig } from "./villageConfig";
import {
    DARK_GREEN_GRASS,
    DIRT,
    LIGHT_GREEN_GRASS,
} from "./tileSpriteMappings";
import { WangManager } from "./wangManager";
import { Dir } from "fs";
import { ForestNode } from "./forestNode";
import { VillageNode } from "./villageNode";

export class Village {
    config: VillageConfig;
    scene: Phaser.Scene;
    seed: string[];
    tileset: Phaser.Tilemaps.Tileset;
    tilemap: Phaser.Tilemaps.Tilemap;
    groundLayer: Phaser.Tilemaps.DynamicTilemapLayer;
    forest: Forest;
    randomizer: Phaser.Math.RandomDataGenerator;
    villageNodes: VillageNode[] = [];

    constructor(config: VillageConfig) {
        // props
        this.config = config;
        this.randomizer = new Phaser.Math.RandomDataGenerator(config.seed);
        this.forest = new Forest(config.width, config.height, this.randomizer);
        this.scene = config.scene;

        this.initTilemap();
        this.initGroundLayer();

        // ground layer order!
        // - paths
        // - corners/borders
        // - light grass

        // begin path drawing
        const maxOffsetX = Math.floor(this.config.forestNodeWidth / 4);
        const maxOffsetY = Math.floor(this.config.forestNodeHeight / 4);
        this.forest.nodes.forEach((forestNode) => {
            // path centerpoint
            const pathCenterPoint = new Phaser.Geom.Point(
                forestNode.x * this.config.forestNodeWidth +
                    this.config.forestNodeWidth / 2 +
                    this.randomizer.between(-maxOffsetX, maxOffsetX),
                forestNode.y * this.config.forestNodeHeight +
                    this.config.forestNodeHeight / 2 +
                    this.randomizer.between(-maxOffsetY, maxOffsetY)
            );
            const villageNode = new VillageNode(forestNode, pathCenterPoint);
            this.villageNodes.push(villageNode);

            // draw path centerpoint
            for (let i = 0; i < 2; i++) {
                for (let j = 0; j < 2; j++) {
                    this.groundLayer.putTileAt(
                        DIRT[15],
                        pathCenterPoint.x + i,
                        pathCenterPoint.y + j
                    );
                }
            }

            // lines from centerpoint to exits
            forestNode.connections.forEach((connection) => {
                // point is tilemap coords, not pixel coords
                const exitPoint = new Phaser.Geom.Point(
                    forestNode.x * config.forestNodeWidth,
                    forestNode.y * config.forestNodeHeight
                );
                if (forestNode.x > connection.node.x) {
                    // exit to the left
                    exitPoint.y +=
                        Math.floor(0.25 * config.forestNodeHeight) +
                        connection.entrance *
                            Math.floor(0.25 * config.forestNodeHeight);
                } else if (forestNode.x < connection.node.x) {
                    // exit to the right
                    exitPoint.x += config.forestNodeWidth - 1;
                    exitPoint.y +=
                        Math.floor(0.25 * config.forestNodeHeight) +
                        connection.entrance *
                            Math.floor(0.25 * config.forestNodeHeight);
                } else if (forestNode.y > connection.node.y) {
                    //exit to the top
                    exitPoint.x +=
                        Math.floor(0.25 * config.forestNodeWidth) +
                        connection.entrance *
                            Math.floor(0.25 * config.forestNodeWidth);
                } else if (forestNode.y < connection.node.y) {
                    // exit to the bottom
                    exitPoint.y += config.forestNodeHeight - 1;
                    exitPoint.x +=
                        Math.floor(0.25 * config.forestNodeWidth) +
                        connection.entrance *
                            Math.floor(0.25 * config.forestNodeWidth);
                } else {
                    console.log("Something has gone horribly, horribly wrong.");
                }
                villageNode.exitPoints.push(exitPoint);
                this.groundLayer.putTileAt(DIRT[15], exitPoint.x, exitPoint.y);

                // draw a path from centerpoint to exitpoint
                // bresenham line drawing algorithm GO!
                let x0 = pathCenterPoint.x;
                let y0 = pathCenterPoint.y;
                const x1 = exitPoint.x;
                const y1 = exitPoint.y;
                const dx = Math.abs(x1 - x0);
                const sx = x0 < x1 ? 1 : -1;
                const dy = Math.abs(y1 - y0);
                const sy = y0 < y1 ? 1 : -1;
                let err = (dx > dy ? dx : -dy) / 2;

                // eslint-disable-next-line no-constant-condition
                while (true) {
                    for (let i = 0; i < 2; i++) {
                        for (let j = 0; j < 2; j++) {
                            this.groundLayer.putTileAt(
                                DIRT[15],
                                x0 + i,
                                y0 + j
                            );
                        }
                    }
                    if (x0 === x1 && y0 === y1) break;
                    const e2 = err;
                    if (e2 > -dx) {
                        err -= dy;
                        x0 += sx;
                    }
                    if (e2 < dy) {
                        err += dx;
                        y0 += sy;
                    }
                }

                // const startX =
                //     pathCenterPoint.x < exitPoint.x
                //         ? pathCenterPoint.x
                //         : exitPoint.x;
                // const endX =
                //     pathCenterPoint.x > exitPoint.x
                //         ? pathCenterPoint.x
                //         : exitPoint.x;
                // const startY =
                //     pathCenterPoint.y < exitPoint.y
                //         ? pathCenterPoint.y
                //         : exitPoint.y;
                // const endY =
                //     pathCenterPoint.y > exitPoint.y
                //         ? pathCenterPoint.y
                //         : exitPoint.y;

                // for (let i = startX; i <= endX; i++) {
                //     for (let j = startY; j <= endY; j++) {
                //         this.groundLayer.putTileAt(DIRT[15], i, j);
                //     }
                // }
            });
        });
        const wangifier = new WangManager(this.groundLayer, DIRT);
        wangifier.wangify();

        // end path drawing

        this.initGroundBordersAndCorners();

        this.forest.debugDrawForest(this.scene);
    }

    private initTilemap(): void {
        this.tilemap = this.scene.make.tilemap({
            tileWidth: 16,
            tileHeight: 16,
            width: this.config.forestNodeWidth * this.forest.width,
            height: this.config.forestNodeHeight * this.forest.height,
        });
        this.scene.add.existing(this.tilemap as any);
        this.tileset = this.tilemap.addTilesetImage(
            "village",
            null,
            16,
            16,
            0,
            0
        );
    }

    private initGroundLayer(): void {
        // groundlayer
        this.groundLayer = this.tilemap.createBlankDynamicLayer(
            "groundLayer",
            this.tileset
        );
        this.groundLayer.fill(96);
    }

    private initGroundBordersAndCorners(): void {
        const wangifier = new WangManager(this.groundLayer, DARK_GREEN_GRASS);
        this.groundLayer.forEachTile((t) => {
            const moduloX = t.x % this.config.forestNodeWidth;
            const moduloY = t.y % this.config.forestNodeHeight;
            // borders
            if (
                moduloX === 0 ||
                moduloX === this.config.forestNodeWidth - 1 ||
                moduloY === 0 ||
                moduloY === this.config.forestNodeHeight - 1
            ) {
                if (DARK_GREEN_GRASS.indexOf(t.index) > 0) {
                    t.index = DARK_GREEN_GRASS[15];
                }
            }

            // cell corners
            const cornerSize = Math.floor(this.config.forestNodeWidth / 2);
            const oppositeModuloY = this.config.forestNodeHeight - moduloY;
            const isCornerY =
                moduloY < cornerSize || oppositeModuloY < cornerSize;
            const cornerY = moduloY < cornerSize ? moduloY : oppositeModuloY;

            const oppositeModuloX = this.config.forestNodeWidth - moduloX;
            const isCornerX =
                moduloX < cornerSize || oppositeModuloX < cornerSize;
            const cornerX = moduloX < cornerSize ? moduloX : oppositeModuloX;
            let probability = 1;
            probability -= 0.5 - cornerX / cornerSize;
            probability -= 0.5 - cornerY / cornerSize;

            if (probability < 0) {
                console.log(probability);
            }

            if (
                isCornerX &&
                isCornerY &&
                Math.abs(cornerX + cornerY) < cornerSize * 1.5 &&
                this.randomizer.frac() > probability / 2
            ) {
                wangifier.addPoints([new Phaser.Geom.Point(t.x, t.y)]);
            }
        });
        wangifier.wangify();
    }
}
