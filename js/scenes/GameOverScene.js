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
            this.add.text(cx, cy - 120, 'LEVEL\nCOMPLETE!', {
                fontSize: '28px',
                fontFamily: FONT, padding: FONT_PAD,
                color: '#50d848',
                align: 'center',
                lineSpacing: 8
            }).setOrigin(0.5);

            this.add.text(cx, cy - 30, 'CONGRATULATIONS!', {
                fontSize: '14px',
                fontFamily: FONT, padding: FONT_PAD,
                color: '#f8b800'
            }).setOrigin(0.5);
        } else {
            this.add.text(cx, cy - 100, 'GAME OVER', {
                fontSize: '30px',
                fontFamily: FONT, padding: FONT_PAD,
                color: '#f83800'
            }).setOrigin(0.5);
        }

        this.add.text(cx, cy + 30, 'SCORE ' + String(this.finalScore).padStart(6, '0'), {
            fontSize: '14px',
            fontFamily: FONT, padding: FONT_PAD,
            color: '#fcfcfc'
        }).setOrigin(0.5);

        this.add.text(cx, cy + 65, 'COINS ' + this.finalCoins, {
            fontSize: '14px',
            fontFamily: FONT, padding: FONT_PAD,
            color: '#f8b800'
        }).setOrigin(0.5);

        const restartText = this.add.text(cx, cy + 140, 'PRESS ENTER TO RESTART', {
            fontSize: '10px',
            fontFamily: FONT, padding: FONT_PAD,
            color: '#fcfcfc'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: restartText,
            alpha: 0,
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        this.add.text(cx, cy + 175, 'ESC FOR MENU', {
            fontSize: '8px',
            fontFamily: FONT, padding: FONT_PAD,
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
