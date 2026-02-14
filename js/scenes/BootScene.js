class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    create() {
        const generator = new SpriteGenerator(this);
        generator.generateAll();

        // Wait for pixel font to load before showing menu
        document.fonts.load('12px "Press Start 2P"').then(() => {
            this.scene.start('MenuScene');
        }).catch(() => {
            // Start anyway if font fails to load
            this.scene.start('MenuScene');
        });
    }
}
