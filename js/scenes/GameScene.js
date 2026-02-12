class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        this.score = 0;
        this.coinCount = 0;
        this.gameTimer = TIMER_START;
        this.gameOver = false;
        this.levelComplete = false;
        this.flagBannerDropped = false;

        // Build tilemap
        this.createLevel();

        // Decorations (behind everything)
        this.createDecorations();

        // Create players
        this.player1 = new Player(this, 3 * TILE, 10 * TILE, 'nadya');
        this.player2 = new Player(this, 4 * TILE, 10 * TILE, 'mark');

        // Input
        this.inputManager = new InputManager(this);

        // Camera
        const mapWidth = LEVEL_COLS * TILE;
        this.cameraManager = new CameraManager(this, this.player1, this.player2, mapWidth);

        // Mushroom group
        this.mushrooms = this.physics.add.group();

        // Create entities
        this.createCoins();
        this.createEnemies();
        this.createPiranhaPlants();
        this.createFlag();

        // Castle
        this.add.image(204 * TILE, 9 * TILE, 'castle').setOrigin(0.5, 1).setDepth(1);

        // Collisions
        this.setupCollisions();

        // Timer event
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: this.tickTimer,
            callbackScope: this,
            loop: true
        });

        // Launch HUD
        this.scene.launch('HUDScene', {
            gameScene: this
        });

        // World bounds for falling
        this.physics.world.setBounds(0, 0, mapWidth, LEVEL_ROWS * TILE + 48);
    }

    createLevel() {
        const levelData = LevelData.getLevel1();

        // Map tile indices to texture keys
        this.tileTextures = {
            [TILES.GROUND]: 'ground',
            [TILES.GROUND_TOP]: 'ground_top',
            [TILES.BRICK]: 'brick',
            [TILES.QUESTION]: 'question_0',
            [TILES.QUESTION_USED]: 'question_used',
            [TILES.PIPE_TL]: 'pipe_tl',
            [TILES.PIPE_TR]: 'pipe_tr',
            [TILES.PIPE_BL]: 'pipe_bl',
            [TILES.PIPE_BR]: 'pipe_br'
        };

        // Use static physics group for performance
        this.groundLayer = this.physics.add.staticGroup();
        this.brickLayer = this.physics.add.staticGroup();
        this.questionLayer = this.physics.add.staticGroup();
        this.pipeLayer = this.physics.add.staticGroup();

        this.levelData = levelData;

        for (let r = 0; r < LEVEL_ROWS; r++) {
            for (let c = 0; c < LEVEL_COLS; c++) {
                const tile = levelData[r][c];
                if (tile === TILES.EMPTY) continue;

                const x = c * TILE + TILE / 2;
                const y = r * TILE + TILE / 2;

                if (tile === TILES.GROUND || tile === TILES.GROUND_TOP) {
                    const tex = tile === TILES.GROUND_TOP ? 'ground_top' : 'ground';
                    this.groundLayer.create(x, y, tex);
                } else if (tile === TILES.BRICK) {
                    const brick = this.brickLayer.create(x, y, 'brick');
                    brick.tileCol = c;
                    brick.tileRow = r;
                } else if (tile === TILES.QUESTION) {
                    const qblock = this.questionLayer.create(x, y, 'question_0');
                    qblock.tileCol = c;
                    qblock.tileRow = r;
                    qblock.used = false;
                    // Animate ? block
                    this.tweens.add({
                        targets: qblock,
                        scaleX: { from: 1, to: 1 },
                        duration: 400,
                        repeat: -1
                    });
                } else if (tile >= TILES.PIPE_TL && tile <= TILES.PIPE_BR) {
                    const tex = this.tileTextures[tile];
                    this.pipeLayer.create(x, y, tex);
                }
            }
        }

        // Animate ? blocks with texture swap
        this.qAnimTimer = 0;
        this.qAnimFrame = 0;
    }

    createCoins() {
        this.coins = this.physics.add.group({
            allowGravity: false
        });

        const coinData = LevelData.getCoins();
        coinData.forEach(cd => {
            const coin = new Coin(this, cd.col * TILE + TILE / 2, cd.row * TILE + TILE / 2);
            this.coins.add(coin);
        });
    }

    createEnemies() {
        this.goombas = this.physics.add.group();
        this.koopas = this.physics.add.group();
        this.shells = this.physics.add.group();

        const enemyData = LevelData.getEnemies();
        enemyData.forEach(ed => {
            const x = ed.col * TILE + TILE / 2;
            const y = ed.row * TILE + TILE / 2;
            if (ed.type === 'goomba') {
                const goomba = new Goomba(this, x, y);
                this.goombas.add(goomba);
            } else if (ed.type === 'koopa') {
                const koopa = new Koopa(this, x, y);
                this.koopas.add(koopa);
            }
        });
    }

    createPiranhaPlants() {
        this.piranhaPlants = [];
        const plantData = LevelData.getPiranhaPlants();
        plantData.forEach(pd => {
            const plant = new PiranhaPlant(this, pd.col, pd.topRow);
            this.piranhaPlants.push(plant);
        });
    }

    createFlag() {
        this.flag = new Flag(this, 200);
    }

    createDecorations() {
        const decoData = LevelData.getDecorations();
        decoData.forEach(d => {
            const x = d.col * TILE;
            const y = d.row * TILE;
            const img = this.add.image(x, y, d.type).setOrigin(0, 1).setDepth(0);

            // Parallax for clouds
            if (d.type === 'cloud') {
                img.setScrollFactor(0.5);
            }
        });
    }

    setupCollisions() {
        const players = [this.player1, this.player2];

        players.forEach(player => {
            // Ground collisions
            this.physics.add.collider(player, this.groundLayer);
            this.physics.add.collider(player, this.pipeLayer);

            // Brick collision with hit detection
            this.physics.add.collider(player, this.brickLayer, (p, brick) => {
                this.hitBrick(p, brick);
            });

            // ? block collision with hit detection
            this.physics.add.collider(player, this.questionLayer, (p, qblock) => {
                this.hitQuestionBlock(p, qblock);
            });

            // Coin collection
            this.physics.add.overlap(player, this.coins, (p, coin) => {
                this.collectCoin(coin);
            });

            // Goomba collision
            this.physics.add.collider(player, this.goombas, (p, goomba) => {
                this.playerEnemyCollision(p, goomba);
            });

            // Koopa collision
            this.physics.add.collider(player, this.koopas, (p, koopa) => {
                this.playerKoopaCollision(p, koopa);
            });

            // Shell collision
            this.physics.add.collider(player, this.shells, (p, shell) => {
                this.playerShellCollision(p, shell);
            });

            // Piranha Plant collision
            this.piranhaPlants.forEach(plant => {
                this.physics.add.overlap(player, plant, (p, pl) => {
                    this.playerPiranhaCollision(p, pl);
                });
            });

            // Flag overlap
            this.physics.add.overlap(player, this.flag.parts, (p) => {
                this.reachFlag(p);
            });
        });

        // Enemy collisions with ground
        this.physics.add.collider(this.goombas, this.groundLayer);
        this.physics.add.collider(this.goombas, this.brickLayer);
        this.physics.add.collider(this.goombas, this.pipeLayer);
        this.physics.add.collider(this.goombas, this.questionLayer);

        this.physics.add.collider(this.koopas, this.groundLayer);
        this.physics.add.collider(this.koopas, this.brickLayer);
        this.physics.add.collider(this.koopas, this.pipeLayer);
        this.physics.add.collider(this.koopas, this.questionLayer);

        this.physics.add.collider(this.shells, this.groundLayer);
        this.physics.add.collider(this.shells, this.brickLayer);
        this.physics.add.collider(this.shells, this.pipeLayer);
        this.physics.add.collider(this.shells, this.questionLayer);

        // Shell kills enemies
        this.physics.add.collider(this.shells, this.goombas, (shell, goomba) => {
            if (Math.abs(shell.body.velocity.x) > 10) {
                goomba.stomped();
                this.addScore(SCORE.GOOMBA);
            }
        });

        this.physics.add.collider(this.shells, this.koopas, (shell, koopa) => {
            if (Math.abs(shell.body.velocity.x) > 10) {
                koopa.destroy();
                this.addScore(SCORE.KOOPA);
            }
        });
    }

    hitBrick(player, brick) {
        // Hit from below: player's center is below brick's center and head is touching
        if (player.body.blocked.up && player.y > brick.y) {
            this.brickBreakEffect(brick.x, brick.y);
            brick.destroy();
        }
    }

    hitQuestionBlock(player, qblock) {
        if (qblock.used) return;
        if (player.body.blocked.up && player.y > qblock.y) {
            qblock.used = true;
            qblock.setTexture('question_used');

            // Bounce animation
            this.tweens.add({
                targets: qblock,
                y: qblock.y - 4,
                duration: 80,
                yoyo: true,
                onComplete: () => {
                    qblock.refreshBody();
                }
            });

            // Random chance to spawn mushroom instead of coin
            if (Math.random() < MUSHROOM_CHANCE) {
                this.spawnMushroom(qblock.x, qblock.y - TILE);
            } else {
                this.spawnBlockCoin(qblock.x, qblock.y - TILE);
            }
        }
    }

    spawnBlockCoin(x, y) {
        const coin = this.add.image(x, y, 'coin_0').setDepth(15);
        this.tweens.add({
            targets: coin,
            y: y - 32,
            alpha: 0,
            duration: 400,
            onComplete: () => {
                coin.destroy();
            }
        });
        this.addScore(SCORE.COIN);
        this.coinCount++;
    }

    spawnMushroom(x, y) {
        const isRed = Math.random() < 0.5;
        const key = isRed ? 'mushroom_red' : 'mushroom_blue';
        const mush = this.physics.add.image(x, y, key);
        mush.setDepth(5);
        mush.setSize(14, 14);
        mush.mushroomType = isRed ? 'fire' : 'lowgrav';
        mush.body.setAllowGravity(true);
        mush.setVelocityX(Phaser.Math.Between(0, 1) ? 40 : -40);
        mush.setBounce(0.2);
        this.mushrooms.add(mush);

        // Collide with terrain
        this.physics.add.collider(mush, this.groundLayer);
        this.physics.add.collider(mush, this.brickLayer);
        this.physics.add.collider(mush, this.pipeLayer);
        this.physics.add.collider(mush, this.questionLayer);

        // Pop-up effect
        this.tweens.add({
            targets: mush,
            y: y - 12,
            duration: 200,
            ease: 'Back.easeOut'
        });

        // Overlap with players
        [this.player1, this.player2].forEach(player => {
            this.physics.add.overlap(player, mush, (p, m) => {
                this.collectMushroom(p, m);
            });
        });
    }

    collectMushroom(player, mush) {
        if (!mush.active || !player.alive) return;
        mush.destroy();
        this.addScore(SCORE.MUSHROOM);

        if (mush.mushroomType === 'fire') {
            player.applyFire();
        } else {
            player.applyLowGrav();
        }

        // Score popup
        const popup = this.add.text(player.x, player.y - 12, String(SCORE.MUSHROOM), {
            fontSize: '8px',
            fontFamily: 'monospace',
            color: '#fcfcfc'
        }).setOrigin(0.5).setDepth(20);
        this.tweens.add({
            targets: popup,
            y: popup.y - 20,
            alpha: 0,
            duration: 600,
            onComplete: () => popup.destroy()
        });
    }

    brickBreakEffect(x, y) {
        for (let i = 0; i < 4; i++) {
            const piece = this.add.rectangle(
                x + (i % 2 === 0 ? -4 : 4),
                y + (i < 2 ? -4 : 4),
                4, 4, COLORS.BRICK
            ).setDepth(15);

            this.tweens.add({
                targets: piece,
                x: piece.x + (i % 2 === 0 ? -20 : 20),
                y: piece.y + (i < 2 ? -30 : 10),
                angle: Phaser.Math.Between(-360, 360),
                alpha: 0,
                duration: 500,
                onComplete: () => piece.destroy()
            });
        }
    }

    collectCoin(coin) {
        if (!coin.active) return;
        coin.collect();
        this.addScore(SCORE.COIN);
        this.coinCount++;
    }

    playerEnemyCollision(player, goomba) {
        if (!player.alive || player.invincible) return;
        if (!goomba.alive) return;

        // Fire power-up: kill on any touch
        if (player.hasFire) {
            goomba.stomped();
            this.addScore(SCORE.GOOMBA);
            return;
        }

        // Stomp check
        if (player.body.velocity.y > 0 && player.body.bottom <= goomba.body.top + 8) {
            goomba.stomped();
            player.bounce();
            this.addScore(SCORE.GOOMBA);
        } else {
            player.die();
            this.checkGameOver();
        }
    }

    playerKoopaCollision(player, koopa) {
        if (!player.alive || player.invincible) return;
        if (!koopa.active) return;

        // Fire power-up: kill on any touch
        if (player.hasFire) {
            this.addScore(SCORE.KOOPA);
            koopa.destroy();
            return;
        }

        if (player.body.velocity.y > 0 && player.body.bottom <= koopa.body.top + 8) {
            player.bounce();
            this.addScore(SCORE.KOOPA);
            // Convert to shell
            const shell = this.createShell(koopa.x, koopa.y);
            koopa.destroy();
        } else {
            player.die();
            this.checkGameOver();
        }
    }

    createShell(x, y) {
        const shell = this.physics.add.image(x, y, 'koopa_2');
        shell.setSize(14, 12);
        shell.body.setAllowGravity(true);
        shell.moving = false;
        this.shells.add(shell);

        // Re-add colliders for the new shell
        this.physics.add.collider(shell, this.groundLayer);
        this.physics.add.collider(shell, this.brickLayer);
        this.physics.add.collider(shell, this.pipeLayer);

        return shell;
    }

    playerShellCollision(player, shell) {
        if (!player.alive || player.invincible) return;

        if (!shell.moving || player.hasFire) {
            // Kick the shell (or fire player always kicks)
            const dir = player.x < shell.x ? 1 : -1;
            shell.setVelocityX(dir * ENEMY.SHELL_SPEED);
            shell.moving = true;
        } else {
            // Moving shell hurts
            if (player.body.velocity.y > 0 && player.body.bottom <= shell.body.top + 8) {
                shell.setVelocityX(0);
                shell.moving = false;
                player.bounce();
            } else {
                player.die();
                this.checkGameOver();
            }
        }
    }

    playerPiranhaCollision(player, plant) {
        if (!player.alive || player.invincible) return;
        if (plant.state === 'hidden') return;

        // Fire power-up kills piranha
        if (player.hasFire) {
            plant.destroy();
            this.addScore(SCORE.GOOMBA);
            return;
        }

        player.die();
        this.checkGameOver();
    }

    reachFlag(player) {
        if (player.finished || !player.alive) return;

        // Score based on grab height (higher = more points)
        const grabY = player.y;
        const topY = this.flag.topY;
        const bottomY = this.flag.bottomY;
        const ratio = 1 - Phaser.Math.Clamp((grabY - topY) / (bottomY - topY), 0, 1);
        // 100 at bottom, 5000 at top
        const flagScore = Math.round(100 + ratio * 4900);
        this.addScore(flagScore);

        // Show score popup
        const popup = this.add.text(player.x, player.y - 8, String(flagScore), {
            fontSize: '8px',
            fontFamily: 'monospace',
            color: '#fcfcfc'
        }).setOrigin(0.5).setDepth(20);
        this.tweens.add({
            targets: popup,
            y: popup.y - 24,
            alpha: 0,
            duration: 800,
            onComplete: () => popup.destroy()
        });

        // Slide banner down (only once, on first player contact)
        if (!this.flagBannerDropped) {
            this.flagBannerDropped = true;
            const slideTime = (bottomY - Math.max(grabY, topY)) * 6;
            this.flag.slideBannerDown(Math.max(slideTime, 200));
        }

        // NES-style flag slide sequence
        player.startFlagSlide(this.flag.poleX, topY, bottomY, () => {
            this.checkLevelComplete();
        });
    }

    checkLevelComplete() {
        const p1Done = this.player1.finished || !this.player1.alive;
        const p2Done = this.player2.finished || !this.player2.alive;

        if (p1Done && p2Done && !this.levelComplete) {
            this.levelComplete = true;
            this.time.delayedCall(1000, () => {
                this.scene.stop('HUDScene');
                this.scene.start('GameOverScene', {
                    win: true,
                    score: this.score,
                    coins: this.coinCount
                });
            });
        }
    }

    addScore(amount) {
        this.score += amount;
    }

    tickTimer() {
        if (this.gameOver || this.levelComplete) return;
        this.gameTimer--;
        if (this.gameTimer <= 0) {
            this.player1.die();
            this.player2.die();
            this.triggerGameOver();
        }
    }

    checkGameOver() {
        const p1Dead = !this.player1.alive;
        const p2Dead = !this.player2.alive;

        if (p1Dead && p2Dead) {
            this.triggerGameOver();
        } else if (p1Dead && this.player2.alive) {
            // Respawn player 1 near player 2 after delay
            this.time.delayedCall(PLAYER.RESPAWN_DELAY, () => {
                if (this.player2.alive && !this.gameOver) {
                    this.player1.respawn(this.player2.x - 16, this.player2.y);
                }
            });
        } else if (p2Dead && this.player1.alive) {
            this.time.delayedCall(PLAYER.RESPAWN_DELAY, () => {
                if (this.player1.alive && !this.gameOver) {
                    this.player2.respawn(this.player1.x + 16, this.player1.y);
                }
            });
        }
    }

    triggerGameOver() {
        if (this.gameOver) return;
        this.gameOver = true;
        this.time.delayedCall(2000, () => {
            this.scene.stop('HUDScene');
            this.scene.start('GameOverScene', {
                win: false,
                score: this.score,
                coins: this.coinCount
            });
        });
    }

    update(time, delta) {
        if (this.gameOver || this.levelComplete) return;

        // Input handling
        const p1Input = this.inputManager.getP1();
        const p2Input = this.inputManager.getP2();

        this.player1.handleInput(p1Input);
        this.player2.handleInput(p2Input);

        // Camera
        this.cameraManager.update();

        // Check falling off screen
        if (this.player1.alive && this.player1.y > LEVEL_ROWS * TILE + 16) {
            this.player1.alive = false;
            this.player1.setVisible(false);
            this.checkGameOver();
        }
        if (this.player2.alive && this.player2.y > LEVEL_ROWS * TILE + 16) {
            this.player2.alive = false;
            this.player2.setVisible(false);
            this.checkGameOver();
        }

        // Update enemies
        this.goombas.getChildren().forEach(g => {
            if (g.update) g.update();
        });
        this.koopas.getChildren().forEach(k => {
            if (k.update) k.update();
        });

        // Update piranha plants
        const alivePlayers = [this.player1, this.player2];
        this.piranhaPlants.forEach(p => p.update(alivePlayers));

        // Fire effect particles
        [this.player1, this.player2].forEach(p => {
            if (p.alive && p.hasFire) {
                p.fireParticleTimer += delta;
                if (p.fireParticleTimer > 120) {
                    p.fireParticleTimer = 0;
                    const spark = this.add.rectangle(
                        p.x + Phaser.Math.Between(-6, 6),
                        p.y + Phaser.Math.Between(-8, 4),
                        2, 2,
                        Phaser.Math.RND.pick([0xff6600, 0xff0000, 0xffcc00])
                    ).setDepth(11);
                    this.tweens.add({
                        targets: spark,
                        y: spark.y - 10,
                        alpha: 0,
                        duration: 300,
                        onComplete: () => spark.destroy()
                    });
                }
            }
        });

        // Remove off-screen shells and mushrooms
        this.shells.getChildren().forEach(s => {
            if (s.y > LEVEL_ROWS * TILE + 32) s.destroy();
        });
        this.mushrooms.getChildren().forEach(m => {
            if (m.y > LEVEL_ROWS * TILE + 32) m.destroy();
        });

        // Animate ? blocks
        this.qAnimTimer += delta;
        if (this.qAnimTimer > 400) {
            this.qAnimTimer = 0;
            this.qAnimFrame = (this.qAnimFrame + 1) % 4;
            this.questionLayer.getChildren().forEach(q => {
                if (!q.used) {
                    q.setTexture('question_' + this.qAnimFrame);
                }
            });
        }
    }
}
