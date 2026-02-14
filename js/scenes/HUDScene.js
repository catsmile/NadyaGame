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

        // Hunger bars
        const hungerY = 58;
        this.add.text(20, hungerY, 'P1 FOOD', { fontSize: '10px', fontFamily: FONT, padding: FONT_PAD, color: '#00ff00' });
        this.p1HungerBg = this.add.rectangle(130, hungerY + 7, 102, 10, 0x333333).setOrigin(0, 0.5);
        this.p1HungerBar = this.add.rectangle(131, hungerY + 7, 100, 8, 0x00cc00).setOrigin(0, 0.5);

        if (this.gameScene.playerCount >= 2) {
            this.add.text(400, hungerY, 'P2 FOOD', { fontSize: '10px', fontFamily: FONT, padding: FONT_PAD, color: '#00ff00' });
            this.p2HungerBg = this.add.rectangle(510, hungerY + 7, 102, 10, 0x333333).setOrigin(0, 0.5);
            this.p2HungerBar = this.add.rectangle(511, hungerY + 7, 100, 8, 0x00cc00).setOrigin(0, 0.5);
        }
    }

    update() {
        if (!this.gameScene) return;

        this.scoreText.setText(String(this.gameScene.score).padStart(6, '0'));
        this.coinText.setText('x' + String(this.gameScene.coinCount).padStart(2, '0'));
        this.timerText.setText(String(this.gameScene.gameTimer).padStart(3, '0'));

        // Hunger bars
        const p1h = this.gameScene.player1.hunger;
        const p1pct = p1h / HUNGER.MAX;
        this.p1HungerBar.width = Math.max(0, p1pct * 100);
        this.p1HungerBar.fillColor = p1pct > 0.3 ? 0x00cc00 : 0xff3300;

        if (this.gameScene.playerCount >= 2 && this.p2HungerBar) {
            const p2h = this.gameScene.player2.hunger;
            const p2pct = p2h / HUNGER.MAX;
            this.p2HungerBar.width = Math.max(0, p2pct * 100);
            this.p2HungerBar.fillColor = p2pct > 0.3 ? 0x00cc00 : 0xff3300;
        }
    }
}
