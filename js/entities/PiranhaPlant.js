class PiranhaPlant extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, pipeCol, pipeTopRow) {
        // Center x on the pipe (pipe is 2 tiles wide)
        const x = pipeCol * TILE + TILE;
        // Hidden position: just inside the pipe top
        const hiddenY = pipeTopRow * TILE + TILE / 2;
        // Risen position: one full tile above pipe opening
        const risenY = (pipeTopRow - 1) * TILE + TILE / 2;

        super(scene, x, hiddenY, 'piranha_0');

        this.hiddenY = hiddenY;
        this.risenY = risenY;
        this.pipeX = x;

        // States: 'hidden', 'rising', 'showing', 'sinking'
        this.state = 'hidden';
        this.stateTimer = Phaser.Math.Between(0, PIRANHA.HIDE_TIME);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setAllowGravity(false);
        this.setImmovable(true);
        this.setSize(12, 14);
        this.setDepth(4); // Behind pipe lip but above background

        this.play('piranha_chomp');
    }

    update(players) {
        // Check if any player is too close horizontally — if so, stay hidden
        if (this.state === 'hidden') {
            for (const p of players) {
                if (p.alive && Math.abs(p.x - this.pipeX) < PIRANHA.SAFE_DISTANCE) {
                    this.stateTimer = 0;
                    return;
                }
            }
        }

        this.stateTimer += this.scene.game.loop.delta;

        switch (this.state) {
            case 'hidden':
                this.y = this.hiddenY;
                if (this.stateTimer >= PIRANHA.HIDE_TIME) {
                    this.state = 'rising';
                    this.stateTimer = 0;
                }
                break;

            case 'rising': {
                const progress = Math.min(this.stateTimer / PIRANHA.RISE_TIME, 1);
                this.y = Phaser.Math.Linear(this.hiddenY, this.risenY, progress);
                if (progress >= 1) {
                    this.state = 'showing';
                    this.stateTimer = 0;
                }
                break;
            }

            case 'showing':
                this.y = this.risenY;
                if (this.stateTimer >= PIRANHA.SHOW_TIME) {
                    this.state = 'sinking';
                    this.stateTimer = 0;
                }
                break;

            case 'sinking': {
                const progress = Math.min(this.stateTimer / PIRANHA.RISE_TIME, 1);
                this.y = Phaser.Math.Linear(this.risenY, this.hiddenY, progress);
                if (progress >= 1) {
                    this.state = 'hidden';
                    this.stateTimer = 0;
                }
                break;
            }
        }

        this.body.reset(this.x, this.y);
    }
}
