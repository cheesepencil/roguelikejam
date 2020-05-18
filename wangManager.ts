import { DARK_GREEN_GRASS } from "./tileSpriteMappings";
import { exists } from "fs";
import { Tilemaps } from "phaser";
import { BADFAMILY } from "dns";

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

    private resetNearby(x: number, y: number): void {
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
                const tile = this.layer.getTileAt(x - i, y - j);
                const index = this.spriteMapping.indexOf(tile?.index);
                if (index < 15 && index > 0) {
                    tile.index = this.spriteMapping[0];
                    this.points.push(new Phaser.Geom.Point(tile.x, tile.y));
                }
            }
        }
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
                const index = this.spriteMapping.indexOf(
                    this.layer.getTileAt(point.x - i, point.y - j)?.index
                );
                if (index < 0) {
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

    wangify(): void {
        const solids = this.layer.filterTiles(
            (t: Tilemaps.Tile) => t.index === this.spriteMapping[15],
            null,
            this.x,
            this.y,
            this.width,
            this.height
        );
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

    private draw(): void {
        this.points.forEach((p) => {
            this.getWang(p.x - 1, p.y - 1)?.topLeftify();
            this.getWang(p.x, p.y - 1)?.topRightify();
            this.getWang(p.x - 1, p.y)?.bottomLeftify();
            this.getWang(p.x, p.y)?.bottomRightify();
        });
        this.wangTiles.forEach((w) => {
            if (w.x <= this.x || w.x > this.x + this.width) return;
            if (w.y <= this.y || w.y > this.y + this.height) return;
            this.layer.putTileAt(this.spriteMapping[w.cornerBits], w.x, w.y);
        });
        this.fixEdges();
    }

    private fixEdges(): void {
        for (let i = this.x - 2; i < this.x + this.width + 3; i++) {
            for (let j = this.y - 2; j < this.y + this.height + 3; j++) {
                if (
                    i > this.x + 1 &&
                    i < this.x + this.width - 1 &&
                    j > this.y + 1 &&
                    j < this.y + this.height - 1
                ) {
                    continue;
                }
                const edge = this.layer.getTileAt(i, j);
                // don't calculate "solids" or other wang mappings
                if (
                    !edge ||
                    edge.index === this.spriteMapping[15] ||
                    this.spriteMapping.indexOf(edge.index) < 0
                ) {
                    continue;
                }
                const index = this.calculateWangIndex(i, j);
                edge.index = index;
            }
        }
    }

    private calculateWangIndex(x: number, y: number): number {
        let bits = 0;
        let nw = false;
        let ne = false;
        let sw = false;
        let se = false;
        // inefficient but i'm tired
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                if (i === 0 && j === 0) continue;
                const neighbor = this.layer.getTileAt(x + i, y + j);
                if (!neighbor) continue;
                // solids... ez
                if (this.spriteMapping.indexOf(neighbor.index) === 15) {
                    if (i === 0 && j === -1) {
                        ne = true;
                        nw = true;
                    }
                    if (i === 0 && j === 1) {
                        se = true;
                        sw = true;
                    }
                    if (i === -1 && j === 0) {
                        nw = true;
                        sw = true;
                    }
                    if (i === 1 && j === 0) {
                        ne = true;
                        se = true;
                    }
                }
                // not solids... annoying. wish i knew better way to do this
                if (
                    i === -1 &&
                    j === -1 &&
                    [2, 3, 6, 7, 10, 11, 14, 15].indexOf(
                        this.spriteMapping.indexOf(neighbor.index)
                    ) >= 0
                ) {
                    nw = true;
                }
                if (
                    i === 1 &&
                    j === -1 &&
                    [4, 5, 6, 7, 12, 13, 14, 15].indexOf(
                        this.spriteMapping.indexOf(neighbor.index)
                    ) >= 0
                ) {
                    ne = true;
                }
                if (
                    i === 1 &&
                    j === 1 &&
                    [8, 9, 10, 11, 12, 13, 14, 15].indexOf(
                        this.spriteMapping.indexOf(neighbor.index)
                    ) >= 0
                ) {
                    se = true;
                }
                if (
                    i === -1 &&
                    j === 1 &&
                    [1, 3, 5, 7, 9, 11, 13, 15].indexOf(
                        this.spriteMapping.indexOf(neighbor.index)
                    ) >= 0
                ) {
                    sw = true;
                }
            }
        }
        bits = (ne ? 1 : 0) + (nw ? 8 : 0) + (se ? 2 : 0) + (sw ? 4 : 0);
        return this.spriteMapping[bits];
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
