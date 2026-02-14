class Boss extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'boss_0');
        this.alive = true;
        this.activated = false;
        this.health = BOSS.HEALTH;
        this.startDir = Math.random() < 0.5 ? -1 : 1;
        this.isHurt = false;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setSize(44, 44);
        this.setOffset(2, 4);
        this.setDepth(10);
        this.body.setAllowGravity(true);

        this.play('boss_walk');
    }

    update() {
        if (!this.alive || !this.body) return;

        // Activate when entering camera view
        if (!this.activated) {
            const cam = this.scene.cameras.main;
            const viewRight = cam.worldView.x + cam.worldView.width;
            if (this.x < viewRight + TILE * 3) {
                this.activated = true;
                this.setVelocityX(this.startDir * BOSS.SPEED);
            }
            return;
        }

        // Reverse direction on wall hit
        if (this.body.blocked.left) {
            this.setVelocityX(BOSS.SPEED);
        } else if (this.body.blocked.right) {
            this.setVelocityX(-BOSS.SPEED);
        }

        // Flip sprite based on direction
        this.setFlipX(this.body.velocity.x > 0);

        // Fall off screen
        if (this.y > LEVEL_ROWS * TILE + 48) {
            this.alive = false;
            this.destroy();
        }
    }

    takeHit() {
        if (!this.alive || this.isHurt) return;

        this.health--;
        this.isHurt = true;

        // Flash hurt frame
        this.setTexture('boss_2');

        // Brief invulnerability
        this.scene.tweens.add({
            targets: this,
            alpha: 0.3,
            duration: 100,
            yoyo: true,
            repeat: 4,
            onComplete: () => {
                if (!this.active) return;
                this.setAlpha(1);
                this.isHurt = false;
                if (this.alive) {
                    this.play('boss_walk');
                }
            }
        });

        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        if (!this.alive) return;
        this.alive = false;

        // Screen shake
        this.scene.cameras.main.shake(500, 0.03);

        // Big 8-piece explosion
        const colors = [0xff3300, 0xff6600, 0xffaa00, 0xff0000, 0x8b1a1a, 0xf0a020, 0xff4444, 0xffcc00];
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const px = this.x + Math.cos(angle) * 4;
            const py = this.y + Math.sin(angle) * 4;
            const piece = this.scene.add.rectangle(px, py, 6, 6, colors[i]).setDepth(15);
            this.scene.tweens.add({
                targets: piece,
                x: px + Math.cos(angle) * 40,
                y: py + Math.sin(angle) * 40 - 10,
                alpha: 0,
                angle: Phaser.Math.Between(-360, 360),
                duration: 700,
                onComplete: () => piece.destroy()
            });
        }

        // Score
        this.scene.addScore(SCORE.BOSS);
        this.scene.showScorePopup(this.x, this.y, SCORE.BOSS);

        this.destroy();
    }
}
