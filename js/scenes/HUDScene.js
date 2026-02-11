class HUDScene extends Phaser.Scene {
    constructor() {
        super('HUDScene');
    }

    init(data) {
        this.gameScene = data.gameScene;
    }

    create() {
        const style = {
            fontSize: '24px',
            fontFamily: 'monospace',
            color: '#fcfcfc',
            fontStyle: 'bold'
        };

        const smallStyle = {
            fontSize: '20px',
            fontFamily: 'monospace',
            color: '#fcfcfc'
        };

        // Score
        this.add.text(20, 16, 'SCORE', style);
        this.scoreText = this.add.text(20, 44, '000000', smallStyle);

        // Coins
        this.add.text(260, 16, 'COINS', style);
        this.coinText = this.add.text(260, 44, 'x00', smallStyle);

        // World
        this.add.text(480, 16, 'WORLD', style);
        this.add.text(480, 44, '1-1', smallStyle);

        // Timer
        this.add.text(640, 16, 'TIME', style);
        this.timerText = this.add.text(640, 44, '300', smallStyle);
    }

    update() {
        if (!this.gameScene) return;

        this.scoreText.setText(String(this.gameScene.score).padStart(6, '0'));
        this.coinText.setText('x' + String(this.gameScene.coinCount).padStart(2, '0'));
        this.timerText.setText(String(this.gameScene.gameTimer).padStart(3, '0'));
    }
}
