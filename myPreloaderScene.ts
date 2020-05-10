export class MyPreloaderScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'MyPreloaderScene'
        });
    }

    preload() {
        //this.load.image('loading', require('./assets/loading.png'));
    }

    create() {
        this.scene.start('MyLoaderScene');
    }
}