import { ForestNode } from "./forestNode";

export class Forest {
    width: number;
    height: number;
    nodes: ForestNode[];
    randomizer: Phaser.Math.RandomDataGenerator;

    constructor(width: number, height: number, seed: string[]) {
        this.nodes = [];
        this.width = width;
        this.height = height;
        this.randomizer = new Phaser.Math.RandomDataGenerator(seed);

        /** build initial array of unconnected cells */
        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                let newNode: ForestNode = new ForestNode(i, j);
                this.nodes.push(newNode);
            }
        }

        // crossroads forest init
        let crossroads: ForestNode = this.getNode(
            Math.floor(width / 2),
            Math.floor(height / 2)
        );
        let starters: ForestNode[] = [
            //this.getNode(crossroads.x, crossroads.y - 1),
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
        while (passes < starters.length) {
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
                        this.randomizer.between(0, candidateNodes.length - 1)
                    ];

                nextNode.stepsFromStart = here.stepsFromStart + 1;

                this.connectNodes(here, nextNode);

                visitedNodes.push(nextNode);

                starters[i] = nextNode;
            }
        }
        // hunt and kill what's left
        let cleanup = true;
        while (cleanup) {
            let start = this.hunt();
            if (start === undefined) break;
            this.walk(start);
        }
    }

    private hunt(): ForestNode {
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
                                this.randomizer.between(
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

    private walk(start: ForestNode): void {
        let here = start;
        let walking = true;

        while (walking) {
            let candidateNodes = this.getUnvisitedNeighbors(here);
            if (candidateNodes.length === 0) {
                here.flag = "poi";
                break;
            }

            let nextNode =
                candidateNodes[
                    this.randomizer.between(0, candidateNodes.length - 1)
                ];

            nextNode.stepsFromStart = here.stepsFromStart + 1;

            this.connectNodes(here, nextNode);

            here = nextNode;
        }
    }

    private getNode(x: number, y: number): ForestNode {
        return this.nodes.filter((f) => {
            return f.x === x && f.y === y;
        })[0];
    }

    private getUnvisitedNeighbors(node: ForestNode): ForestNode[] {
        let neighbors = this.getNeighbors(node);

        let result = neighbors.filter((n) => {
            return n.connections.length === 0;
        });

        return result;
    }

    private getNeighbors(node: ForestNode): ForestNode[] {
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

    private connectNodes(firstNode: ForestNode, secondNode: ForestNode): void {
        const entrance = this.randomizer.between(0, 2);
        firstNode.connections.push({ node: secondNode, entrance });
        secondNode.connections.push({ node: firstNode, entrance });
    }

    debugDrawForest(scene: Phaser.Scene): void {
        let passageSize = 5;
        let cellSize = 15;
        let cellColor = 0x0000ff;
        let poiColor = 0xff0000;
        let passageColor = 0x00dd;
        let drawnUnitSize = cellSize + passageSize;
        for (let i = 0; i < this.nodes.length; i++) {
            let node = this.nodes[i];
            if (node.connections.length === 0) continue;
            scene.add
                .rectangle(
                    passageSize + node.x * drawnUnitSize,
                    passageSize + node.y * drawnUnitSize,
                    cellSize,
                    cellSize,
                    node.flag ? poiColor : cellColor
                )
                .setOrigin(0, 0)
                .setAlpha(0.25)
                .setScrollFactor(0);
            scene.add
                .text(
                    passageSize + node.x * drawnUnitSize,
                    passageSize + node.y * drawnUnitSize,
                    node.stepsFromStart.toString(),
                    { fontSize: "10px" }
                )
                .setOrigin(0, 0)
                .setAlpha(0.25)
                .setScrollFactor(0);
            let undrawnConnections = node.connections.filter((c) => {
                return c.node.x > node.x || c.node.y > node.y;
            });

            if (undrawnConnections.length === 0) {
                continue;
            }

            for (let j = 0; j < undrawnConnections.length; j++) {
                let neighbor = undrawnConnections[j];

                let modX = neighbor.node.x - node.x;
                let modY = neighbor.node.y - node.y;
                scene.add
                    .rectangle(
                        passageSize + cellSize * modX + node.x * drawnUnitSize,
                        passageSize + cellSize * modY + node.y * drawnUnitSize,
                        Math.abs(modX) ? passageSize : cellSize,
                        Math.abs(modY) ? passageSize : cellSize,
                        passageColor
                    )
                    .setOrigin(0, 0)
                    .setAlpha(0.25)
                    .setScrollFactor(0);
            }
        }
    }
}
