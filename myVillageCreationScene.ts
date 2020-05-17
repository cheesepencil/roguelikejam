export class MyVillageCreationScene extends Phaser.Scene {
    launched = false;
    text: any;

    constructor() {
        super({
            key: "MyVillageCreationScene",
        });
    }

    create(): void {
        this.text = this.add.text(10, 10, "loading");
    }

    update(t: number, d: number): void {
        if (!this.launched) {
            this.launched = true;
            this.time.delayedCall(50, () => {});
        }
    }
}
