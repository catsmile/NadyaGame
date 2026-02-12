class Invader extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'invader_0');
        this.alive = true;
        this.activated = false;
        this.startDir = Math.random() < 0.5 ? -1 : 1;
        this.bombTimer = null;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setAllowGravity(false);
        this.setSize(14, 12);
        this.setOffset(1, 2);
        this.setDepth(5);

        this.play('invader_fly');
    }

    update() {
        if (!this.alive || !this.body) return;

        // Activate when entering camera view
        if (!this.activated) {
            const cam = this.scene.cameras.main;
            const viewRight = cam.worldView.x + cam.worldView.width;
            if (this.x < viewRight + TILE * 2) {
                this.activated = true;
                this.setVelocityX(this.startDir * INVADER.SPEED);
                this.startBombing();
            }
            return;
        }

        // Reverse at screen edges (stay within a range around spawn)
        if (this.body.blocked.left || this.x < this.scene.cameras.main.worldView.x - TILE) {
            this.setVelocityX(INVADER.SPEED);
        } else if (this.body.blocked.right || this.x > this.scene.cameras.main.worldView.x + VIEW_WIDTH + TILE) {
            this.setVelocityX(-INVADER.SPEED);
        }

        // Destroy if fell way off screen
        if (this.y > LEVEL_ROWS * TILE + 32) {
            this.die();
        }
    }

    startBombing() {
        const delay = Phaser.Math.Between(INVADER.BOMB_DELAY_MIN, INVADER.BOMB_DELAY_MAX);
        this.bombTimer = this.scene.time.addEvent({
            delay: delay,
            callback: () => {
                this.dropBomb();
                // Schedule next bomb with new random delay
                if (this.alive && this.active) {
                    this.startBombing();
                }
            },
            callbackScope: this
        });
    }

    dropBomb() {
        if (!this.alive || !this.active) return;
        if (this.scene && this.scene.spawnInvaderBomb) {
            this.scene.spawnInvaderBomb(this.x, this.y + 8);
        }
    }

    die() {
        if (!this.alive) return;
        this.alive = false;

        if (this.bombTimer) {
            this.bombTimer.remove(false);
            this.bombTimer = null;
        }

        // Explosion effect: 4 green particles
        for (let i = 0; i < 4; i++) {
            const px = this.x + (i % 2 === 0 ? -4 : 4);
            const py = this.y + (i < 2 ? -4 : 4);
            const piece = this.scene.add.rectangle(px, py, 4, 4, 0x00e800).setDepth(15);
            this.scene.tweens.add({
                targets: piece,
                x: piece.x + (i % 2 === 0 ? -16 : 16),
                y: piece.y + (i < 2 ? -20 : 10),
                alpha: 0,
                duration: 400,
                onComplete: () => piece.destroy()
            });
        }

        this.destroy();
    }
}
