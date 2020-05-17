export class MyPreloaderScene extends Phaser.Scene {
    constructor() {
        super({
            key: "MyPreloaderScene",
        });
    }

    preload(): void {
        //this.load.image('village', require('./assets/village.png'));
        this.load.image("village", require("./assets/village.png"));
        this.load.image("dude", require("./assets/dude.png"));
    }

    create(): void {
        this.scene.start("MyLoaderScene");
    }
}
