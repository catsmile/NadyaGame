class InputManager {
    constructor(scene) {
        this.scene = scene;

        // Player 1 - Nadya (WASD + Space)
        this.p1 = {
            left: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            up: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            jump: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
        };

        // Player 2 - Mark (Arrows + Numpad0/Enter)
        this.p2 = {
            left: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
            right: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
            up: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
            jump: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_ZERO),
            jumpAlt: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)
        };
    }

    getP1() {
        return {
            left: this.p1.left.isDown,
            right: this.p1.right.isDown,
            jump: this.p1.jump.isDown,
            jumpJustDown: Phaser.Input.Keyboard.JustDown(this.p1.jump)
        };
    }

    getP2() {
        return {
            left: this.p2.left.isDown,
            right: this.p2.right.isDown,
            jump: this.p2.jump.isDown || this.p2.jumpAlt.isDown,
            jumpJustDown: Phaser.Input.Keyboard.JustDown(this.p2.jump) || Phaser.Input.Keyboard.JustDown(this.p2.jumpAlt)
        };
    }
}
