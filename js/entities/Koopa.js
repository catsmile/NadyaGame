class Koopa extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'koopa_0');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setSize(14, 14);
        this.setOffset(1, 2);
        this.setDepth(5);
        this.setVelocityX(-ENEMY.KOOPA_SPEED);

        this.play('koopa_walk');
    }

    update() {
        // Reverse direction on wall hit
        if (this.body && this.body.blocked) {
            if (this.body.blocked.left) {
                this.setVelocityX(ENEMY.KOOPA_SPEED);
                this.setFlipX(true);
            } else if (this.body.blocked.right) {
                this.setVelocityX(-ENEMY.KOOPA_SPEED);
                this.setFlipX(false);
            }
        }

        if (this.y > LEVEL_ROWS * TILE + 32) {
            this.destroy();
        }
    }
}
