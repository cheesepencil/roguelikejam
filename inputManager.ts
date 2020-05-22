import { InputAggregate } from "./inputAggregate";

export class InputManager {
    private _scene: Phaser.Scene;
    private _cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private _w_key: Phaser.Input.Keyboard.Key;
    private _s_key: Phaser.Input.Keyboard.Key;
    private _a_key: Phaser.Input.Keyboard.Key;
    private _d_key: Phaser.Input.Keyboard.Key;
    private _ctrl_key: Phaser.Input.Keyboard.Key;

    constructor(scene: Phaser.Scene) {
        this._scene = scene;
        this._w_key = scene.input.keyboard.addKey("w");
        this._s_key = scene.input.keyboard.addKey("s");
        this._a_key = scene.input.keyboard.addKey("a");
        this._d_key = scene.input.keyboard.addKey("d");
        this._ctrl_key = scene.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.CTRL
        );
        this._cursors = scene.input.keyboard.createCursorKeys();
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
        let pad = this._scene.input.gamepad?.pad1;
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
            if (pad.buttons[1]?.value > 0) result.action = true;
            if (pad.buttons[2]?.value > 0) result.cancel = true;
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
}
