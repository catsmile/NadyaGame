class Goomba extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'goomba_0');
        this.alive = true;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setSize(14, 14);
        this.setOffset(1, 2);
        this.setDepth(5);
        this.setVelocityX((Math.random() < 0.5 ? -1 : 1) * ENEMY.GOOMBA_SPEED);

        this.play('goomba_walk');
    }

    update() {
        if (!this.alive) return;

        // Reverse direction on wall hit
        if (this.body.blocked.left) {
            this.setVelocityX(ENEMY.GOOMBA_SPEED);
        } else if (this.body.blocked.right) {
            this.setVelocityX(-ENEMY.GOOMBA_SPEED);
        }

        // Fall off screen
        if (this.y > LEVEL_ROWS * TILE + 32) {
            this.destroy();
        }
    }

    stomped() {
        this.alive = false;
        this.setTexture('goomba_2');
        this.setVelocity(0, 0);
        this.body.setAllowGravity(false);
        this.body.checkCollision.none = true;
        this.setSize(16, 8);
        this.setOffset(0, 8);

        this.scene.time.delayedCall(500, () => {
            this.destroy();
        });
    }
}
