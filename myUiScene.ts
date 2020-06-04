import { Forest } from "./forest";
import { InputManager } from "./inputManager";
import { REPLServer } from "repl";

export class MyUiScene extends Phaser.Scene {
    // dialogue
    textContainer: Phaser.GameObjects.Container;
    textBg: Phaser.GameObjects.Rectangle;
    bitmapText: Phaser.GameObjects.BitmapText;

    // profile
    profileContainer: Phaser.GameObjects.Container;
    profileBg: Phaser.GameObjects.Rectangle;

    // debug
    debug: boolean;
    nodeCoordsDebugText: Phaser.GameObjects.BitmapText;
    tileCoordsDebugText: Phaser.GameObjects.BitmapText;

    constructor() {
        super({
            key: "MyUiScene",
        });
    }

    create(data: { debug: boolean }): void {
        this.textContainer = this.add.container(0, 0);
        this.profileContainer = this.add.container(0, 0);
        this.textBg = this.add
            .rectangle(64, 8, 184, 72, 0x000000, 0.5)
            .setOrigin(0, 0);
        this.textContainer.add(this.textBg);
        const test3 =
            "Here is what 140 characters looks like. No, we are not there yet! But, we are getting close! Be patient. The end is coming soon. We made it!";
        this.bitmapText = this.add
            .bitmapText(70, 12, "munro-10", test3)
            .setOrigin(0, 0)
            .setLetterSpacing(2)
            .setMaxWidth(256 - 64 - 16 - 10 - 16);
        this.textContainer.add(this.bitmapText);
        this.textBg.height = this.bitmapText.height + 8;
        this.textContainer.setX(256);

        this.profileBg = this.add
            .rectangle(8, 8, 48, 48, 0x000000, 0.5)
            .setOrigin(0, 0);
        this.profileContainer.add(this.profileBg);
        this.profileContainer.setX(-256);

        if (data.debug) {
            this.nodeCoordsDebugText = this.add
                .bitmapText(256 - 8, 256 - 8, "munro-10", "Node: (x,x)")
                .setOrigin(1, 1);
            this.tileCoordsDebugText = this.add
                .bitmapText(256 - 8, 256 - 20, "munro-10", "Tile: (x,x)")
                .setOrigin(1, 1);
        }

        // dialogue
        this.events.on("startDialogue", this.startDialogue, this);

        // menu navigation
        this.events.on("menuToggle", this.menuToggle, this);
        this.events.on("menuAction", this.menuAction, this);
        this.events.on("menuCancel", this.menuCancel, this);
        this.events.on("menuUp", this.menuUp, this);
        this.events.on("menuDown", this.menuDown, this);

        // debug
        this.events.on("nodeCoordsDebug", this.updateNodeCoordsDebug, this);
        this.events.on("tileCoordsDebug", this.updateTileCoordsDebug, this);
        this.events.on("forestDebug", this.updateForestDebug, this);
    }

    private startDialogue(): void {
        this.tweens.add({
            targets: [this.profileContainer],
            x: 0,
            duration: 500,
            repeat: 0,
        });
        this.tweens.add({
            targets: [this.textContainer],
            x: 0,
            duration: 500,
            repeat: 0,
        });
    }

    private menuToggle(): void {}

    private menuAction(): void {}

    private menuCancel(): void {}

    private menuUp(): void {}

    private menuDown(): void {}

    private updateNodeCoordsDebug(node: Phaser.Geom.Point): void {
        this.nodeCoordsDebugText.setText(`Node: (${node.x}, ${node.y})`);
    }

    private updateTileCoordsDebug(tile: Phaser.Tilemaps.Tile): void {
        this.tileCoordsDebugText.setText(`Tile: (${tile.x}, ${tile.y})`);
    }

    private updateForestDebug(forest: Forest, node: Phaser.Geom.Point): void {
        if ((this.data as any).debug) {
            forest.debugDrawForest(this, node.x, node.y);
        }
    }
}
