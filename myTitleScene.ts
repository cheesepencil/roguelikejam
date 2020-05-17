export class MyTitleScene extends Phaser.Scene {
    constructor() {
        super({
            key: "MyTitleScene"
        });
    }

    preload() {
        //this.load.image('loading', require('./assets/loading.png'));
    }

    create() {
        this.scene.start("MyGameScene");
    }
}