class PlayerBullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player_bullet');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setAllowGravity(false);
        this.setSize(4, 8);
        this.setDepth(10);
        this.setVelocityY(-PLAYER.BULLET_SPEED);
    }

    update() {
        // Destroy when off top of screen
        if (this.y < -16) {
            this.destroy();
        }
    }
}
