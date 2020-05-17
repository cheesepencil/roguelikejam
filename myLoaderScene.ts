export class MyLoaderScene extends Phaser.Scene {
    constructor() {
        super({
            key: "MyLoaderScene"
        });
    }

    preload() {
        //this.load.image('loading', require('./assets/loading.png'));
    }

    create() {
        this.scene.start("MyTitleScene");
    }
}