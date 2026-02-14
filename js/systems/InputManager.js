class InputManager {
    constructor(scene) {
        this.scene = scene;

        // Player 1 - Nadya (WASD + Space, E=place, Q=remove)
        this.p1 = {
            left: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            up: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            jump: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
            place: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
            remove: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q)
        };

        // Player 2 - Mark (Arrows + Numpad0/Enter, Numpad1=place, Numpad3=remove)
        this.p2 = {
            left: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
            right: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
            up: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
            jump: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_ZERO),
            jumpAlt: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER),
            place: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_ONE),
            remove: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_THREE)
        };
    }

    getP1() {
        return {
            left: this.p1.left.isDown,
            right: this.p1.right.isDown,
            jump: this.p1.jump.isDown,
            jumpJustDown: Phaser.Input.Keyboard.JustDown(this.p1.jump),
            shootJustDown: Phaser.Input.Keyboard.JustDown(this.p1.up),
            placeJustDown: Phaser.Input.Keyboard.JustDown(this.p1.place),
            removeJustDown: Phaser.Input.Keyboard.JustDown(this.p1.remove)
        };
    }

    getP2() {
        return {
            left: this.p2.left.isDown,
            right: this.p2.right.isDown,
            jump: this.p2.jump.isDown || this.p2.jumpAlt.isDown,
            jumpJustDown: Phaser.Input.Keyboard.JustDown(this.p2.jump) || Phaser.Input.Keyboard.JustDown(this.p2.jumpAlt),
            shootJustDown: Phaser.Input.Keyboard.JustDown(this.p2.up),
            placeJustDown: Phaser.Input.Keyboard.JustDown(this.p2.place),
            removeJustDown: Phaser.Input.Keyboard.JustDown(this.p2.remove)
        };
    }
}
