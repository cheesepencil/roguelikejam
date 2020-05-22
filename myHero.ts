import { MyGameScene } from "./myGameScene";
import { VillageNode } from "./villageNode";

export class MyHero extends Phaser.GameObjects.Sprite {
    body: Phaser.Physics.Arcade.Body;
    scene: MyGameScene;
    currentTile: Phaser.Tilemaps.Tile;
    lastTile: Phaser.Tilemaps.Tile;
    currentNodeCoords: Phaser.Geom.Point;
    lastNodeCoords: Phaser.Geom.Point;
    enteredNewTile: boolean;
    enteredNewNode: boolean;

    constructor(scene: MyGameScene, x: number, y: number) {
        super(scene, x, y, "dude");

        scene.add.existing(this);
        scene.physics.add.existing(this);
        scene.physics.add.collider(this, scene.village.treeBaseLayer);

        this.body = this.body as Phaser.Physics.Arcade.Body;
        this.body.setDrag(400, 400);

        this.setOrigin(0.5, 1);

        this.currentTile = this.getCurrentTile();
        this.currentNodeCoords = this.getCurrentNodeCoords();
    }

    update(): void {
        this.updateLocationProperties();
    }

    private updateLocationProperties(): void {
        this.enteredNewTile = false;
        this.enteredNewNode = false;
        const lastTile = this.currentTile;
        const lastNodeCoords = this.currentNodeCoords;

        this.currentTile = this.getCurrentTile();
        this.currentNodeCoords = this.getCurrentNodeCoords();

        if (
            lastTile?.x !== this.currentTile.x ||
            lastTile?.y !== this.currentTile.y
        ) {
            this.lastTile = lastTile;
            this.enteredNewTile = true;
        }

        if (
            lastNodeCoords?.x !== this.currentNodeCoords.x ||
            lastNodeCoords?.y !== this.currentNodeCoords.y
        ) {
            this.lastNodeCoords = lastNodeCoords;
            this.enteredNewNode = true;
        }
    }

    private getCurrentTile(): Phaser.Tilemaps.Tile {
        return this.scene.village.groundLayer.getTileAtWorldXY(this.x, this.y);
    }

    private getCurrentNodeCoords(): Phaser.Geom.Point {
        return new Phaser.Geom.Point(
            Math.floor(
                this.currentTile.x / this.scene.village.config.forestNodeWidth
            ),
            Math.floor(
                this.currentTile.y / this.scene.village.config.forestNodeHeight
            )
        );
    }
}
