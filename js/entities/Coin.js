class Coin extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'coin_0');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setAllowGravity(false);
        this.setSize(10, 14);
        this.setImmovable(true);
        this.setDepth(5);

        this.play('coin_spin');
    }

    collect() {
        this.disableBody(true, true);

        // Pop-up effect
        const pop = this.scene.add.image(this.x, this.y, 'coin_0').setDepth(15);
        this.scene.tweens.add({
            targets: pop,
            y: pop.y - 24,
            alpha: 0,
            duration: 300,
            onComplete: () => pop.destroy()
        });
    }
}
