import "phaser";
import { MyGame } from "./myGame";
import { MyGameConfig } from "./gameConfig";

window.onload = (): void => {
    const game = new MyGame(MyGameConfig);
};
