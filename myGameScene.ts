import { GameObjects, Tilemaps } from "phaser";
import { Village } from "./village";
import { MyHero } from "./myHero";
import { VillageNode } from "./villageNode";
import { InputManager } from "./inputManager";
import { MyUiScene } from "./myUiScene";
import { MyNPC } from "./myNpc";

export class MyGameScene extends Phaser.Scene {
    debug: boolean = true;
    hero: MyHero;
    controls: InputManager;
    npcs: Phaser.Physics.Arcade.Group;

    // world
    village: Village;

    // camera and scene
    panning: boolean = false;
    inUi: boolean = false;

    constructor() {
        super({
            key: "MyGameScene",
        });
    }

    init(): void {
        if (!this.controls) {
            this.controls = new InputManager(this);
        }
        this.scene.launch("MyUiScene", {
            debug: this.debug,
        });
    }

    create(): void {
        // create world
        this.village = new Village({
            scene: this,
            seed: ["debug"],
            width: 5,
            height: 5,
            forestNodeWidth: 36,
            forestNodeHeight: 36,
        });

        // create hero
        const startPoint = this.getHeroStartingPoint();
        this.hero = new MyHero(this, startPoint.x, startPoint.y);

        // init camera
        this.cameras.main.startFollow(this.hero, true, 0.1, 0.1).setZoom(1);
        this.cameras.main.setBounds(
            2 * this.village.config.forestNodeWidth * 16,
            2 * this.village.config.forestNodeHeight * 16,
            this.village.config.forestNodeWidth * 16,
            this.village.config.forestNodeHeight * 16
        );

        // test NPC
        const npc = new MyNPC(this, startPoint.x - 32, startPoint.y);
        this.npcs = this.physics.add.group(npc);
    }

    update(time: number, delta: number): void {
        this.hero.update();

        const body = this.hero.body;
        const input = this.controls.getInput();

        if (this.canMove()) {
            if (input.up) {
                body.setVelocityY(-100);
            }
            if (input.down) {
                body.setVelocityY(100);
            }
            if (input.right) {
                body.setVelocityX(100);
            }
            if (input.left) {
                body.setVelocityX(-100);
            }
            if (input.action) {
                // begins dialogue with a nearby NPC
                const rect = new Phaser.Geom.Rectangle(
                    this.hero.x - 16,
                    this.hero.y - 16,
                    32,
                    32
                );
                this.npcs.getChildren().forEach((n) => {
                    const npc = n as MyNPC;
                    const nearby = rect.contains(npc.x, npc.y);
                    if (nearby) {
                        this.inUi = true;
                        const ui = this.scene.get("MyUiScene");
                        ui.events.emit("startDialogue");
                    }
                });
            }
        }

        if (this.hero.enteredNewNode) {
            //debug
            const ui = this.scene.get("MyUiScene");
            ui.events.emit(
                "forestDebug",
                this.village.forest,
                this.hero.currentNodeCoords
            );

            const newNodeCoords = this.hero.currentNodeCoords;
            this.village.getNodeAt(newNodeCoords.x, newNodeCoords.y);
            this.pan();
        }

        //debug
        if (this.debug) {
            const ui = this.scene.get("MyUiScene");
            ui.events.emit("nodeCoordsDebug", this.hero.currentNodeCoords);
            ui.events.emit("tileCoordsDebug", this.hero.currentTile);
        }
    }

    private pan(): void {
        this.panning = true;
        this.hero.body.setVelocity(0);

        const currentNodeCoords = this.hero.currentNodeCoords;
        const lastNodeCoords = this.hero.lastNodeCoords;
        const diffX = currentNodeCoords.x - lastNodeCoords.x;
        const diffY = currentNodeCoords.y - lastNodeCoords.y;

        // double the camera bounds so we can pan across the node border
        const bounds = this.cameras.main.getBounds();
        this.cameras.main.setBounds(
            bounds.x -
                Math.abs(diffX) *
                    Math.floor((this.village.config.forestNodeWidth * 16) / 2),
            bounds.y -
                Math.abs(diffY) *
                    Math.floor((this.village.config.forestNodeHeight * 16) / 2),
            bounds.width + bounds.width * Math.abs(diffX),
            bounds.height + bounds.height * Math.abs(diffY)
        );

        this.cameras.main.pan(
            this.hero.x +
                Math.ceil(this.cameras.main.width / 2) *
                    (currentNodeCoords.x - lastNodeCoords.x),
            this.hero.y +
                Math.ceil(this.cameras.main.height / 2) *
                    (currentNodeCoords.y - lastNodeCoords.y),
            500,
            Phaser.Math.Easing.Linear,
            false,
            (camera, progress) => {
                if (progress === 1) {
                    this.panning = false;
                    this.cameras.main.setBounds(
                        currentNodeCoords.x *
                            this.village.config.forestNodeWidth *
                            16,
                        currentNodeCoords.y *
                            this.village.config.forestNodeHeight *
                            16,
                        this.village.config.forestNodeWidth * 16,
                        this.village.config.forestNodeHeight * 16
                    );
                }
            }
        );
    }

    getHeroStartingPoint(): Phaser.Geom.Point {
        const playerX =
            (Math.floor(this.village.config.width / 2) *
                this.village.config.forestNodeWidth +
                Math.floor(this.village.config.forestNodeWidth / 2)) *
            16;
        const playerY =
            (Math.floor(this.village.config.height / 2) *
                this.village.config.forestNodeHeight +
                Math.floor(this.village.config.forestNodeHeight / 2)) *
            16;

        return new Phaser.Geom.Point(playerX, playerY);
    }

    canMove(): boolean {
        let canMove = true;
        canMove = canMove && this.panning === false;
        canMove = canMove && this.inUi === false;
        return canMove;
    }
}
