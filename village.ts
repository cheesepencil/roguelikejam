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
    treeBaseLayer: Phaser.Tilemaps.DynamicTilemapLayer;
    treetopLayer1: Phaser.Tilemaps.DynamicTilemapLayer;
    treetopLayer2: Phaser.Tilemaps.DynamicTilemapLayer;
    treetopLayer3: Phaser.Tilemaps.DynamicTilemapLayer;
    forest: Forest;
    randomizer: Phaser.Math.RandomDataGenerator;
    villageNodes: VillageNode[] = [];

    constructor(config: VillageConfig) {
        // props
        this.config = config;
        this.randomizer = new Phaser.Math.RandomDataGenerator(config.seed);
        this.forest = new Forest(config.width, config.height, this.randomizer);
        this.scene = config.scene;

        // base ground layer
        this.initTilemap();
        this.initGroundLayer();
        this.drawPaths();
        this.initGroundBordersAndCorners();
        this.lightGrass();

        this.treeWalls();

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
                let noUnsavoryNeighbors = true;
                for (let i = -1; i < 2; i++) {
                    for (let j = -1; j < 2; j++) {
                        const neighbor = this.groundLayer.getTileAt(
                            t.x + i,
                            t.y + j
                        );
                        if (
                            neighbor &&
                            DARK_GREEN_GRASS.indexOf(neighbor.index) < 0
                        ) {
                            noUnsavoryNeighbors = false;
                        }
                    }
                }
                if (noUnsavoryNeighbors) {
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

    private drawPaths(): void {
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
                    forestNode.x * this.config.forestNodeWidth,
                    forestNode.y * this.config.forestNodeHeight
                );
                if (forestNode.x > connection.node.x) {
                    // exit to the left
                    exitPoint.y +=
                        Math.floor(0.25 * this.config.forestNodeHeight) +
                        connection.entrance *
                            Math.floor(0.25 * this.config.forestNodeHeight);
                } else if (forestNode.x < connection.node.x) {
                    // exit to the right
                    exitPoint.x += this.config.forestNodeWidth - 1;
                    exitPoint.y +=
                        Math.floor(0.25 * this.config.forestNodeHeight) +
                        connection.entrance *
                            Math.floor(0.25 * this.config.forestNodeHeight);
                } else if (forestNode.y > connection.node.y) {
                    //exit to the top
                    exitPoint.x +=
                        Math.floor(0.25 * this.config.forestNodeWidth) +
                        connection.entrance *
                            Math.floor(0.25 * this.config.forestNodeWidth);
                } else if (forestNode.y < connection.node.y) {
                    // exit to the bottom
                    exitPoint.y += this.config.forestNodeHeight - 1;
                    exitPoint.x +=
                        Math.floor(0.25 * this.config.forestNodeWidth) +
                        connection.entrance *
                            Math.floor(0.25 * this.config.forestNodeWidth);
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

                const drawing = true;
                while (drawing) {
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
            });
        });
        const wangifier = new WangManager(this.groundLayer, DIRT);
        wangifier.wangify();
    }

    private lightGrass(): void {
        const wangifier = new WangManager(this.groundLayer, LIGHT_GREEN_GRASS);
        for (let i = 0; i <= this.tilemap.width; i++) {
            for (let j = 0; j <= this.tilemap.height; j++) {
                if (this.randomizer.between(0, 5) === 0) {
                    wangifier.addPoints([new Phaser.Geom.Point(i, j)]);
                }
            }
        }
        wangifier.wangify();
    }

    private treeWalls(): void {
        this.treeBaseLayer = this.tilemap.createBlankDynamicLayer(
            "treeBaseLayer",
            this.tileset
        );
        this.treetopLayer1 = this.tilemap.createBlankDynamicLayer(
            "treetopLayer1",
            this.tileset
        );
        this.treetopLayer2 = this.tilemap.createBlankDynamicLayer(
            "treetopLayer2",
            this.tileset
        );
        this.treetopLayer3 = this.tilemap.createBlankDynamicLayer(
            "treetopLayer3",
            this.tileset
        );
        this.treeBaseLayer.forEachTile((t) => {
            const moduloX = t.x % this.config.forestNodeWidth;
            const moduloY = t.y % this.config.forestNodeHeight;
            if (
                ((moduloX === 0 && t.y % 3 === 0) ||
                    (moduloX === 1 && (t.y + 1) % 3 === 0) ||
                    (moduloX === this.config.forestNodeWidth - 1 &&
                        (t.y - 1) % 3 === 0) ||
                    (moduloY === 0 && t.x % 3 === 0) ||
                    (moduloY === 1 && (t.x + 1) % 3 === 0) ||
                    (moduloY === this.config.forestNodeHeight - 1 &&
                        (t.x - 1) % 3 === 0)) &&
                DIRT.indexOf(this.groundLayer.getTileAt(t.x, t.y).index) > 0 ===
                    false
            ) {
                this.treetopLayer1.putTileAt(640, t.x - 1, t.y);
                this.treetopLayer1.putTileAt(641, t.x, t.y);
                this.treetopLayer1.putTileAt(642, t.x + 1, t.y);
                const treeFlavor = this.randomizer.between(0, 1);
                this.treetopLayer2.putTileAt(
                    544 + treeFlavor * 64,
                    t.x - 1,
                    t.y - 1
                );
                this.treetopLayer2.putTileAt(
                    545 + treeFlavor * 64,
                    t.x,
                    t.y - 1
                );
                this.treetopLayer2.putTileAt(
                    546 + treeFlavor * 64,
                    t.x + 1,
                    t.y - 1
                );
                this.treetopLayer3.putTileAt(
                    512 + treeFlavor * 64,
                    t.x - 1,
                    t.y - 2
                );
                this.treetopLayer3.putTileAt(
                    513 + treeFlavor * 64,
                    t.x,
                    t.y - 2
                );
                this.treetopLayer3.putTileAt(
                    514 + treeFlavor * 64,
                    t.x + 1,
                    t.y - 2
                );
                t.index = 480;
            }
        });
    }
}
