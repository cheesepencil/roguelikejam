export class MyLoaderScene extends Phaser.Scene {
    constructor() {
        super({
            key: "MyLoaderScene"
        });
    }

    preload(): void {
        //this.load.image('loading', require('./assets/loading.png'));
    }

    create(): void {
        this.scene.start("MyTitleScene");
    }
}