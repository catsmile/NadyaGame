class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    create() {
        const generator = new SpriteGenerator(this);
        generator.generateAll();
        this.scene.start('MenuScene');
    }
}
