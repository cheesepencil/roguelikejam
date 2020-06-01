export class MyLoaderScene extends Phaser.Scene {
    constructor() {
        super({
            key: "MyLoaderScene",
        });
    }

    preload(): void {
        this.load.image("village", require("./assets/village.png"));
        this.load.spritesheet("treetops", require("./assets/treetops.png"), {
            frameWidth: 48,
            frameHeight: 48,
        });
        this.load.image("dude", require("./assets/fox.png"));
        this.load.bitmapFont(
            "munro-10",
            require("./fonts/munro-10.png"),
            require("./fonts/munro-10.xml")
        );
    }

    create(): void {
        this.scene.start("MyTitleScene");
    }
}
