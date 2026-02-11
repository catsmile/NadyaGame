class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    init(data) {
        this.win = data.win || false;
        this.finalScore = data.score || 0;
        this.finalCoins = data.coins || 0;
    }

    create() {
        const cx = GAME_WIDTH / 2;
        const cy = GAME_HEIGHT / 2;

        if (this.win) {
            this.add.text(cx, cy - 120, 'LEVEL COMPLETE!', {
                fontSize: '42px',
                fontFamily: 'monospace',
                color: '#50d848',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            this.add.text(cx, cy - 40, 'CONGRATULATIONS!', {
                fontSize: '28px',
                fontFamily: 'monospace',
                color: '#f8b800'
            }).setOrigin(0.5);
        } else {
            this.add.text(cx, cy - 120, 'GAME OVER', {
                fontSize: '48px',
                fontFamily: 'monospace',
                color: '#f83800',
                fontStyle: 'bold'
            }).setOrigin(0.5);
        }

        this.add.text(cx, cy + 20, 'SCORE: ' + String(this.finalScore).padStart(6, '0'), {
            fontSize: '24px',
            fontFamily: 'monospace',
            color: '#fcfcfc'
        }).setOrigin(0.5);

        this.add.text(cx, cy + 60, 'COINS: ' + this.finalCoins, {
            fontSize: '24px',
            fontFamily: 'monospace',
            color: '#f8b800'
        }).setOrigin(0.5);

        const restartText = this.add.text(cx, cy + 140, 'PRESS ENTER TO RESTART', {
            fontSize: '20px',
            fontFamily: 'monospace',
            color: '#fcfcfc'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: restartText,
            alpha: 0,
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        const backText = this.add.text(cx, cy + 180, 'PRESS ESC FOR MENU', {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#acecfc'
        }).setOrigin(0.5);

        this.input.keyboard.on('keydown-ENTER', () => {
            this.scene.start('GameScene');
        });

        this.input.keyboard.on('keydown-SPACE', () => {
            this.scene.start('GameScene');
        });

        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.start('MenuScene');
        });
    }
}
