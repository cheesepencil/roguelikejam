import { Forest } from "./forest";

export class ForestNode {
    x: number;
    y: number;
    connections: ForestNode[];
    stepsFromStart: number;
    flag: string;

    constructor(x: number, y: number, stepsFromStart: number = 0) {
        this.x = x;
        this.y = y;
        this.stepsFromStart = stepsFromStart;
        this.connections = [];
    }
}
