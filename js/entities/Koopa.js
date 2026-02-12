class Koopa extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'koopa_0');
        this.activated = false;
        this.startDir = Math.random() < 0.5 ? -1 : 1;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setSize(14, 14);
        this.setOffset(1, 2);
        this.setDepth(5);
        this.setFlipX(this.startDir > 0);

        this.play('koopa_walk');
    }

    update() {
        if (!this.body || !this.body.blocked) return;

        // Activate when entering camera view
        if (!this.activated) {
            const cam = this.scene.cameras.main;
            const viewLeft = cam.worldView.x;
            const viewRight = viewLeft + cam.worldView.width;
            if (this.x > viewLeft - TILE && this.x < viewRight + TILE) {
                this.activated = true;
                this.setVelocityX(this.startDir * ENEMY.KOOPA_SPEED);
            } else {
                this.setVelocityX(0);
            }
            return;
        }

        // Reverse direction on wall hit
        if (this.body.blocked.left) {
            this.setVelocityX(ENEMY.KOOPA_SPEED);
            this.setFlipX(true);
        } else if (this.body.blocked.right) {
            this.setVelocityX(-ENEMY.KOOPA_SPEED);
            this.setFlipX(false);
        }

        if (this.y > LEVEL_ROWS * TILE + 32) {
            this.destroy();
        }
    }
}
