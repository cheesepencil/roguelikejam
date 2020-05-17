import { DARK_GREEN_GRASS } from "./tileSpriteMappings";
import { exists } from "fs";
import { Tilemaps } from "phaser";

export class WangManager {
    spriteMapping: number[];
    points: Phaser.Geom.Point[] = [];
    wangTiles: WangTile[] = [];
    layer: Phaser.Tilemaps.DynamicTilemapLayer;
    x: number;
    y: number;
    width: number;
    height: number;

    constructor(
        layer: Phaser.Tilemaps.DynamicTilemapLayer,
        spriteMapping: number[] = undefined,
        x: number,
        y: number,
        width: number,
        height: number
    ) {
        this.layer = layer;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        if (spriteMapping === undefined) {
            this.spriteMapping = DARK_GREEN_GRASS;
        } else {
            this.spriteMapping = spriteMapping;
        }
    }

    addPoints(points: Phaser.Geom.Point[]): void {
        points.forEach((point) => {
            if (
                this.isUntrackedPoint(point) &&
                this.hasNoUnsavoryNeighbors(point) &&
                point.x !== this.x &&
                point.y !== this.y &&
                point.x !== this.x + this.width &&
                point.y !== this.y + this.height
            )
                this.points.push(point);
        });
    }

    private isUntrackedPoint(point: Phaser.Geom.Point): boolean {
        return (
            this.points.filter((p) => {
                return p.x === point.x && p.y === point.y;
            }).length === 0
        );
    }

    private hasNoUnsavoryNeighbors(point: Phaser.Geom.Point): boolean {
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
                if (
                    this.spriteMapping.indexOf(
                        this.layer.getTileAt(point.x - i, point.y - j)?.index
                    ) < 0
                ) {
                    return false;
                }
            }
        }
        return true;
    }

    private getWang(x: number, y: number): WangTile {
        let wang = this.wangTiles.filter((w) => {
            return w.x === x && w.y === y;
        })[0];
        if (wang) {
            return wang;
        } else {
            let tile = this.layer.getTileAt(x, y);
            // bail if no tile
            if (!tile) {
                return null;
            }

            // bail if already solid
            if (tile.index === this.spriteMapping[15]) {
                return null;
            }

            // bail if tile not in this wang set
            if (this.spriteMapping.indexOf(tile.index) < 0) {
                return null;
            }

            let mappingIndex = this.spriteMapping.indexOf(tile.index);
            let cornerBits = mappingIndex >= 0 ? mappingIndex : 0;
            let wangTile = new WangTile(x, y, cornerBits);
            this.wangTiles.push(wangTile);
            return wangTile;
        }
    }

    private draw(): void {
        this.points.forEach((p) => {
            this.getWang(p.x - 1, p.y - 1)?.topLeftify();
            this.getWang(p.x, p.y - 1)?.topRightify();
            this.getWang(p.x - 1, p.y)?.bottomLeftify();
            this.getWang(p.x, p.y)?.bottomRightify();
        });
        this.wangTiles.forEach((w) => {
            this.layer.putTileAt(this.spriteMapping[w.cornerBits], w.x, w.y);
        });
    }

    wangify(): void {
        const solids = this.layer.filterTiles(
            (t: Tilemaps.Tile) => t.index === this.spriteMapping[15],
            null,
            this.x,
            this.y,
            this.width,
            this.height
        );
        console.log(`solids.length: ${solids.length}`);
        const vertices: Phaser.Geom.Point[] = [];
        solids.forEach((s) => {
            for (let i = 0; i < 2; i++) {
                for (let j = 0; j < 2; j++) {
                    let point = new Phaser.Geom.Point(s.x + i, s.y + j);
                    if (
                        vertices.filter((v) => {
                            return v.x === point.x && v.y === point.y;
                        }).length === 0 &&
                        point.x !== this.x &&
                        point.y !== this.y &&
                        point.x !== this.x + this.width &&
                        point.y !== this.y + this.width
                    ) {
                        vertices.push(point);
                    }
                }
            }
        });
        this.addPoints(vertices);
        this.draw();
    }
}

class WangTile {
    cornerBits: number;
    x: number;
    y: number;

    constructor(x: number, y: number, cornerBits: number) {
        this.x = x;
        this.y = y;
        this.cornerBits = cornerBits;
    }

    topLeftify(): void {
        this.cornerBits += 2;
    }

    topRightify(): void {
        this.cornerBits += 4;
    }

    bottomLeftify(): void {
        this.cornerBits += 1;
    }

    bottomRightify(): void {
        this.cornerBits += 8;
    }
}
