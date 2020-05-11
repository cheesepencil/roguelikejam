import { ForestNode } from "./forestNode";

export class Forest {
    width: number;
    height: number;
    nodes: ForestNode[];

    constructor(width: number, height: number) {
        this.nodes = [];
        this.width = width;
        this.height = height;

        /** build initial array of unconnected cells */
        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                let newNode = new ForestNode(i, j);
                this.nodes.push(newNode);
            }
        }

        // crossroads forest init
        let crossroads = this.getNode(
            Math.floor(width / 2),
            Math.floor(height / 2)
        );
        let starters = [
            this.getNode(crossroads.x, crossroads.y - 1),
            this.getNode(crossroads.x, crossroads.y + 1),
            this.getNode(crossroads.x - 1, crossroads.y),
            this.getNode(crossroads.x + 1, crossroads.y),
        ];
        let visitedNodes: ForestNode[] = [crossroads, ...starters];
        for (let i = 0; i < starters.length; i++) {
            this.connectNodes(crossroads, starters[i]);
            starters[i].stepsFromStart = 1;
        }

        let passes = 0;
        while (passes < 4) {
            passes = 0;
            for (let i = 0; i < starters.length; i++) {
                let here = starters[i];
                let candidateNodes = this.getUnvisitedNeighbors(here);
                if (candidateNodes.length === 0) {
                    here.flag = "poi";
                    passes++;
                    continue;
                }

                let nextNode =
                    candidateNodes[
                        Phaser.Math.Between(0, candidateNodes.length - 1)
                    ];

                nextNode.stepsFromStart = here.stepsFromStart + 1;

                this.connectNodes(here, nextNode);

                visitedNodes.push(nextNode);

                starters[i] = nextNode;
            }
        }
        // hunt and kill what's left
        while (true) {
            let start = this.hunt();
            if (start === undefined) break;
            this.walk(start);
        }
    }

    hunt(): ForestNode {
        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                let node = this.getNode(i, j);
                // is it unvisited?
                if (node.connections.length === 0) {
                    // does it have visited neighbors?
                    let neighbors = this.getNeighbors(node);
                    let visitedNeighbors = neighbors.filter((n) => {
                        return n.connections.length > 0;
                    });
                    if (visitedNeighbors.length > 0) {
                        let neighbor =
                            visitedNeighbors[
                                Phaser.Math.Between(
                                    0,
                                    visitedNeighbors.length - 1
                                )
                            ];

                        this.connectNodes(node, neighbor);
                        node.stepsFromStart = neighbor.stepsFromStart + 1;
                        return node;
                    }
                }
            }
        }

        return undefined;
    }

    walk(start: ForestNode) {
        let here = start;

        while (true) {
            let candidateNodes = this.getUnvisitedNeighbors(here);
            if (candidateNodes.length === 0) {
                here.flag = "poi";
                break;
            }

            let nextNode =
                candidateNodes[
                    Phaser.Math.Between(0, candidateNodes.length - 1)
                ];

            nextNode.stepsFromStart = here.stepsFromStart + 1;

            this.connectNodes(here, nextNode);

            here = nextNode;
        }
    }

    getNode(x: number, y: number): ForestNode {
        return this.nodes.filter((f) => {
            return f.x === x && f.y === y;
        })[0];
    }

    getUnvisitedNeighbors(node: ForestNode): ForestNode[] {
        let neighbors = this.getNeighbors(node);

        let result = neighbors.filter((n) => {
            return n.connections.length === 0;
        });

        return result;
    }

    getNeighbors(node: ForestNode): ForestNode[] {
        let modifiers = [-1, 1];
        let results: ForestNode[] = [];

        for (let i = 0; i < modifiers.length; i++) {
            let horizontalNeighbor = this.getNode(
                node.x + modifiers[i],
                node.y
            );
            if (horizontalNeighbor) {
                results.push(horizontalNeighbor);
            }
            let verticalNeighbor = this.getNode(node.x, node.y + modifiers[i]);
            if (verticalNeighbor) {
                results.push(verticalNeighbor);
            }
        }

        return results;
    }

    connectNodes(firstNode: ForestNode, secondNode: ForestNode) {
        firstNode.connections.push(secondNode);
        secondNode.connections.push(firstNode);
    }
}
