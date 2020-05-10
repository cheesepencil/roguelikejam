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
        let visitedNodes: ForestNode[] = [];
        let walking = true;

        while (true) {
            let candidateNodes = this.getUnvisitedNeighbors(here, visitedNodes);
            if (candidateNodes.length === 0){
                break;
            }

            let nextNode = candidateNodes[Phaser.Math.Between(0,candidateNodes.length)];
            
            
        }
    }

    getNode(x: number, y: number): ForestNode {
        return this.nodes.filter((f) => {
            return f.x === x && f.y === y;
        })[0];
    }

    getUnvisitedNeighbors(here: ForestNode, visitedNodes: ForestNode[]): ForestNode[] {
        let neighbors = this.getNeighbors(here);

        let result = neighbors.filter(n => {
            return visitedNodes.filter(v => {
                return v.x === n.x && v.y === n.y;
            }).length === 0;
        });

        return result;
    }

    getNeighbors(here: ForestNode): ForestNode[] {
        let modifiers = [-1, 1];
        let results: ForestNode[] = [];

        for (let i = 0; i < modifiers.length; i++) {
            for (let j = 0; j < modifiers.length; j++) {
                let node = this.getNode(here.x + i, here.y + j);
                if (node) {
                    results.push(node);
                }
            }
        }

        return results;
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
