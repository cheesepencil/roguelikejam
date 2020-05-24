import { InputAggregate } from "./inputAggregate";

export class InputManager {
    private _game_scene: Phaser.Scene;
    private _cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private _w_key: Phaser.Input.Keyboard.Key;
    private _s_key: Phaser.Input.Keyboard.Key;
    private _a_key: Phaser.Input.Keyboard.Key;
    private _d_key: Phaser.Input.Keyboard.Key;
    private _ctrl_key: Phaser.Input.Keyboard.Key;

    constructor(gameScene: Phaser.Scene) {
        // space action
        // shift cancel
        // ctrl menu

        this._game_scene = gameScene;
        this._w_key = gameScene.input.keyboard.addKey("w");
        this._s_key = gameScene.input.keyboard.addKey("s");
        this._a_key = gameScene.input.keyboard.addKey("a");
        this._d_key = gameScene.input.keyboard.addKey("d");
        this._ctrl_key = gameScene.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.CTRL
        );
        this._cursors = gameScene.input.keyboard.createCursorKeys();

        // menu events
        this._cursors.up.on("down", this.menuUp, this);
        this._w_key.on("down", this.menuUp, this);
        this._cursors.down.on("down", this.menuDown, this);
        this._s_key.on("down", this.menuDown, this);
        this._cursors.space.on("up", this.menuAction, this);
        this._ctrl_key.on("down", this.menuToggle, this);
    }

    getInput(): InputAggregate {
        let result: InputAggregate = new InputAggregate();
        result.up = false;
        result.down = false;
        result.left = false;
        result.cancel = false;
        result.action = false;
        result.menu = false;

        // pad
        let pad = this._game_scene.input.gamepad?.pad1;
        if (pad) {
            pad.setAxisThreshold(0.25);

            // left stick
            if (pad.axes[1]?.getValue() > 0) result.down = true;
            if (pad.axes[1]?.getValue() < 0) result.up = true;
            if (pad.axes[0]?.getValue() > 0) result.right = true;
            if (pad.axes[0]?.getValue() < 0) result.left = true;

            // d-pad
            if (pad.buttons[12]?.value > 0) result.up = true;
            if (pad.buttons[13]?.value > 0) result.down = true;
            if (pad.buttons[14]?.value > 0) result.left = true;
            if (pad.buttons[15]?.value > 0) result.right = true;

            // buttons
            if (pad.A) result.action = true;
            if (pad.B) result.cancel = true;
            if (pad.buttons[3]?.value > 0) result.menu = true;
        }

        // keyboard input
        if (this._w_key.isDown || this._cursors.up.isDown) result.up = true;
        if (this._s_key.isDown || this._cursors.down.isDown) result.down = true;
        if (this._a_key.isDown || this._cursors.left.isDown) result.left = true;
        if (this._d_key.isDown || this._cursors.right.isDown)
            result.right = true;
        if (this._cursors.shift.isDown) result.cancel = true;
        if (this._cursors.space.isDown) result.action = true;
        if (this._ctrl_key.isDown) result.menu = true;

        return result;
    }

    menuDown(): void {
        const ui = this._game_scene.scene.get("MyUiScene");
        ui.events.emit("menuDown");
    }

    menuUp(): void {
        const ui = this._game_scene.scene.get("MyUiScene");
        ui.events.emit("menuUp");
    }

    menuAction(): void {
        const ui = this._game_scene.scene.get("MyUiScene");
        ui.events.emit("menuAction");
    }

    menuCancel(): void {
        const ui = this._game_scene.scene.get("MyUiScene");
        ui.events.emit("menuCancel");
    }

    menuToggle(): void {
        const ui = this._game_scene.scene.get("MyUiScene");
        ui.events.emit("menuToggle");
    }
}
