import { MyGameScene } from "./myGameScene";

export class MyNPC extends Phaser.GameObjects.Sprite {
    body: Phaser.Physics.Arcade.Body;
    scene: MyGameScene;

    constructor(scene: MyGameScene, x: number, y: number) {
        super(scene, x, y, "dude");

        scene.add.existing(this);
        scene.physics.add.existing(this);
        scene.physics.add.collider(this, scene.hero);
        this.body.setImmovable(true);

        this.setOrigin(0.5, 1);
    }
}
