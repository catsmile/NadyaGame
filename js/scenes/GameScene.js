class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    init(data) {
        this.playerCount = (data && data.playerCount) || 2;
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
        if (this.playerCount >= 2) {
            this.player2 = new Player(this, 4 * TILE, 10 * TILE, 'mark');
        } else {
            // Dummy invisible player 2 for single-player mode
            this.player2 = new Player(this, 3 * TILE, 10 * TILE, 'mark');
            this.player2.setVisible(false);
            this.player2.alive = false;
            this.player2.body.checkCollision.none = true;
            this.player2.body.setAllowGravity(false);
        }

        // Input
        this.inputManager = new InputManager(this);

        // Camera
        const mapWidth = LEVEL_COLS * TILE;
        this.cameraManager = new CameraManager(this, this.player1, this.player2, mapWidth);

        // Mushroom group
        this.mushrooms = this.physics.add.group();

        // Food group (dropped by goombas)
        this.foodItems = this.physics.add.group();

        // Invader groups
        this.invaderBombs = this.physics.add.group({ allowGravity: false });
        this.playerBullets = this.physics.add.group({ allowGravity: false });

        // Create entities
        this.createCoins();
        this.createEnemies();
        this.createPiranhaPlants();
        this.createInvaders();
        this.createBoss();
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
        this.hiddenLayer = this.physics.add.staticGroup();

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

        // Place hidden blocks in random empty spots
        this.placeHiddenBlocks(levelData);

        // Animate ? blocks with texture swap
        this.qAnimTimer = 0;
        this.qAnimFrame = 0;
    }

    placeHiddenBlocks(levelData) {
        // Rows 6-9 are good heights for hidden blocks (above ground, reachable by jump)
        const candidates = [];
        for (let c = 10; c < LEVEL_COLS - 15; c++) {
            for (let r = 6; r <= 9; r++) {
                // Must be empty, and have empty space below (so player can hit from underneath)
                if (levelData[r][c] === TILES.EMPTY &&
                    levelData[r + 1][c] === TILES.EMPTY &&
                    levelData[r - 1][c] === TILES.EMPTY) {
                    candidates.push({ r, c });
                }
            }
        }

        // Shuffle and pick a few
        Phaser.Utils.Array.Shuffle(candidates);
        const count = Math.min(6, candidates.length);

        for (let i = 0; i < count; i++) {
            const { r, c } = candidates[i];
            const x = c * TILE + TILE / 2;
            const y = r * TILE + TILE / 2;

            const block = this.hiddenLayer.create(x, y, 'question_used');
            block.setAlpha(0); // invisible
            block.used = false;
            block.tileCol = c;
            block.tileRow = r;
        }
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

    createInvaders() {
        this.invaders = this.physics.add.group({ allowGravity: false });
        const invaderData = LevelData.getInvaders();
        invaderData.forEach(id => {
            const invader = new Invader(this, id.col * TILE + TILE / 2, id.row * TILE + TILE / 2);
            this.invaders.add(invader);
            // Re-set after group.add resets body
            invader.body.setAllowGravity(false);
        });
    }

    createBoss() {
        this.boss = null;
        if (Math.random() < BOSS.SPAWN_CHANCE) {
            const x = BOSS.SPAWN_COL * TILE + TILE / 2;
            const y = BOSS.SPAWN_ROW * TILE + TILE / 2;
            this.boss = new Boss(this, x, y);
        }
    }

    spawnInvaderBomb(x, y) {
        const bomb = this.physics.add.sprite(x, y, 'invader_bomb_0');
        bomb.setSize(4, 8);
        bomb.setDepth(8);
        bomb.play('invader_bomb_flash');
        this.invaderBombs.add(bomb);
        // Set velocity AFTER adding to group (group.add resets body)
        bomb.body.setAllowGravity(false);
        bomb.setVelocityY(INVADER.BOMB_SPEED);
    }

    spawnPlayerBullet(player) {
        const bullet = new PlayerBullet(this, player.x, player.y - 10);
        this.playerBullets.add(bullet);
        // Re-set velocity AFTER adding to group (group.add resets body)
        bullet.body.setAllowGravity(false);
        bullet.setVelocityY(-PLAYER.BULLET_SPEED);
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

            // Hidden block collision
            this.physics.add.collider(player, this.hiddenLayer, (p, block) => {
                this.hitHiddenBlock(p, block);
            });

            // Invader bomb hits player
            this.physics.add.overlap(player, this.invaderBombs, (p, bomb) => {
                if (!p.alive || p.invincible) return;
                bomb.destroy();
                p.die();
                this.checkGameOver();
            });

            // Player vs invader: stomp from above = kill, else die
            this.physics.add.overlap(player, this.invaders, (p, inv) => {
                if (!p.alive || p.invincible || !inv.alive) return;
                if (p.hasFire) {
                    inv.die();
                    this.addScore(SCORE.INVADER);
                    this.showScorePopup(inv.x, inv.y, SCORE.INVADER);
                    return;
                }
                if (p.body.velocity.y > 0 && p.body.bottom <= inv.body.top + 8) {
                    inv.die();
                    p.bounce();
                    this.addScore(SCORE.INVADER);
                    this.showScorePopup(inv.x, inv.y, SCORE.INVADER);
                } else {
                    p.die();
                    this.checkGameOver();
                }
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

        // Bombs hit ground/blocks -> destroy bomb
        this.physics.add.collider(this.invaderBombs, this.groundLayer, (bomb) => { bomb.destroy(); });
        this.physics.add.collider(this.invaderBombs, this.brickLayer, (bomb) => { bomb.destroy(); });
        this.physics.add.collider(this.invaderBombs, this.pipeLayer, (bomb) => { bomb.destroy(); });
        this.physics.add.collider(this.invaderBombs, this.questionLayer, (bomb) => { bomb.destroy(); });

        // Bombs kill goombas/koopas
        this.physics.add.overlap(this.invaderBombs, this.goombas, (bomb, goomba) => {
            if (goomba.alive) {
                goomba.stomped();
                bomb.destroy();
            }
        });
        this.physics.add.overlap(this.invaderBombs, this.koopas, (bomb, koopa) => {
            if (koopa.active) {
                koopa.destroy();
                bomb.destroy();
            }
        });

        // Player bullets hit invaders
        this.physics.add.overlap(this.playerBullets, this.invaders, (bullet, inv) => {
            if (!inv.alive) return;
            inv.die();
            bullet.destroy();
            this.addScore(SCORE.INVADER);
            this.showScorePopup(inv.x, inv.y, SCORE.INVADER);
        });

        // Player bullets hit bombs
        this.physics.add.overlap(this.playerBullets, this.invaderBombs, (bullet, bomb) => {
            const bx = bomb.x, by = bomb.y;
            bullet.destroy();
            bomb.destroy();
            this.addScore(SCORE.BOMB_DESTROY);
            this.showScorePopup(bx, by, SCORE.BOMB_DESTROY);
        });

        // Player bullets hit tiles -> destroy bullet
        this.physics.add.collider(this.playerBullets, this.groundLayer, (bullet) => { bullet.destroy(); });
        this.physics.add.collider(this.playerBullets, this.brickLayer, (bullet) => { bullet.destroy(); });
        this.physics.add.collider(this.playerBullets, this.pipeLayer, (bullet) => { bullet.destroy(); });
        this.physics.add.collider(this.playerBullets, this.questionLayer, (bullet) => { bullet.destroy(); });

        // Boss collisions
        if (this.boss) {
            // Boss walks on terrain
            this.physics.add.collider(this.boss, this.groundLayer);
            this.physics.add.collider(this.boss, this.brickLayer);
            this.physics.add.collider(this.boss, this.pipeLayer);
            this.physics.add.collider(this.boss, this.questionLayer);

            // Boss vs Players
            players.forEach(player => {
                this.physics.add.overlap(player, this.boss, (p, boss) => {
                    if (!p.alive || p.invincible || !boss.alive) return;
                    if (p.hasFire) {
                        boss.takeHit();
                    } else {
                        p.die();
                        this.checkGameOver();
                    }
                });
            });

            // Boss kills goombas
            this.physics.add.overlap(this.boss, this.goombas, (boss, goomba) => {
                if (!boss.alive || !goomba.alive) return;
                goomba.stomped();
            });

            // Boss kills koopas
            this.physics.add.overlap(this.boss, this.koopas, (boss, koopa) => {
                if (!boss.alive || !koopa.active) return;
                koopa.destroy();
            });

            // Boss kills invaders
            this.physics.add.overlap(this.boss, this.invaders, (boss, inv) => {
                if (!boss.alive || !inv.alive) return;
                inv.die();
            });

            // Boss destroys shells
            this.physics.add.overlap(this.boss, this.shells, (boss, shell) => {
                if (!boss.alive) return;
                shell.destroy();
            });

        }
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
            this.levelData[qblock.tileRow][qblock.tileCol] = TILES.QUESTION_USED;

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

            // Always spawn red mushroom (fire power-up)
            this.spawnMushroom(qblock.x, qblock.y - TILE);
        }
    }

    hitHiddenBlock(player, block) {
        if (block.used) return;
        if (player.body.blocked.up && player.y > block.y) {
            block.used = true;
            block.setAlpha(1);

            // Bounce animation
            this.tweens.add({
                targets: block,
                y: block.y - 4,
                duration: 80,
                yoyo: true,
                onComplete: () => {
                    block.refreshBody();
                }
            });

            this.spawnBlockCoin(block.x, block.y - TILE);
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
        // Always red mushroom (fire power-up)
        const mush = this.physics.add.image(x, y, 'mushroom_red');
        mush.setDepth(5);
        mush.setSize(14, 14);
        mush.mushroomType = 'fire';
        mush.body.setAllowGravity(true);
        mush.setVelocityX(40);
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
            fontSize: '7px',
            fontFamily: FONT, padding: FONT_PAD,
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

    placeBlock(player) {
        if (!player.alive) return;
        // Place block in the direction player is facing, at feet level
        const dir = player.flipX ? -1 : 1;
        const col = Math.floor((player.x + dir * TILE) / TILE);
        const row = Math.floor(player.y / TILE);

        // Bounds check
        if (col < 0 || col >= LEVEL_COLS || row < 0 || row >= LEVEL_ROWS) return;

        // Only place in empty space
        if (this.levelData[row][col] !== TILES.EMPTY) return;

        // Update level data
        this.levelData[row][col] = TILES.BRICK;

        // Create the brick sprite
        const x = col * TILE + TILE / 2;
        const y2 = row * TILE + TILE / 2;
        const brick = this.brickLayer.create(x, y2, 'brick');
        brick.tileCol = col;
        brick.tileRow = row;
        brick.refreshBody();
    }

    removeBlock(player) {
        if (!player.alive) return;
        // Remove block in the direction player is facing, at feet level
        const dir = player.flipX ? -1 : 1;
        const col = Math.floor((player.x + dir * TILE) / TILE);
        const row = Math.floor(player.y / TILE);

        if (col < 0 || col >= LEVEL_COLS || row < 0 || row >= LEVEL_ROWS) return;

        const tile = this.levelData[row][col];
        // Can only remove bricks and used question blocks
        if (tile !== TILES.BRICK && tile !== TILES.QUESTION_USED) return;

        this.levelData[row][col] = TILES.EMPTY;

        // Find and destroy the matching sprite
        const targetX = col * TILE + TILE / 2;
        const targetY = row * TILE + TILE / 2;

        const layers = [this.brickLayer, this.questionLayer];
        for (const layer of layers) {
            const children = layer.getChildren();
            for (let i = children.length - 1; i >= 0; i--) {
                const child = children[i];
                if (child.tileCol === col && child.tileRow === row) {
                    this.brickBreakEffect(child.x, child.y);
                    child.destroy();
                    return;
                }
            }
        }
    }

    spawnFood(x, y) {
        const food = this.physics.add.image(x, y - 8, 'food');
        food.setDepth(5);
        food.setSize(14, 8);
        food.body.setAllowGravity(true);
        food.setBounce(0.3);
        this.foodItems.add(food);

        // Pop up
        food.setVelocityY(-120);
        food.setVelocityX(Phaser.Math.Between(-30, 30));

        // Collide with terrain
        this.physics.add.collider(food, this.groundLayer);
        this.physics.add.collider(food, this.brickLayer);
        this.physics.add.collider(food, this.pipeLayer);

        // Overlap with players
        [this.player1, this.player2].forEach(player => {
            this.physics.add.overlap(player, food, (p, f) => {
                if (!f.active || !p.alive) return;
                p.feed(HUNGER.GOOMBA_FOOD);
                f.destroy();
                // Popup
                const popup = this.add.text(p.x, p.y - 12, '+' + HUNGER.GOOMBA_FOOD, {
                    fontSize: '7px',
                    fontFamily: FONT, padding: FONT_PAD,
                    color: '#00ff00'
                }).setOrigin(0.5).setDepth(20);
                this.tweens.add({
                    targets: popup,
                    y: popup.y - 16,
                    alpha: 0,
                    duration: 500,
                    onComplete: () => popup.destroy()
                });
            });
        });

        // Despawn after 10 seconds
        this.time.delayedCall(10000, () => {
            if (food.active) food.destroy();
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
            this.spawnFood(goomba.x, goomba.y);
            goomba.stomped();
            this.addScore(SCORE.GOOMBA);
            return;
        }

        // Stomp check
        if (player.body.velocity.y > 0 && player.body.bottom <= goomba.body.top + 8) {
            this.spawnFood(goomba.x, goomba.y);
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

    screenGlitch() {
        const cam = this.cameras.main;

        // Rapid color flash
        cam.flash(150, 255, 0, 0, true);

        // Shake
        cam.shake(400, 0.02, true);

        // Glitch slices — horizontal offset bars
        const slices = [];
        for (let i = 0; i < 8; i++) {
            const yy = Phaser.Math.Between(0, GAME_HEIGHT);
            const h = Phaser.Math.Between(4, 20);
            const slice = this.add.rectangle(
                GAME_WIDTH / 2 + Phaser.Math.Between(-30, 30),
                yy, GAME_WIDTH, h,
                Phaser.Math.RND.pick([0xff0000, 0x00ff00, 0x0000ff, 0xffffff])
            ).setAlpha(0.6).setDepth(100).setScrollFactor(0);
            slices.push(slice);
        }

        // Horizontal offset jitter
        let jitterCount = 0;
        const jitterEvent = this.time.addEvent({
            delay: 50,
            repeat: 7,
            callback: () => {
                cam.setScroll(
                    cam.scrollX + Phaser.Math.Between(-3, 3),
                    cam.scrollY + Phaser.Math.Between(-1, 1)
                );
                // Shift slices
                slices.forEach(s => {
                    if (s.active) s.x += Phaser.Math.Between(-20, 20);
                });
            }
        });

        // Clean up
        this.time.delayedCall(500, () => {
            slices.forEach(s => { if (s.active) s.destroy(); });
        });
    }

    playerPiranhaCollision(player, plant) {
        if (!player.alive || player.invincible) return;
        if (!plant.active) return;
        if (plant.state === 'hidden') return;

        // Fire power-up kills piranha
        if (player.hasFire) {
            plant.disableBody(true, true);
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
            fontSize: '7px',
            fontFamily: FONT, padding: FONT_PAD,
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
        const p2Done = this.playerCount === 1 ? true : (this.player2.finished || !this.player2.alive);

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

    showScorePopup(x, y, amount) {
        const popup = this.add.text(x, y - 8, String(amount), {
            fontSize: '7px',
            fontFamily: FONT, padding: FONT_PAD,
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

    tickTimer() {
        if (this.gameOver || this.levelComplete) return;
        this.gameTimer--;
        if (this.gameTimer <= 0) {
            this.player1.die();
            if (this.playerCount >= 2) this.player2.die();
            this.triggerGameOver();
        }
    }

    checkGameOver() {
        const p1Dead = !this.player1.alive;
        const p2Dead = !this.player2.alive;

        if (this.playerCount === 1) {
            // Single player — game over when player 1 dies
            if (p1Dead) {
                this.triggerGameOver();
            }
        } else {
            if (p1Dead && p2Dead) {
                this.triggerGameOver();
            } else if (p1Dead && this.player2.alive) {
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
        this.player1.handleInput(p1Input);
        if (this.playerCount >= 2) {
            const p2Input = this.inputManager.getP2();
            this.player2.handleInput(p2Input);
        }

        // Hunger
        this.player1.updateHunger(delta);
        if (this.playerCount >= 2) {
            this.player2.updateHunger(delta);
        }

        // Camera
        this.cameraManager.update();

        // Check falling off screen
        if (this.player1.alive && this.player1.y > LEVEL_ROWS * TILE + 16) {
            this.player1.alive = false;
            this.player1.setVisible(false);
            this.screenGlitch();
            this.checkGameOver();
        }
        if (this.player2.alive && this.player2.y > LEVEL_ROWS * TILE + 16) {
            this.player2.alive = false;
            this.player2.setVisible(false);
            this.screenGlitch();
            this.checkGameOver();
        }

        // Update boss
        if (this.boss && this.boss.active) {
            this.boss.update();
            // Cleanup if fell off screen
            if (this.boss.y > LEVEL_ROWS * TILE + 48) {
                this.boss.alive = false;
                this.boss.destroy();
                this.boss = null;
            }
        }

        // Update enemies
        this.goombas.getChildren().forEach(g => {
            if (g.update) g.update();
        });
        this.koopas.getChildren().forEach(k => {
            if (k.update) k.update();
        });

        // Update piranha plants (filter out destroyed ones)
        this.piranhaPlants = this.piranhaPlants.filter(p => p.active);
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

        // Update invaders
        this.invaders.getChildren().forEach(inv => {
            if (inv.update) inv.update();
        });

        // Update player bullets
        this.playerBullets.getChildren().forEach(b => {
            if (b.update) b.update();
        });

        // Remove off-screen shells and mushrooms
        this.shells.getChildren().forEach(s => {
            if (s.y > LEVEL_ROWS * TILE + 32) s.destroy();
        });
        this.mushrooms.getChildren().forEach(m => {
            if (m.y > LEVEL_ROWS * TILE + 32) m.destroy();
        });
        this.foodItems.getChildren().forEach(f => {
            if (f.y > LEVEL_ROWS * TILE + 32) f.destroy();
        });

        // Remove off-screen bombs and bullets
        this.invaderBombs.getChildren().forEach(b => {
            if (b.y > LEVEL_ROWS * TILE + 32) b.destroy();
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
