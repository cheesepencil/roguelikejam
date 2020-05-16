import { ForestNode } from "./forestNode";

export class VillageNode {
    x: number;
    y: number;
    pathCenterPoint: Phaser.Geom.Point;
    exitPoints: Phaser.Geom.Point[] = [];
    forestNode: ForestNode;

    constructor(forestNode: ForestNode, pathCenterPoint: Phaser.Geom.Point) {
        this.forestNode = forestNode;
        this.x = forestNode.x;
        this.y = forestNode.y;
        this.pathCenterPoint = pathCenterPoint;
    }
}
