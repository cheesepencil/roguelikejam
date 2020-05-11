import { Forest } from "./forest";

export class MyGameScene extends Phaser.Scene {
    constructor() {
        super({
            key: "MyGameScene",
        });
    }

    preload() {
        //this.load.image('loading', require('./assets/loading.png'));
    }

    create() {
        let forest = new Forest(5, 4);

        let pois = forest.nodes.filter((n) => n.flag === "poi");
        let poiCount = pois.length;
        let maxSteps = pois.reduce((previous, current, index) => {
            return current.stepsFromStart > previous.stepsFromStart
                ? current
                : previous;
        }, pois[0]).stepsFromStart;
        let minSteps = pois.reduce((previous, current, index) => {
            return current.stepsFromStart > previous.stepsFromStart
                ? previous
                : current;
        }, pois[0]).stepsFromStart;
        console.log(
            `${poiCount} points of interest! Max ${maxSteps} steps, min ${minSteps} steps`
        );

        this.drawForest(forest);
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
