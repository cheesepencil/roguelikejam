export class MyPreloaderScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'MyPreloaderScene'
        });
    }

    preload() {
        //this.load.image('village', require('./assets/village.png'));
        this.load.image('village', require('./assets/village.png'));
    }

    create() {
        this.scene.start('MyLoaderScene');
    }
}