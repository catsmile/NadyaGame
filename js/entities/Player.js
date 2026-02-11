class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, key) {
        super(scene, x, y, key + '_0');
        this.playerKey = key;
        this.alive = true;
        this.finished = false;
        this.invincible = false;
        this.spawnX = x;
        this.spawnY = y;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setSize(12, 14);
        this.setOffset(2, 2);
        this.setCollideWorldBounds(false);
        this.setDepth(10);
    }

    handleInput(input) {
        if (!this.alive || this.finished) return;

        const onGround = this.body.blocked.down;

        // Horizontal movement
        if (input.left) {
            this.setVelocityX(-PLAYER.SPEED);
            this.setFlipX(true);
        } else if (input.right) {
            this.setVelocityX(PLAYER.SPEED);
            this.setFlipX(false);
        } else {
            this.setVelocityX(0);
        }

        // Jump
        if (input.jumpJustDown && onGround) {
            this.setVelocityY(PLAYER.JUMP_VELOCITY);
        }

        // Variable jump height: cut jump short if button released
        if (!input.jump && this.body.velocity.y < PLAYER.JUMP_CUT) {
            this.setVelocityY(PLAYER.JUMP_CUT);
        }

        // Animations
        if (!onGround) {
            this.play(this.playerKey + '_jump', true);
        } else if (this.body.velocity.x !== 0) {
            this.play(this.playerKey + '_walk', true);
        } else {
            this.play(this.playerKey + '_idle', true);
        }
    }

    die() {
        if (!this.alive || this.invincible) return;
        this.alive = false;
        this.play(this.playerKey + '_dead');
        this.body.setAllowGravity(true);
        this.setVelocity(0, PLAYER.JUMP_VELOCITY);
        this.body.checkCollision.none = true;
        this.setDepth(20);

        this.scene.time.delayedCall(2000, () => {
            this.setVisible(false);
        });
    }

    respawn(x, y) {
        this.alive = true;
        this.setPosition(x, y);
        this.setVelocity(0, 0);
        this.body.checkCollision.none = false;
        this.setVisible(true);
        this.setDepth(10);
        this.setAlpha(0.5);
        this.invincible = true;

        this.scene.time.delayedCall(PLAYER.INVINCIBLE_TIME, () => {
            this.setAlpha(1);
            this.invincible = false;
        });
    }

    bounce() {
        this.setVelocityY(PLAYER.BOUNCE);
    }

    // NES-style flag sequence: grab pole → slide down → hop off → walk to castle
    startFlagSlide(poleX, topY, bottomY, onComplete) {
        this.finished = true;
        this.body.setAllowGravity(false);
        this.setVelocity(0, 0);
        this.body.checkCollision.none = true;

        // Snap to pole
        this.x = poleX + 6;
        this.setFlipX(true);
        this.play(this.playerKey + '_idle', true);

        // Clamp grab position: don't start above the pole top
        const grabY = Math.max(this.y, topY);
        this.y = grabY;

        // Slide duration depends on how high the player grabbed
        const slideDistance = bottomY - grabY;
        const slideDuration = Math.max(slideDistance * 6, 200);

        // Slide down
        this.scene.tweens.add({
            targets: this,
            y: bottomY,
            duration: slideDuration,
            ease: 'Linear',
            onComplete: () => {
                // Hop off to the right
                this.setFlipX(false);
                this.play(this.playerKey + '_jump', true);
                this.body.setAllowGravity(true);
                this.body.checkCollision.none = false;
                this.setVelocity(60, -150);

                // After landing, walk right towards castle
                this.scene.time.delayedCall(400, () => {
                    this.play(this.playerKey + '_walk', true);
                    this.setVelocityX(PLAYER.SPEED / 2);
                    // Stop after walking a bit
                    this.scene.time.delayedCall(1500, () => {
                        this.setVelocity(0, 0);
                        this.play(this.playerKey + '_idle', true);
                        if (onComplete) onComplete();
                    });
                });
            }
        });
    }
}
