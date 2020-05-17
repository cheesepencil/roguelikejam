export class MyTitleScene extends Phaser.Scene {
    constructor() {
        super({
<<<<<<< HEAD
            key: "MyTitleScene"
=======
            key: "MyTitleScene",
>>>>>>> upstream/master
        });
    }

    preload(): void {
        //this.load.image('loading', require('./assets/loading.png'));
    }

<<<<<<< HEAD
    create() {
=======
    create(): void {
>>>>>>> upstream/master
        this.scene.start("MyGameScene");
    }
}
