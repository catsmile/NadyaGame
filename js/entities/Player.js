class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, key) {
        super(scene, x, y, key + '_0');
        this.playerKey = key;
        this.alive = true;
        this.finished = false;
        this.invincible = false;
        this.spawnX = x;
        this.spawnY = y;

        // Double jump
        this.jumpsLeft = PLAYER.MAX_JUMPS;

        // Power-ups
        this.hasFire = false;
        this.hasLowGrav = false;
        this.baseGravityY = GRAVITY;
        this.fireTimer = null;
        this.lowGravTimer = null;
        this.fireParticleTimer = 0;

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

        // Reset jumps when on ground
        if (onGround) {
            this.jumpsLeft = PLAYER.MAX_JUMPS;
        }

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

        // Jump / double jump
        if (input.jumpJustDown && this.jumpsLeft > 0) {
            this.setVelocityY(PLAYER.JUMP_VELOCITY);
            this.jumpsLeft--;
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

    applyFire() {
        // Clear previous fire timer if any
        if (this.fireTimer) this.fireTimer.remove(false);

        this.hasFire = true;
        this.setTint(0xff6600);

        this.fireTimer = this.scene.time.delayedCall(PLAYER.FIRE_DURATION, () => {
            this.clearFire();
        });
    }

    clearFire() {
        this.hasFire = false;
        if (!this.hasLowGrav) {
            this.clearTint();
        } else {
            this.setTint(0x60b0ff);
        }
        this.fireTimer = null;
    }

    applyLowGrav() {
        if (this.lowGravTimer) this.lowGravTimer.remove(false);

        this.hasLowGrav = true;
        this.body.gravity.y = -GRAVITY * (1 - PLAYER.LOW_GRAV_FACTOR);
        if (!this.hasFire) {
            this.setTint(0x60b0ff);
        }

        this.lowGravTimer = this.scene.time.delayedCall(PLAYER.LOW_GRAV_DURATION, () => {
            this.clearLowGrav();
        });
    }

    clearLowGrav() {
        this.hasLowGrav = false;
        this.body.gravity.y = 0;
        if (!this.hasFire) {
            this.clearTint();
        } else {
            this.setTint(0xff6600);
        }
        this.lowGravTimer = null;
    }

    die() {
        if (!this.alive || this.invincible) return;
        this.alive = false;
        this.hasFire = false;
        this.hasLowGrav = false;
        this.body.gravity.y = 0;
        this.clearTint();
        if (this.fireTimer) { this.fireTimer.remove(false); this.fireTimer = null; }
        if (this.lowGravTimer) { this.lowGravTimer.remove(false); this.lowGravTimer = null; }

        this.play(this.playerKey + '_dead');
        this.body.setAllowGravity(true);
        this.setVelocity(0, PLAYER.JUMP_VELOCITY);
        this.body.checkCollision.none = true;
        this.setDepth(20);

        // Glitch effect
        if (this.scene.screenGlitch) {
            this.scene.screenGlitch();
        }

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
        this.jumpsLeft = PLAYER.MAX_JUMPS;

        this.scene.time.delayedCall(PLAYER.INVINCIBLE_TIME, () => {
            this.setAlpha(1);
            this.invincible = false;
        });
    }

    bounce() {
        this.setVelocityY(PLAYER.BOUNCE);
        // Restore double jump after bouncing on enemy
        this.jumpsLeft = PLAYER.MAX_JUMPS - 1;
    }

    // NES-style flag sequence: grab pole -> slide down -> hop off -> walk to castle
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
