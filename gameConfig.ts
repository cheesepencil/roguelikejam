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
    width: 640,
    height: 640,
    fps: {
        target: fps,
        //forceSetTimeOut: true
    },
    scene: [MyPreloaderScene, MyLoaderScene, MyTitleScene, MyGameScene]
};