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
import { World } from "matter";

export class Village {
    config: VillageConfig;
    scene: Phaser.Scene;
    seed: string[];
    tileset: Phaser.Tilemaps.Tileset;
    tilemap: Phaser.Tilemaps.Tilemap;
    groundLayer: Phaser.Tilemaps.DynamicTilemapLayer;
    treeBaseLayer: Phaser.Tilemaps.DynamicTilemapLayer;
    forest: Forest;
    villageNodes: VillageNode[] = [];

    constructor(config: VillageConfig) {
        // props
        this.config = config;
        this.forest = new Forest(config.width, config.height, config.seed);
        this.scene = config.scene;
        this.initTilemap();

        this.drawNode(
            Math.floor(config.width / 2),
            Math.floor(config.height / 2)
        );

        this.scene.physics.world.setBounds(
            0,
            0,
            16 * this.forest.width * this.config.forestNodeWidth,
            16 * this.forest.height * this.config.forestNodeHeight
        );
    }

    getNodeAt(x: number, y: number): VillageNode {
        const villageNode = this.villageNodes.filter(
            (n) => n.x === x && n.y === y
        )[0];

        return villageNode ?? this.drawNode(x, y);
    }

    private drawNode(x: number, y: number): VillageNode {
        const villageNode = this.drawPaths(x, y);
        this.initGroundBordersAndCorners(x, y);
        this.lightGrass(x, y);
        this.treeWalls(x, y);

        this.treeBaseLayer.setCollision(449);

        return villageNode;
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

        // init layers groundlayer
        this.groundLayer = this.tilemap.createBlankDynamicLayer(
            "groundLayer",
            this.tileset
        );
        this.groundLayer.fill(96);

        // init treelayers
        this.treeBaseLayer = this.tilemap.createBlankDynamicLayer(
            "treeBaseLayer",
            this.tileset
        );
    }

    private initGroundBordersAndCorners(x: number, y: number): void {
        const startTileX = x * this.config.forestNodeWidth;
        const startTileY = y * this.config.forestNodeHeight;
        const nodeWidth = this.config.forestNodeWidth;
        const nodeHeight = this.config.forestNodeHeight;
        const wangifier = new WangManager(
            this.groundLayer,
            DARK_GREEN_GRASS,
            startTileX,
            startTileY,
            nodeWidth,
            nodeHeight
        );
        const nodeRandomizer = new Phaser.Math.RandomDataGenerator([
            "darkgreengrass",
            x.toString(),
            y.toString(),
            ...this.config.seed,
        ]);
        this.groundLayer.forEachTile(
            (t) => {
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
                const cornerY =
                    moduloY < cornerSize ? moduloY : oppositeModuloY;

                const oppositeModuloX = this.config.forestNodeWidth - moduloX;
                const isCornerX =
                    moduloX < cornerSize || oppositeModuloX < cornerSize;
                const cornerX =
                    moduloX < cornerSize ? moduloX : oppositeModuloX;
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
                    nodeRandomizer.frac() > probability / 2
                ) {
                    wangifier.addPoints([new Phaser.Geom.Point(t.x, t.y)]);
                }
            },
            null,
            startTileX,
            startTileY,
            nodeWidth,
            nodeHeight
        );
        wangifier.wangify();
    }

    private drawPaths(x: number, y: number): VillageNode {
        const nodeRandomizer = new Phaser.Math.RandomDataGenerator([
            "paths",
            x.toString(),
            y.toString(),
            ...this.config.seed,
        ]);
        const maxOffsetX = Math.floor(this.config.forestNodeWidth / 4);
        const maxOffsetY = Math.floor(this.config.forestNodeHeight / 4);
        const forestNode = this.forest.nodes.filter(
            (n) => n.x === x && n.y === y
        )[0];

        // path centerpoint
        const pathCenterPoint = new Phaser.Geom.Point(
            forestNode.x * this.config.forestNodeWidth +
                this.config.forestNodeWidth / 2 +
                nodeRandomizer.between(-maxOffsetX, maxOffsetX),
            forestNode.y * this.config.forestNodeHeight +
                this.config.forestNodeHeight / 2 +
                nodeRandomizer.between(-maxOffsetY, maxOffsetY)
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
                        this.groundLayer.putTileAt(DIRT[15], x0 + i, y0 + j);
                        this.clobberNearby(
                            x0 + i,
                            y0 + j,
                            this.groundLayer,
                            DIRT
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
        const wangifier = new WangManager(
            this.groundLayer,
            DIRT,
            x * this.config.forestNodeWidth,
            y * this.config.forestNodeHeight,
            this.config.forestNodeWidth,
            this.config.forestNodeHeight
        );
        wangifier.wangify();
        return villageNode;
    }

    private clobberNearby(
        x: number,
        y: number,
        layer: Phaser.Tilemaps.DynamicTilemapLayer,
        spriteMapping: number[]
    ): void {
        for (let i = -2; i < 3; i++) {
            for (let j = -2; j < 3; j++) {
                if (i === 0 && j === 0) continue;
                const tile = layer.getTileAt(x + i, y + j);
                if (tile && spriteMapping.indexOf(tile.index) < 15) {
                    tile.index = spriteMapping[0];
                }
            }
        }
    }

    private lightGrass(x: number, y: number): void {
        const nodeRandomizer = new Phaser.Math.RandomDataGenerator([
            "lightgreengrass",
            x.toString(),
            y.toString(),
            ...this.config.seed,
        ]);
        const startX = x * this.config.forestNodeWidth;
        const endX = startX + this.config.forestNodeWidth;
        const startY = y * this.config.forestNodeHeight;
        const endY = startY + this.config.forestNodeHeight;
        const wangifier = new WangManager(
            this.groundLayer,
            LIGHT_GREEN_GRASS,
            startX,
            startY,
            this.config.forestNodeWidth,
            this.config.forestNodeHeight
        );
        for (let i = startX; i <= endX; i++) {
            for (let j = startY; j <= endY; j++) {
                if (nodeRandomizer.between(0, 5) === 0) {
                    wangifier.addPoints([new Phaser.Geom.Point(i, j)]);
                }
            }
        }
        wangifier.wangify();
    }

    private treeWalls(x: number, y: number): void {
        const nodeRandomizer = new Phaser.Math.RandomDataGenerator([
            "treewalls",
            x.toString(),
            y.toString(),
            ...this.config.seed,
        ]);
        this.treeBaseLayer
            .getTilesWithin(
                x * this.config.forestNodeWidth - 1,
                y * this.config.forestNodeHeight - 1,
                this.config.forestNodeWidth + 3,
                this.config.forestNodeHeight + 3
            )
            .filter((t) => t.index === -1)
            .forEach((t) => {
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
                    DIRT.indexOf(this.groundLayer.getTileAt(t.x, t.y).index) >
                        0 ===
                        false
                ) {
                    const treeFlavor = nodeRandomizer.between(0, 1);
                    t.index = 449;
                    this.scene.add
                        .sprite(t.pixelX - 16, t.pixelY + 16, "treetops", 0)
                        .setOrigin(0, 1)
                        .setDepth(t.y + 1);
                    this.treeBaseLayer.putTileAt(448, t.x - 1, t.y);
                    this.treeBaseLayer.putTileAt(450, t.x + 1, t.y);
                    this.treeBaseLayer.putTileAt(481, t.x, t.y + 1);
                }
            });
    }
}
