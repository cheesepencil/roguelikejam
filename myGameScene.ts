import { Forest } from "./forest";
import { GameObjects } from "phaser";
import { WangManager } from "./wangManager";
import { DIRT, DARK_GREEN_GRASS } from "./tileSpriteMappings";
import { Village } from "./village";

export class MyGameScene extends Phaser.Scene {
    cursors: Phaser.Types.Input.Keyboard.CursorKeys;

    constructor() {
        super({
            key: "MyGameScene",
        });
    }

    create(): void {
        this.cursors = this.input.keyboard.createCursorKeys();
        const ready = new Promise<boolean>((resolve, reject) => {
            resolve(true);
            const village = new Village({
                scene: this,
                seed: undefined,
                width: 5,
                height: 5,
                forestNodeWidth: 48,
                forestNodeHeight: 48,
            });
        });
        this.scene.stop("MyVillageCreationScene");
    }

    update(time: number, delta: number): void {
        if (this.cursors.up.isDown) {
            this.cameras.main.scrollY -= 0.25 * delta;
        }
        if (this.cursors.down.isDown) {
            this.cameras.main.scrollY += 0.25 * delta;
        }
        if (this.cursors.right.isDown) {
            this.cameras.main.scrollX += 0.25 * delta;
        }
        if (this.cursors.left.isDown) {
            this.cameras.main.scrollX -= 0.25 * delta;
        }
        if (this.cursors.shift.isDown) {
            let zoom = this.cameras.main.zoom - 0.0005 * delta;
            this.cameras.main.zoom = zoom > 0 ? zoom : 0.001;
        }
        if (this.cursors.space.isDown) {
            this.cameras.main.zoom = 1;
        }
    }
}
