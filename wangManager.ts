import { DARK_GREEN_GRASS } from "./tileSpriteMappings";
import { exists } from "fs";

export class WangManager {
    spriteMapping: number[];
    wangTiles: WangTile[] = [];
    layer: Phaser.Tilemaps.DynamicTilemapLayer;

    constructor(layer: Phaser.Tilemaps.DynamicTilemapLayer, spriteMapping: number[] = undefined) {
        this.layer = layer;
        if (spriteMapping === undefined) {
            this.spriteMapping = DARK_GREEN_GRASS;
        } else {
            this.spriteMapping = spriteMapping;
        }
    }

    addPoints(points: Phaser.Geom.Point[]) {
        points.forEach(p => {
            this.getWang(p.x - 1, p.y - 1)?.topLeftify();
            this.getWang(p.x, p.y - 1)?.topRightify()
            this.getWang(p.x - 1, p.y)?.bottomLeftify();
            this.getWang(p.x, p.y)?.bottomRightify();
        });
    }

    getWang(x: number, y: number) {
        let wang = this.wangTiles.filter(w => {
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

    draw() {
        this.wangTiles.forEach(w => {
            this.layer.putTileAt(this.spriteMapping[w.cornerBits], w.x, w.y);
        });
    }

    wangify() {
        const solids = this.layer.filterTiles((t: Phaser.Tilemaps.Tile) => {
            return t.index === this.spriteMapping[15];
        }, this);
        const vertices: Phaser.Geom.Point[] = [];
        solids.forEach(s => {
            for (let i = 0; i < 2; i++) {
                for (let j = 0; j < 2; j++) {
                    let point = new Phaser.Geom.Point(s.x + i, s.y + j);
                    if (vertices.filter(v => {
                        return v.x === point.x && v.y === point.y;
                    }).length === 0) {
                        vertices.push(point);
                    }
                }
            }
        });
        console.log(vertices.length);
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

    topLeftify() {
        this.cornerBits += 2;
    }

    topRightify() {
        this.cornerBits += 4;
    }

    bottomLeftify() {
        this.cornerBits += 1;
    }

    bottomRightify() {
        this.cornerBits += 8;
    }
}