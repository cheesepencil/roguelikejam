import { Forest } from "./forest";
import { GameObjects, Tilemaps } from "phaser";
import { WangManager } from "./wangManager";
import { DIRT, DARK_GREEN_GRASS } from "./tileSpriteMappings";
import { Village } from "./village";

export class MyGameScene extends Phaser.Scene {
    cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    player: Phaser.GameObjects.Sprite;
    following: boolean = false;
    cool: boolean = true;
    currentTile: Tilemaps.Tile;
    currentTileText: GameObjects.Text;
    village: Village;

    constructor() {
        super({
            key: "MyGameScene",
        });
    }

    create(): void {
        this.cursors = this.input.keyboard.createCursorKeys();

        this.village = new Village({
            scene: this,
            seed: ["debug"],
            width: 5,
            height: 5,
            forestNodeWidth: 36,
            forestNodeHeight: 36,
        });

        const playerX =
            (Math.floor(this.village.config.width / 2) *
                this.village.config.forestNodeWidth +
                Math.floor(this.village.config.forestNodeWidth / 2)) *
            16;
        const playerY =
            (Math.floor(this.village.config.height / 2) *
                this.village.config.forestNodeHeight +
                Math.floor(this.village.config.forestNodeHeight / 2)) *
            16;

        this.player = this.add
            .sprite(
                Math.floor(
                    (this.village.config.width / 2) *
                        this.village.config.forestNodeWidth *
                        16
                ),
                Math.floor(
                    (this.village.config.height / 2) *
                        this.village.config.forestNodeHeight *
                        16
                ),
                "dude"
            )
            .setOrigin(0, 0);
        this.currentTile = this.village.tilemap.getTileAtWorldXY(
            this.player.x,
            this.player.y
        );
        this.currentTileText = this.add
            .text(256, 256, `(${this.currentTile?.x}, ${this.currentTile?.y})`)
            .setOrigin(1, 1)
            .setScrollFactor(0);
        this.following = true;
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1).setZoom(1);
        this.scene.stop("MyVillageCreationScene");
    }

    update(time: number, delta: number): void {
        if (this.following) {
            if (this.cool) {
                if (this.cursors.up.isDown) {
                    this.player.y -= 16;
                }
                if (this.cursors.down.isDown) {
                    this.player.y += 16;
                }
                if (this.cursors.right.isDown) {
                    this.player.x += 16;
                }
                if (this.cursors.left.isDown) {
                    this.player.x -= 16;
                }
                if (this.cursors.shift.isDown) {
                    this.cameras.main.zoom =
                        this.cameras.main.zoom != 0.25
                            ? (this.cameras.main.zoom = 0.25)
                            : (this.cameras.main.zoom = 1);
                }
                if (this.cursors.space.isDown) {
                    this.following = false;
                    this.cameras.main.stopFollow();
                }
                this.cooldown();
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

        const currentTile = this.village.tilemap
            .setLayer("groundLayer")
            .getTileAtWorldXY(this.player.x, this.player.y);
        const villageNodeX = Math.floor(
            currentTile.x / this.village.config.forestNodeWidth
        );
        const villageNodeY = Math.floor(
            currentTile.y / this.village.config.forestNodeHeight
        );
        if (currentTile && currentTile !== this.currentTile) {
            this.currentTile = currentTile;
            this.currentTileText.setText(
                `Tile: (${currentTile.x}, ${currentTile.y})\nNode: (${villageNodeX}, ${villageNodeY})`
            );
            if (
                this.village.villageNodes.filter(
                    (n) => n.x === villageNodeX && n.y === villageNodeY
                ).length === 0
            ) {
                this.village.drawNode(villageNodeX, villageNodeY);
            }
        }
    }

    private cooldown(): void {
        this.cool = false;
        this.time.delayedCall(
            150,
            () => {
                this.cool = true;
            },
            null,
            this
        );
    }
}
