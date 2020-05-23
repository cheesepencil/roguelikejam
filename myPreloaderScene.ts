export class MyPreloaderScene extends Phaser.Scene {
    constructor() {
        super({
            key: "MyPreloaderScene",
        });
    }

    preload(): void {}

    create(): void {
        this.scene.start("MyLoaderScene");
    }
}
