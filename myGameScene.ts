import { Forest } from "./forest";
import { GameObjects } from "phaser";
import { WangManager } from "./wangManager";
import { DIRT, DARK_GREEN_GRASS } from "./tileSpriteMappings";
import { Village } from "./village";

export class MyGameScene extends Phaser.Scene {
    cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    player: Phaser.GameObjects.Sprite;
    following: boolean = false;
    cool: boolean = true;

    constructor() {
        super({
            key: "MyGameScene",
        });
    }

    create(): void {
        this.cursors = this.input.keyboard.createCursorKeys();

        const village = new Village({
            scene: this,
            seed: undefined,
            width: 5,
            height: 5,
            forestNodeWidth: 36,
            forestNodeHeight: 36
        });

        const playerX =
            (Math.floor(village.config.width / 2) *
                village.config.forestNodeWidth +
                Math.floor(village.config.forestNodeWidth / 2)) *
            16;
        const playerY =
            (Math.floor(village.config.height / 2) *
                village.config.forestNodeHeight +
                Math.floor(village.config.forestNodeHeight / 2)) *
            16;

        this.player = this.add.sprite(playerX, playerY, "dude");
        //this.cameras.main.startFollow(this.player);
        //this.cameras.main.setLerp(0.5);
        this.scene.stop("MyVillageCreationScene");
    }

    update(time: number, delta: number): void {
        if (this.following) {
            if (this.cursors.up.isDown) {
                this.player.y -= 0.125 * delta;
            }
            if (this.cursors.down.isDown) {
                this.player.y += 0.125 * delta;
            }
            if (this.cursors.right.isDown) {
                this.player.x += 0.125 * delta;
            }
            if (this.cursors.left.isDown) {
                this.player.x -= 0.125 * delta;
            }
            if (this.cursors.shift.isDown) {
                if (this.cool) {
                    this.cameras.main.zoom =
                        this.cameras.main.zoom === 1
                            ? (this.cameras.main.zoom = 0.25)
                            : (this.cameras.main.zoom = 1);
                    this.cooldown();
                }
            }
            if (this.cursors.space.isDown) {
                if (this.cool) {
                    this.following = false;
                    this.cameras.main.stopFollow();
                    this.cooldown();
                }
            }
        } else {
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
                if (this.cool) {
                    this.cameras.main.zoom =
                        this.cameras.main.zoom === 1
                            ? (this.cameras.main.zoom = 0.1)
                            : (this.cameras.main.zoom = 1);
                    this.cooldown();
                }
            }
            if (this.cursors.space.isDown) {
                if (this.cool) {
                    this.following = true;
                    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
                    this.cooldown();
                }
            }
        }
    }

    private cooldown(): void {
        this.cool = false;
        this.time.delayedCall(
            500,
            () => {
                this.cool = true;
            },
            null,
            this
        );
    }
}
