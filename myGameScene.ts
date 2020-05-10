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
        let forest = new Forest();
        this.drawForest(forest);
    }

    drawForest(forest: Forest) {
        for (let i = 0; i < forest.nodes.length; i++) {
            let node = forest.nodes[i];
            this.add
                .rectangle(10 + node.x * 20, 10 + node.y * 20, 10, 10, 0x0000ff)
                .setOrigin(0, 0);
            if (node.east) {
                this.add
                    .rectangle(
                        20 + node.x * 20,
                        10 + node.y * 20,
                        10,
                        10,
                        0x0000ff
                    )
                    .setOrigin(0, 0);
            }
            if (node.south) {
                this.add
                    .rectangle(
                        10 + node.x * 20,
                        20 + node.y * 20,
                        10,
                        10,
                        0x0000ff
                    )
                    .setOrigin(0, 0);
            }
        }
    }
}
