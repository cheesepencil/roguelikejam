import { Forest } from "./forest";
import { GameObjects } from "phaser";
import { WangManager } from "./wangManager";

export class MyGameScene extends Phaser.Scene {
    constructor() {
        super({
            key: "MyGameScene",
        });
    }

    create() {
        const map = this.make.tilemap({
            tileWidth: 16,
            tileHeight: 16,
            width: 12,
            height: 12,
        });

        this.add.existing(map as any);

        const tileset = map.addTilesetImage("village", null, 16, 16, 0, 0);

        const layer = map.createBlankDynamicLayer("ground1", tileset);

        layer.fill(96);

        let spots = [
            [Math.floor(map.width * 0.25), Math.floor(map.height * 0.25)],
            [Math.floor(map.width * 0.75), Math.floor(map.height * 0.25)],
            [Math.floor(map.width * 0.25), Math.floor(map.height * 0.75)],
            [Math.floor(map.width * 0.75), Math.floor(map.height * 0.75)],
        ];

        // border
        layer.putTileAt(41, 0, 0);
        layer.putTileAt(40, map.width - 1, 0);
        layer.putTileAt(9, 0, map.height - 1);
        layer.putTileAt(8, map.width - 1, map.height - 1);
        layer.fill(70, 1, 0, map.width - 2, 1);
        layer.fill(6, 1, map.height - 1, map.width - 2, 1);
        layer.fill(39, 0, 1, 1, map.height - 2);
        layer.fill(37, map.width - 1, 1, 1, map.height - 2);

        let patchPoints: Phaser.Geom.Point[] = [
            new Phaser.Geom.Point(6, 6),
            new Phaser.Geom.Point(8, 6),
            new Phaser.Geom.Point(7, 7),
            new Phaser.Geom.Point(6, 7),
            new Phaser.Geom.Point(7, 6),
            new Phaser.Geom.Point(7, 8),
            new Phaser.Geom.Point(1, 1)
        ];

        let wangManager = new WangManager(layer);
        wangManager.addPoints(patchPoints);
        wangManager.draw();

        // let forest = new Forest(5, 5);

        // let pois = forest.nodes.filter((n) => n.flag === "poi");
        // let poiCount = pois.length;
        // let maxSteps = pois.reduce((previous, current, index) => {
        //     return current.stepsFromStart > previous.stepsFromStart
        //         ? current
        //         : previous;
        // }, pois[0]).stepsFromStart;
        // let minSteps = pois.reduce((previous, current, index) => {
        //     return current.stepsFromStart > previous.stepsFromStart
        //         ? previous
        //         : current;
        // }, pois[0]).stepsFromStart;
        // console.log(
        //     `${poiCount} points of interest! Max ${maxSteps} steps, min ${minSteps} steps`
        // );

        // this.drawForest(forest);
    }

    drawForest(forest: Forest) {
        let passageSize = 5;
        let cellSize = 15;
        let cellColor = 0x0000ff;
        let poiColor = 0xff0000;
        let passageColor = 0x00dd;
        let drawnUnitSize = cellSize + passageSize;
        for (let i = 0; i < forest.nodes.length; i++) {
            let node = forest.nodes[i];
            if (node.connections.length === 0) continue;
            this.add
                .rectangle(
                    passageSize + node.x * drawnUnitSize,
                    passageSize + node.y * drawnUnitSize,
                    cellSize,
                    cellSize,
                    node.flag ? poiColor : cellColor
                )
                .setOrigin(0, 0);
            this.add
                .text(
                    passageSize + node.x * drawnUnitSize,
                    passageSize + node.y * drawnUnitSize,
                    node.stepsFromStart.toString(),
                    { fontSize: "10px" }
                )
                .setOrigin(0, 0);
            let undrawnConnections = node.connections.filter((c) => {
                return c.x > node.x || c.y > node.y;
            });

            if (undrawnConnections.length === 0) {
                continue;
            }

            for (let j = 0; j < undrawnConnections.length; j++) {
                let neighbor = undrawnConnections[j];

                let modX = neighbor.x - node.x;
                let modY = neighbor.y - node.y;
                this.add
                    .rectangle(
                        passageSize + cellSize * modX + node.x * drawnUnitSize,
                        passageSize + cellSize * modY + node.y * drawnUnitSize,
                        Math.abs(modX) ? passageSize : cellSize,
                        Math.abs(modY) ? passageSize : cellSize,
                        passageColor
                    )
                    .setOrigin(0, 0);
            }
        }
    }
}
