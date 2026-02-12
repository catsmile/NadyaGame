class HUDScene extends Phaser.Scene {
    constructor() {
        super('HUDScene');
    }

    init(data) {
        this.gameScene = data.gameScene;
    }

    create() {
        const style = {
            fontSize: '14px',
            fontFamily: FONT, padding: FONT_PAD,
            color: '#fcfcfc'
        };

        const smallStyle = {
            fontSize: '12px',
            fontFamily: FONT, padding: FONT_PAD,
            color: '#fcfcfc'
        };

        // Score
        this.add.text(20, 16, 'SCORE', style);
        this.scoreText = this.add.text(20, 38, '000000', smallStyle);

        // Coins
        this.add.text(250, 16, 'COINS', style);
        this.coinText = this.add.text(250, 38, 'x00', smallStyle);

        // World
        this.add.text(460, 16, 'WORLD', style);
        this.add.text(460, 38, '1-1', smallStyle);

        // Timer
        this.add.text(630, 16, 'TIME', style);
        this.timerText = this.add.text(630, 38, '300', smallStyle);
    }

    update() {
        if (!this.gameScene) return;

        this.scoreText.setText(String(this.gameScene.score).padStart(6, '0'));
        this.coinText.setText('x' + String(this.gameScene.coinCount).padStart(2, '0'));
        this.timerText.setText(String(this.gameScene.gameTimer).padStart(3, '0'));
    }
}
