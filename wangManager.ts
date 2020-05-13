import { DARK_GREEN_GRASS } from "./tileSpriteMappings";

export class WangManager {
    spriteMapping: number[];
    wangTiles: WangTile[] = [];
    layer: Phaser.Tilemaps.DynamicTilemapLayer;

    constructor(layer: Phaser.Tilemaps.DynamicTilemapLayer, spriteMapping: number[] = undefined) {
        this.layer = layer;
        if (spriteMapping === undefined) {
            this.spriteMapping = DARK_GREEN_GRASS;
        }
    }

    addPoints(points: Phaser.Geom.Point[]) {
        points.forEach(p => {
            let topLeft = this.getWang(p.x - 1, p.y - 1);
            topLeft.cornerBits += 2;
            let topRight = this.getWang(p.x, p.y - 1);
            topRight.cornerBits += 4;
            let bottomLeft = this.getWang(p.x - 1, p.y);
            bottomLeft.cornerBits += 1;
            let bottomRight = this.getWang(p.x, p.y);
            bottomRight.cornerBits += 8;
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
}