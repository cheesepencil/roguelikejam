import { MyPreloaderScene } from "./myPreloaderScene";
import { MyLoaderScene } from "./myLoaderScene";
import { MyTitleScene } from "./myTitleScene";
import { MyGameScene } from "./myGameScene";

type GameConfig = Phaser.Types.Core.GameConfig;

let fps = 60;

export const MyGameConfig: GameConfig = {
    type: Phaser.AUTO,
    input: {
        //gamepad: true,
        keyboard: true
    },
    render: {
        pixelArt: true,
        antialias: false 
    },
    scale: {
        mode: Phaser.Scale.FIT
    },
    parent: 'game-parent',
    physics: {
        default: 'arcade',
        arcade: {
            //debug: true,
            gravity: { y: 0 },
            fps: fps
        }
    },
    width: 192,
    height: 192,
    fps: {
        target: fps,
        //forceSetTimeOut: true
    },
    scene: [MyPreloaderScene, MyLoaderScene, MyTitleScene, MyGameScene]
};