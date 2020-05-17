export class MyVillageCreationScene extends Phaser.Scene {
    launched = false;
    text: any;

    constructor() {
        super({
            key: "MyVillageCreationScene",
        });
    }

    create(): void {
        this.text = this.add.text(128, 128, "loading").setOrigin(0.5, 0.5);
    }

    update(t: number, d: number): void {
        if (!this.launched) {
            this.launched = true;
            this.time.delayedCall(300, () => {
                this.scene.launch("MyGameScene");
            });
        }
    }
}
