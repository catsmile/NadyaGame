class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        const cx = GAME_WIDTH / 2;
        const cy = GAME_HEIGHT / 2;

        // Title
        this.add.text(cx, cy - 200, 'NADYA & MARK', {
            fontSize: '48px',
            fontFamily: 'monospace',
            color: '#f83800',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(cx, cy - 140, 'SUPER ADVENTURE', {
            fontSize: '36px',
            fontFamily: 'monospace',
            color: '#f8b800',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Characters preview
        this.add.image(cx - 60, cy - 40, 'nadya_0').setScale(5);
        this.add.image(cx + 60, cy - 40, 'mark_0').setScale(5);

        this.add.text(cx - 60, cy + 20, 'NADYA', {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#f83800'
        }).setOrigin(0.5);

        this.add.text(cx + 60, cy + 20, 'MARK', {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#3858a8'
        }).setOrigin(0.5);

        // Controls info
        const controlsY = cy + 80;
        this.add.text(cx, controlsY, 'CONTROLS', {
            fontSize: '20px',
            fontFamily: 'monospace',
            color: '#fcfcfc',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(cx - 140, controlsY + 35, 'NADYA (P1):\nMove: WASD\nJump: SPACE', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#fcbcb0',
            lineSpacing: 4
        });

        this.add.text(cx + 20, controlsY + 35, 'MARK (P2):\nMove: Arrows\nJump: Numpad0 / Enter', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#fcbcb0',
            lineSpacing: 4
        });

        // Start prompt
        const startText = this.add.text(cx, cy + 220, 'PRESS ENTER TO START', {
            fontSize: '20px',
            fontFamily: 'monospace',
            color: '#fcfcfc'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: startText,
            alpha: 0,
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        this.input.keyboard.on('keydown-ENTER', () => {
            this.scene.start('GameScene');
        });

        this.input.keyboard.on('keydown-SPACE', () => {
            this.scene.start('GameScene');
        });
    }
}
