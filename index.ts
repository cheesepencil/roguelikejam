import "phaser";
import { MyGame } from "./myGame";
import { MyGameConfig } from "./gameConfig";

window.onload = (): void => {
    // eslint-disable-next-line no-unused-vars
    const game = new MyGame(MyGameConfig);
};
