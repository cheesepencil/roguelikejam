export class MyPreloaderScene extends Phaser.Scene {
    constructor() {
        super({
            key: "MyPreloaderScene",
        });
    }

    preload(): void {
        //this.load.image('village', require('./assets/village.png'));
        this.load.image("village", require("./assets/village.png"));
        this.load.spritesheet("treetops", require("./assets/treetops.png"), {
            frameWidth: 48,
            frameHeight: 48,
        });
        this.load.image("dude", require("./assets/dude.png"));
    }

    create(): void {
        this.scene.start("MyLoaderScene");
    }
}
