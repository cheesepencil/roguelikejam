export class MyVillageCreationScene extends Phaser.Scene {
    launched = false;
    text: any;

    constructor() {
        super({
            key: "MyVillageCreationScene",
        });
    }

    preload(): void {
        //this.load.image('loading', require('./assets/loading.png'));
    }

    create(): void {
        this.text = this.add.text(10, 10, "loading");
    }

    update(t: number, d: number): void {
        if (!this.launched) {
            this.launched = true;
            this.time.delayedCall(50, () => {
                this.scene.launch("MyGameScene");
            });
        }
    }
}
