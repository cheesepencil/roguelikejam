export class MyTitleScene extends Phaser.Scene {
    constructor() {
        super({
            key: "MyTitleScene",
        });
    }

    preload(): void {
        //this.load.image('loading', require('./assets/loading.png'));
    }

    create(): void {
        this.scene.start("MyGameScene");
    }
}
