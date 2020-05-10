import { ForestNode } from "./forestNode";

export class Forest {
    directions: string[] = ["north", "east", "south", "west"];
    nodes: ForestNode[];

    constructor() {
        this.nodes = [];

        // build initial array of unconnected cells
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                let newNode = new ForestNode(i, j, this);
                this.nodes.push(newNode);
            }
        }

        let here = this.getNode(4, 4);
        let walking = true;
        while (walking) {

            let direction = this.directions[Phaser.Math.Between(0, 3)];
            if ("north") {

            }
            break;
        }
    }

    getNode(x: number, y: number): ForestNode {
        return this.nodes.filter((f) => {
            return f.x === x && f.y === y;
        })[0];
    }

    getOppositeDirection(direction: string): string {
        let index = this.directions.indexOf(direction);
        let opposite = index - 2;
        if (opposite < 0) {
            opposite += 4;
        }

        return this.directions[opposite];
    }
}
