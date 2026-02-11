class Flag {
    constructor(scene, col) {
        this.scene = scene;
        this.col = col;
        this.poleX = col * TILE + TILE / 2;
        this.parts = scene.physics.add.staticGroup();

        // Pole top row
        this.topY = 2 * TILE + TILE / 2;
        // Pole bottom row (row 11, above ground at row 12)
        this.bottomY = 11 * TILE + TILE / 2;

        // Pole top (ball)
        this.parts.create(this.poleX, this.topY, 'flag_top');

        // Pole segments (rows 3-11)
        for (let r = 3; r < 12; r++) {
            this.parts.create(this.poleX, r * TILE + TILE / 2, 'flag_pole');
        }

        // Flag banner — starts near the top
        this.banner = scene.add.image(this.poleX - 8, 3 * TILE, 'flag_banner').setDepth(5);

        // Gentle wave animation
        this.bannerWave = scene.tweens.add({
            targets: this.banner,
            x: this.banner.x - 2,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
    }

    // Slide the banner down to the bottom of the pole
    slideBannerDown(duration) {
        if (this.bannerWave) {
            this.bannerWave.stop();
        }
        this.banner.x = this.poleX - 8;

        this.scene.tweens.add({
            targets: this.banner,
            y: this.bottomY,
            duration: duration,
            ease: 'Linear'
        });
    }
}
