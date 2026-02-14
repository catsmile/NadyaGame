class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        const cx = GAME_WIDTH / 2;
        const cy = GAME_HEIGHT / 2;
        this.selected = 0; // 0 = 1 player, 1 = 2 players
        this.menuPipeX = 620;

        // Animated background — scrolling ground
        this.bgTiles = [];
        for (let i = 0; i < 60; i++) {
            const t = this.add.image(i * 16, GAME_HEIGHT - 32, 'ground_top').setOrigin(0, 0).setScale(2);
            this.bgTiles.push(t);
            const t2 = this.add.image(i * 16, GAME_HEIGHT - 16, 'ground').setOrigin(0, 0).setScale(2);
            this.bgTiles.push(t2);
        }

        // Clouds drifting
        for (let i = 0; i < 5; i++) {
            const cloud = this.add.image(
                Phaser.Math.Between(0, GAME_WIDTH),
                Phaser.Math.Between(40, 160),
                'cloud'
            ).setScale(2).setAlpha(0.7);
            this.tweens.add({
                targets: cloud,
                x: cloud.x + 300,
                duration: Phaser.Math.Between(8000, 15000),
                repeat: -1,
                onRepeat: () => { cloud.x = -100; }
            });
        }

        // Day/night cycle
        this.nightOverlay = this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x0a0a30).setDepth(0).setAlpha(0);
        this.isNight = false;

        // Stars (hidden during day)
        this.stars = [];
        for (let i = 0; i < 30; i++) {
            const star = this.add.rectangle(
                Phaser.Math.Between(10, GAME_WIDTH - 10),
                Phaser.Math.Between(10, GAME_HEIGHT - 80),
                2, 2, 0xfcfcfc
            ).setDepth(0).setAlpha(0);
            this.stars.push(star);
            // Twinkle
            this.tweens.add({
                targets: star,
                alpha: { from: 0, to: 0 },
                duration: Phaser.Math.Between(600, 1200),
                yoyo: true,
                repeat: -1,
                delay: Phaser.Math.Between(0, 2000)
            });
        }

        this.time.addEvent({
            delay: 30000,
            loop: true,
            callback: () => this.toggleDayNight()
        });

        // Decorative elements (behind text)
        this.spawnMenuQuestionBlocks();
        this.spawnMenuPipe();
        this.spawnMenuEnemies();
        this.spawnMenuInvaders();

        // Bouncing title
        const title1 = this.add.text(cx, cy - 220, 'NADYA & MARK', {
            fontSize: '30px',
            fontFamily: FONT, padding: FONT_PAD,
            color: '#f83800',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(10);

        this.tweens.add({
            targets: title1,
            y: title1.y - 8,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        const title2 = this.add.text(cx, cy - 165, 'SUPER ADVENTURE', {
            fontSize: '16px',
            fontFamily: FONT, padding: FONT_PAD,
            color: '#f8b800',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(10);

        // Rainbow shimmer on subtitle
        const subtitleColors = [0xf8b800, 0xff6600, 0xf83800, 0xff6600];
        let colorIdx = 0;
        this.time.addEvent({
            delay: 300,
            loop: true,
            callback: () => {
                colorIdx = (colorIdx + 1) % subtitleColors.length;
                title2.setTint(subtitleColors[colorIdx]);
            }
        });

        // Animated characters — walking in place
        this.nadyaPreview = this.add.sprite(cx - 80, cy - 50, 'nadya_1').setScale(5).setDepth(10);
        this.markPreview = this.add.sprite(cx + 80, cy - 50, 'mark_1').setScale(5).setDepth(10);

        // Bounce characters
        this.tweens.add({
            targets: this.nadyaPreview,
            y: this.nadyaPreview.y - 6,
            duration: 400,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        this.tweens.add({
            targets: this.markPreview,
            y: this.markPreview.y - 6,
            duration: 400,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            delay: 200
        });

        // Swap walk frames
        let walkFrame = 0;
        this.time.addEvent({
            delay: 250,
            loop: true,
            callback: () => {
                walkFrame = walkFrame === 1 ? 2 : 1;
                this.nadyaPreview.setTexture('nadya_' + walkFrame);
                this.markPreview.setTexture('mark_' + walkFrame);
            }
        });

        this.add.text(cx - 80, cy + 10, 'NADYA', {
            fontSize: '11px',
            fontFamily: FONT, padding: FONT_PAD,
            color: '#f83800'
        }).setOrigin(0.5).setDepth(10);

        this.add.text(cx + 80, cy + 10, 'MARK', {
            fontSize: '11px',
            fontFamily: FONT, padding: FONT_PAD,
            color: '#3858a8'
        }).setOrigin(0.5).setDepth(10);

        // Decorative coins
        for (let i = 0; i < 3; i++) {
            const coin = this.add.sprite(cx - 40 + i * 40, cy + 45, 'coin_0').setScale(2).setDepth(10);
            this.tweens.add({
                targets: coin,
                y: coin.y - 4,
                duration: 500,
                yoyo: true,
                repeat: -1,
                delay: i * 150
            });
        }

        // Mode selection — at the top so it's always visible
        const modeY = 20;
        this.modeLineHeight = 24;

        // Dark background panel behind mode selection
        this.add.rectangle(cx, modeY + 60, 340, 130, 0x000000, 0.6).setDepth(9);

        this.add.text(cx, modeY + 10, 'SELECT MODE', {
            fontSize: '10px',
            fontFamily: FONT, padding: FONT_PAD,
            color: '#fcfcfc'
        }).setOrigin(0.5).setDepth(10);

        const optStyle = { fontSize: '11px', fontFamily: FONT, padding: FONT_PAD, color: '#fcfcfc' };
        this.options = [];

        this.options[0] = this.add.text(cx, modeY + 34, '1 PLAYER', optStyle).setOrigin(0.5).setDepth(10);
        this.options[1] = this.add.text(cx, modeY + 34 + this.modeLineHeight, '1P NO HUNGER', optStyle).setOrigin(0.5).setDepth(10);
        this.options[2] = this.add.text(cx, modeY + 34 + this.modeLineHeight * 2, '2 PLAYERS', optStyle).setOrigin(0.5).setDepth(10);
        this.options[3] = this.add.text(cx, modeY + 34 + this.modeLineHeight * 3, '2P NO HUNGER', optStyle).setOrigin(0.5).setDepth(10);

        // Selection arrow
        this.arrow = this.add.text(cx - 110, modeY + 34, '\u25B6', {
            fontSize: '10px',
            fontFamily: FONT, padding: FONT_PAD,
            color: '#f8b800'
        }).setOrigin(0.5).setDepth(10);

        // Arrow blink
        this.tweens.add({
            targets: this.arrow,
            alpha: 0.3,
            duration: 300,
            yoyo: true,
            repeat: -1
        });

        this.updateSelection();

        // Controls hint
        const ctrlY = cy + 100;
        this.controlsText = this.add.text(cx, ctrlY, '', {
            fontSize: '7px',
            fontFamily: FONT, padding: FONT_PAD,
            color: '#acecfc',
            lineSpacing: 5,
            align: 'center'
        }).setOrigin(0.5).setDepth(10);

        this.updateControlsHint();

        // Start prompt
        const startText = this.add.text(cx, cy + 180, 'PRESS ENTER OR SPACE', {
            fontSize: '10px',
            fontFamily: FONT, padding: FONT_PAD,
            color: '#50d848'
        }).setOrigin(0.5).setDepth(10);

        this.tweens.add({
            targets: startText,
            alpha: 0.2,
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        // Input
        this.input.keyboard.on('keydown-UP', () => this.changeSelection(-1));
        this.input.keyboard.on('keydown-DOWN', () => this.changeSelection(1));
        this.input.keyboard.on('keydown-W', () => this.changeSelection(-1));
        this.input.keyboard.on('keydown-S', () => this.changeSelection(1));

        this.input.keyboard.on('keydown-ENTER', () => this.startGame());
        this.input.keyboard.on('keydown-SPACE', () => this.startGame());
    }

    changeSelection(dir) {
        this.selected = Phaser.Math.Clamp(this.selected + dir, 0, 3);
        this.updateSelection();
        this.updateControlsHint();
    }

    updateSelection() {
        const modeY = 20;
        this.arrow.y = modeY + 34 + this.selected * this.modeLineHeight;
        this.options.forEach((opt, i) => {
            opt.setColor(this.selected === i ? '#f8b800' : '#888888');
        });
    }

    updateControlsHint() {
        const is1P = this.selected <= 1;
        const noHunger = this.selected === 1 || this.selected === 3;
        if (is1P) {
            this.controlsText.setText(
                'AD: Move  SPACE: Jump  W: Shoot\nE: Place Block  Q: Break Block' +
                (noHunger ? '\nRelaxed mode - no hunger!' : '\nHunt Goombas for Food!')
            );
        } else {
            this.controlsText.setText(
                'P1: AD+SPACE  W:Shoot  E:Place  Q:Break\nP2: Arrows+Num0  UP:Shoot  Num1:Place  Num3:Break' +
                (noHunger ? '\nRelaxed mode - no hunger!' : '\nHunt Goombas for Food!')
            );
        }
    }

    spawnMenuEnemies() {
        const y = GAME_HEIGHT - 48;
        const turnX = this.menuPipeX - 16; // stop before pipe

        for (let i = 0; i < 3; i++) {
            const startX = -30 - i * 60;
            const goomba = this.add.sprite(startX, y, 'goomba_0').setScale(2).setDepth(3);

            this.tweens.add({
                targets: goomba,
                x: turnX,
                duration: Phaser.Math.Between(5000, 8000),
                yoyo: true,
                repeat: -1,
                delay: i * 2500
            });

            // Swap walk frames
            this.time.addEvent({
                delay: 250,
                loop: true,
                callback: () => {
                    goomba.setTexture(
                        goomba.texture.key === 'goomba_0' ? 'goomba_1' : 'goomba_0'
                    );
                }
            });
        }
    }

    spawnMenuPipe() {
        const pipeX = this.menuPipeX;
        const groundY = GAME_HEIGHT - 32;
        const pipeTopY = groundY - 64;

        // Piranha plant (behind pipe, depth 1)
        const piranha = this.add.sprite(pipeX + 32, groundY, 'piranha_0').setScale(2);
        piranha.setOrigin(0.5, 1);
        piranha.setDepth(1);

        // Pipe tiles (in front of piranha, depth 5)
        this.add.image(pipeX, pipeTopY, 'pipe_tl').setOrigin(0, 0).setScale(2).setDepth(5);
        this.add.image(pipeX + 32, pipeTopY, 'pipe_tr').setOrigin(0, 0).setScale(2).setDepth(5);
        this.add.image(pipeX, groundY - 32, 'pipe_bl').setOrigin(0, 0).setScale(2).setDepth(5);
        this.add.image(pipeX + 32, groundY - 32, 'pipe_br').setOrigin(0, 0).setScale(2).setDepth(5);

        // Animate piranha: start hidden inside pipe, rise to peek above
        this.tweens.add({
            targets: piranha,
            y: pipeTopY - 8,
            duration: 1000,
            hold: 1500,
            yoyo: true,
            repeat: -1,
            repeatDelay: 2000,
            ease: 'Sine.easeInOut'
        });

        // Swap piranha frames
        this.time.addEvent({
            delay: 200,
            loop: true,
            callback: () => {
                piranha.setTexture(
                    piranha.texture.key === 'piranha_0' ? 'piranha_1' : 'piranha_0'
                );
            }
        });
    }

    spawnMenuQuestionBlocks() {
        const groundY = GAME_HEIGHT - 32;
        const positions = [
            { x: 100, y: groundY - 128 },
            { x: 260, y: groundY - 96 },
            { x: 500, y: groundY - 128 }
        ];

        positions.forEach((pos, i) => {
            const qblock = this.add.sprite(pos.x, pos.y, 'question_0').setScale(2).setDepth(2);

            // Animate texture
            let frame = 0;
            this.time.addEvent({
                delay: 400,
                loop: true,
                callback: () => {
                    frame = (frame + 1) % 4;
                    qblock.setTexture('question_' + frame);
                }
            });

            // Subtle float
            this.tweens.add({
                targets: qblock,
                y: pos.y - 3,
                duration: 600,
                yoyo: true,
                repeat: -1,
                delay: i * 200,
                ease: 'Sine.easeInOut'
            });
        });
    }

    spawnMenuInvaders() {
        this.menuInvaders = [];
        this.menuBullets = [];

        // 3 invaders drifting across the top
        for (let i = 0; i < 3; i++) {
            const inv = this.add.sprite(
                Phaser.Math.Between(100, GAME_WIDTH - 100),
                Phaser.Math.Between(30, 110),
                'invader_0'
            ).setScale(2.5).setDepth(6);
            inv.dirX = (Math.random() < 0.5 ? 1 : -1) * Phaser.Math.Between(30, 60);
            inv.dirY = (Math.random() < 0.5 ? 1 : -1) * Phaser.Math.Between(8, 20);
            this.menuInvaders.push(inv);
        }

        // Animate invader frames
        this.time.addEvent({
            delay: 300,
            loop: true,
            callback: () => {
                this.menuInvaders.forEach(inv => {
                    if (!inv.active) return;
                    inv.setTexture(inv.texture.key === 'invader_0' ? 'invader_1' : 'invader_0');
                });
            }
        });

        // Characters shoot randomly at invaders
        this.time.addEvent({
            delay: Phaser.Math.Between(1200, 2500),
            loop: true,
            callback: () => {
                this.menuCharacterShoot();
            }
        });
    }

    menuCharacterShoot() {
        // Pick a random shooter: nadya or mark
        const shooter = Math.random() < 0.5 ? this.nadyaPreview : this.markPreview;

        // Create bullet — flies straight up
        const bullet = this.add.rectangle(shooter.x, shooter.y - 30, 6, 14, 0xf8f800).setDepth(11);
        bullet.shooterX = shooter.x;
        this.menuBullets.push(bullet);

        const targetY = -20;
        const dist = bullet.y - targetY;
        const duration = dist * 2.5;

        this.tweens.add({
            targets: bullet,
            y: targetY,
            duration: duration,
            ease: 'Linear',
            onUpdate: () => {
                if (!bullet.active) return;
                // Check hit against invaders while flying up
                for (const inv of this.menuInvaders) {
                    if (!inv.active || !inv.visible) continue;
                    if (Math.abs(bullet.x - inv.x) < 20 && Math.abs(bullet.y - inv.y) < 20) {
                        bullet.destroy();
                        this.menuInvaderExplode(inv);
                        return;
                    }
                }
            },
            onComplete: () => {
                // Missed — destroy bullet off screen
                if (bullet.active) bullet.destroy();
            }
        });
    }

    menuInvaderExplode(inv) {
        const ex = inv.x;
        const ey = inv.y;
        inv.setVisible(false);

        // Green particle burst
        for (let i = 0; i < 6; i++) {
            const p = this.add.rectangle(
                ex + Phaser.Math.Between(-4, 4),
                ey + Phaser.Math.Between(-4, 4),
                Phaser.Math.Between(4, 8),
                Phaser.Math.Between(4, 8),
                Phaser.Math.RND.pick([0x00e800, 0x50ff50, 0x00a800])
            ).setDepth(15);
            this.tweens.add({
                targets: p,
                x: p.x + Phaser.Math.Between(-40, 40),
                y: p.y + Phaser.Math.Between(-40, 40),
                alpha: 0,
                scaleX: 0.2,
                scaleY: 0.2,
                duration: Phaser.Math.Between(300, 500),
                onComplete: () => p.destroy()
            });
        }

        // Respawn after delay at random edge
        this.time.delayedCall(Phaser.Math.Between(1500, 3000), () => {
            if (!inv.active) return;
            inv.setVisible(true);
            const fromLeft = Math.random() < 0.5;
            inv.x = fromLeft ? -30 : GAME_WIDTH + 30;
            inv.y = Phaser.Math.Between(30, 110);
            inv.dirX = fromLeft ? Phaser.Math.Between(30, 60) : -Phaser.Math.Between(30, 60);
            inv.dirY = (Math.random() < 0.5 ? 1 : -1) * Phaser.Math.Between(8, 20);
        });
    }

    update(time, delta) {
        const dt = delta / 1000;

        // Move invaders
        if (this.menuInvaders) {
            this.menuInvaders.forEach(inv => {
                if (!inv.active || !inv.visible) return;
                inv.x += inv.dirX * dt;
                inv.y += inv.dirY * dt;

                // Bounce off top/bottom
                if (inv.y < 20 || inv.y > 120) {
                    inv.dirY *= -1;
                }
                // Wrap horizontally
                if (inv.x < -40) { inv.x = GAME_WIDTH + 30; }
                if (inv.x > GAME_WIDTH + 40) { inv.x = -30; }
            });
        }
    }

    toggleDayNight() {
        this.isNight = !this.isNight;
        if (this.isNight) {
            // Transition to night
            this.tweens.add({ targets: this.nightOverlay, alpha: 0.65, duration: 3000 });
            this.stars.forEach(star => {
                this.tweens.add({ targets: star, alpha: { from: 0.3, to: 1 }, duration: Phaser.Math.Between(600, 1200), yoyo: true, repeat: -1, delay: Phaser.Math.Between(0, 3000) });
            });
        } else {
            // Transition to day
            this.tweens.add({ targets: this.nightOverlay, alpha: 0, duration: 3000 });
            this.stars.forEach(star => {
                this.tweens.killTweensOf(star);
                star.setAlpha(0);
            });
        }
    }

    startGame() {
        const modes = [
            { playerCount: 1, noHunger: false },
            { playerCount: 1, noHunger: true },
            { playerCount: 2, noHunger: false },
            { playerCount: 2, noHunger: true }
        ];
        this.scene.start('GameScene', modes[this.selected]);
    }
}
