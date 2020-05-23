import { Forest } from "./forest";

export class MyUiScene extends Phaser.Scene {
    debug: boolean;
    nodeCoordsDebugText: Phaser.GameObjects.BitmapText;
    tileCoordsDebugText: Phaser.GameObjects.BitmapText;

    constructor() {
        super({
            key: "MyUiScene",
        });
    }

    create(data: { debug: boolean }): void {
        this.add
            .rectangle(8, 128 - 8, 128 - 16, 128 - 16, 0x000000, 0.5)
            .setOrigin(0, 1);
        this.add.rectangle(16, 16, 96, 96, 0x000000, 0.5).setOrigin(0, 0);
        this.add
            .rectangle(8, Math.floor(256 / 2), 256 - 16, 128 - 8, 0x000000, 0.5)
            .setOrigin(0, 0);
        const test3 =
            "Why shouldn't I make each piece of dialogue the same maximum character count as a tweet? It seems like just as good a character limit as any other, I'm sure twooter put a lot more thought than I would into the length of characters someone can read before they get bored.";
        const bitmapText = this.add
            .bitmapText(16, Math.floor(256 / 2) + 8, "munro-10", test3)
            .setOrigin(0, 0)
            .setLetterSpacing(2)
            .setMaxWidth(256 - 32 - 16 - 8);

        if (data.debug) {
            this.nodeCoordsDebugText = this.add
                .bitmapText(256 - 8, 8, "munro-10", "Node: (x,x)")
                .setOrigin(1, 0);
            this.tileCoordsDebugText = this.add
                .bitmapText(256 - 8, 20, "munro-10", "Tile: (x,x)")
                .setOrigin(1, 0);
        }

        this.events.on("nodeCoordsDebug", this.updateNodeCoordsDebug, this);
        this.events.on("tileCoordsDebug", this.updateTileCoordsDebug, this);
        this.events.on("forestDebug", this.updateForestDebug, this);
    }

    private updateNodeCoordsDebug(node: Phaser.Geom.Point): void {
        this.nodeCoordsDebugText.setText(`Node: (${node.x}, ${node.y})`);
    }

    private updateTileCoordsDebug(tile: Phaser.Tilemaps.Tile): void {
        this.tileCoordsDebugText.setText(`Tile: (${tile.x}, ${tile.y})`);
    }

    private updateForestDebug(forest: Forest, node: Phaser.Geom.Point): void {
        forest.debugDrawForest(this, node.x, node.y);
    }
}
