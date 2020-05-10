import { Forest } from "./forest";

export class ForestNode {
    forest: Forest;
    x: number;
    y: number;
    north: ForestNode;
    south: ForestNode;
    east: ForestNode;
    west: ForestNode;

    constructor(x: number, y: number, forest: Forest) {
        this.x = x;
        this.y = y;
        this.forest = forest;
    }
}
