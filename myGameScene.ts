import { GameObjects, Tilemaps } from "phaser";
import { Village } from "./village";

export class MyGameScene extends Phaser.Scene {
    cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    player: Phaser.Physics.Arcade.Sprite;
    cool: boolean = true;
    currentTile: Tilemaps.Tile;
    currentTileText: GameObjects.Text;
    currentNode: Phaser.Geom.Point;
    village: Village;
    panning: boolean = false;

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

        this.player = this.physics.add
            .sprite(
                Math.floor(
                    (this.village.config.width / 2) *
                        this.village.config.forestNodeWidth *
                        16
                ) +
                    16 * 12,
                Math.floor(
                    (this.village.config.height / 2) *
                        this.village.config.forestNodeHeight *
                        16
                ),
                "dude"
            )
            .setOrigin(0.5, 1);
        (this.player.body as Phaser.Physics.Arcade.Body).setDrag(200, 200);
        this.physics.add.collider(this.player, this.village.treeBaseLayer);
        this.currentTile = this.village.tilemap.getTileAtWorldXY(
            this.player.x,
            this.player.y
        );
        this.currentTileText = this.add
            .text(256, 256, `(${this.currentTile?.x}, ${this.currentTile?.y})`)
            .setOrigin(1, 1)
            .setScrollFactor(0);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1).setZoom(1);
        this.cameras.main.setBounds(
            2 * this.village.config.forestNodeWidth * 16,
            2 * this.village.config.forestNodeHeight * 16,
            this.village.config.forestNodeWidth * 16,
            this.village.config.forestNodeHeight * 16
        );
        this.scene.stop("MyVillageCreationScene");
    }

    update(time: number, delta: number): void {
        const body = this.player.body as Phaser.Physics.Arcade.Body;
        if (this.panning === false) {
            if (this.cursors.up.isDown) {
                body.setVelocityY(-100);
            }
            if (this.cursors.down.isDown) {
                body.setVelocityY(100);
            }
            if (this.cursors.right.isDown) {
                body.setVelocityX(100);
            }
            if (this.cursors.left.isDown) {
                body.setVelocityX(-100);
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
            if (
                !!this.currentNode &&
                (this.currentNode?.x !== villageNodeX ||
                    this.currentNode?.y !== villageNodeY)
            ) {
                const diffX = villageNodeX - this.currentNode.x;
                const diffY = villageNodeY - this.currentNode.y;
                const bounds = this.cameras.main.getBounds();
                this.cameras.main.setBounds(
                    bounds.x -
                        Math.abs(diffX) *
                            Math.floor(
                                (this.village.config.forestNodeWidth * 16) / 2
                            ),
                    bounds.y -
                        Math.abs(diffY) *
                            Math.floor(
                                (this.village.config.forestNodeHeight * 16) / 2
                            ),
                    bounds.width + bounds.width * Math.abs(diffX),
                    bounds.height + bounds.height * Math.abs(diffY)
                );
                this.panning = true;
                this.cool = false;
                body.setVelocity(0);
                this.cameras.main.pan(
                    this.player.x +
                        Math.ceil(this.cameras.main.width / 2) *
                            (villageNodeX - this.currentNode.x),
                    this.player.y +
                        Math.ceil(this.cameras.main.height / 2) *
                            (villageNodeY - this.currentNode.y),
                    500,
                    Phaser.Math.Easing.Linear,
                    false,
                    (camera, progress) => {
                        if (progress === 1) {
                            this.panning = false;
                            this.cameras.main.setBounds(
                                villageNodeX *
                                    this.village.config.forestNodeWidth *
                                    16,
                                villageNodeY *
                                    this.village.config.forestNodeHeight *
                                    16,
                                this.village.config.forestNodeWidth * 16,
                                this.village.config.forestNodeHeight * 16
                            );
                        }
                    }
                );
            }
            this.currentNode = new Phaser.Geom.Point(
                villageNodeX,
                villageNodeY
            );
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
