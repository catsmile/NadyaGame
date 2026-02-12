class SpriteGenerator {
    constructor(scene) {
        this.scene = scene;
    }

    generateAll() {
        this.generateTiles();
        this.generatePlayer('nadya', COLORS.NADYA_HAT, COLORS.NADYA_SHIRT, COLORS.NADYA_PANTS, COLORS.NADYA_SKIN);
        this.generatePlayer('mark', COLORS.MARK_HAT, COLORS.MARK_SHIRT, COLORS.MARK_PANTS, COLORS.MARK_SKIN);
        this.generateGoomba();
        this.generateKoopa();
        this.generateCoin();
        this.generateFlag();
        this.generatePiranhaPlant();
        this.generateMushrooms();
        this.generateDecorations();
        this.generateCastle();
    }

    // -- Tiles --
    generateTiles() {
        const g = this.scene.make.graphics({ add: false });

        // Ground tile
        g.clear();
        g.fillStyle(COLORS.GROUND);
        g.fillRect(0, 0, 16, 16);
        g.fillStyle(COLORS.GROUND_DARK);
        g.fillRect(0, 0, 16, 1);
        for (let i = 0; i < 4; i++) {
            g.fillRect(i * 5, 4, 1, 1);
            g.fillRect(i * 5 + 2, 8, 1, 1);
            g.fillRect(i * 5, 12, 1, 1);
        }
        g.generateTexture('ground', 16, 16);

        // Ground top (with grass)
        g.clear();
        g.fillStyle(COLORS.GROUND);
        g.fillRect(0, 4, 16, 12);
        g.fillStyle(0x00a800);
        g.fillRect(0, 0, 16, 4);
        g.fillStyle(0x50d848);
        g.fillRect(1, 0, 14, 2);
        g.generateTexture('ground_top', 16, 16);

        // Brick
        g.clear();
        g.fillStyle(COLORS.BRICK);
        g.fillRect(0, 0, 16, 16);
        g.fillStyle(COLORS.BRICK_LINES);
        g.fillRect(0, 3, 16, 1);
        g.fillRect(0, 7, 16, 1);
        g.fillRect(0, 11, 16, 1);
        g.fillRect(0, 15, 16, 1);
        g.fillRect(7, 0, 1, 4);
        g.fillRect(3, 4, 1, 4);
        g.fillRect(11, 4, 1, 4);
        g.fillRect(7, 8, 1, 4);
        g.fillRect(3, 12, 1, 4);
        g.fillRect(11, 12, 1, 4);
        g.generateTexture('brick', 16, 16);

        // Question block (4 frames: 3 shine + 1 dark)
        for (let f = 0; f < 4; f++) {
            g.clear();
            g.fillStyle(f < 3 ? COLORS.QUESTION_BLOCK : COLORS.QUESTION_DARK);
            g.fillRect(0, 0, 16, 16);
            g.fillStyle(COLORS.QUESTION_DARK);
            g.fillRect(0, 0, 16, 1);
            g.fillRect(0, 15, 16, 1);
            g.fillRect(0, 0, 1, 16);
            g.fillRect(15, 0, 1, 16);
            // Question mark
            g.fillStyle(COLORS.WHITE);
            if (f < 3) {
                g.fillRect(6, 3, 4, 2);
                g.fillRect(8, 5, 2, 2);
                g.fillRect(6, 7, 4, 2);
                g.fillRect(6, 9, 2, 1);
                g.fillRect(6, 11, 2, 2);
            }
            g.generateTexture('question_' + f, 16, 16);
        }

        // Question used (empty block)
        g.clear();
        g.fillStyle(COLORS.QUESTION_USED);
        g.fillRect(0, 0, 16, 16);
        g.fillStyle(0x684434);
        g.fillRect(0, 0, 16, 1);
        g.fillRect(0, 15, 16, 1);
        g.fillRect(0, 0, 1, 16);
        g.fillRect(15, 0, 1, 16);
        g.generateTexture('question_used', 16, 16);

        // Pipe tiles
        // Top-left
        g.clear();
        g.fillStyle(COLORS.PIPE_GREEN);
        g.fillRect(0, 0, 16, 16);
        g.fillStyle(COLORS.PIPE_LIGHT);
        g.fillRect(0, 0, 2, 16);
        g.fillRect(2, 0, 14, 2);
        g.fillRect(4, 2, 4, 14);
        g.fillStyle(COLORS.PIPE_DARK);
        g.fillRect(14, 0, 2, 16);
        g.generateTexture('pipe_tl', 16, 16);

        // Top-right
        g.clear();
        g.fillStyle(COLORS.PIPE_GREEN);
        g.fillRect(0, 0, 16, 16);
        g.fillStyle(COLORS.PIPE_LIGHT);
        g.fillRect(0, 0, 16, 2);
        g.fillStyle(COLORS.PIPE_DARK);
        g.fillRect(14, 0, 2, 16);
        g.generateTexture('pipe_tr', 16, 16);

        // Bottom-left
        g.clear();
        g.fillStyle(COLORS.PIPE_GREEN);
        g.fillRect(0, 0, 16, 16);
        g.fillStyle(COLORS.PIPE_LIGHT);
        g.fillRect(2, 0, 2, 16);
        g.fillRect(6, 0, 4, 16);
        g.fillStyle(COLORS.PIPE_DARK);
        g.fillRect(14, 0, 2, 16);
        g.generateTexture('pipe_bl', 16, 16);

        // Bottom-right
        g.clear();
        g.fillStyle(COLORS.PIPE_GREEN);
        g.fillRect(0, 0, 16, 16);
        g.fillStyle(COLORS.PIPE_DARK);
        g.fillRect(14, 0, 2, 16);
        g.generateTexture('pipe_br', 16, 16);

        g.destroy();
    }

    // -- Player sprite (5 frames: idle, walk1, walk2, jump, dead) --
    generatePlayer(key, hatColor, shirtColor, pantsColor, skinColor) {
        const g = this.scene.make.graphics({ add: false });
        const fw = 16, fh = 16;

        for (let frame = 0; frame < 5; frame++) {
            g.clear();
            const ox = 0, oy = 0;

            if (frame === 4) {
                // Dead frame - upside down / X eyes
                g.fillStyle(skinColor);
                g.fillRect(ox + 4, oy + 8, 8, 5);
                g.fillStyle(hatColor);
                g.fillRect(ox + 3, oy + 4, 10, 4);
                g.fillRect(ox + 5, oy + 2, 7, 2);
                g.fillStyle(shirtColor);
                g.fillRect(ox + 4, oy + 13, 8, 3);
                // X eyes
                g.fillStyle(COLORS.BLACK);
                g.fillRect(ox + 5, oy + 9, 1, 1);
                g.fillRect(ox + 7, oy + 9, 1, 1);
                g.fillRect(ox + 6, oy + 10, 1, 1);
                g.fillRect(ox + 5, oy + 11, 1, 1);
                g.fillRect(ox + 7, oy + 11, 1, 1);
                g.fillRect(ox + 9, oy + 9, 1, 1);
                g.fillRect(ox + 11, oy + 9, 1, 1);
                g.fillRect(ox + 10, oy + 10, 1, 1);
                g.fillRect(ox + 9, oy + 11, 1, 1);
                g.fillRect(ox + 11, oy + 11, 1, 1);
            } else {
                // Hat
                g.fillStyle(hatColor);
                g.fillRect(ox + 3, oy + 0, 10, 3);
                g.fillRect(ox + 2, oy + 1, 12, 2);

                // Face
                g.fillStyle(skinColor);
                g.fillRect(ox + 3, oy + 3, 10, 4);

                // Eyes
                g.fillStyle(COLORS.BLACK);
                g.fillRect(ox + 5, oy + 4, 2, 2);
                g.fillRect(ox + 9, oy + 4, 2, 2);

                // Body / shirt
                g.fillStyle(shirtColor);
                g.fillRect(ox + 3, oy + 7, 10, 4);

                // Arms
                if (frame === 0) {
                    // Idle - arms down
                    g.fillStyle(skinColor);
                    g.fillRect(ox + 1, oy + 7, 2, 4);
                    g.fillRect(ox + 13, oy + 7, 2, 4);
                } else if (frame === 1) {
                    // Walk1 - arms swing
                    g.fillStyle(skinColor);
                    g.fillRect(ox + 1, oy + 6, 2, 4);
                    g.fillRect(ox + 13, oy + 8, 2, 4);
                } else if (frame === 2) {
                    // Walk2 - arms swap
                    g.fillStyle(skinColor);
                    g.fillRect(ox + 1, oy + 8, 2, 4);
                    g.fillRect(ox + 13, oy + 6, 2, 4);
                } else if (frame === 3) {
                    // Jump - arms up
                    g.fillStyle(skinColor);
                    g.fillRect(ox + 1, oy + 5, 2, 4);
                    g.fillRect(ox + 13, oy + 5, 2, 4);
                }

                // Pants
                g.fillStyle(pantsColor);
                g.fillRect(ox + 4, oy + 11, 8, 3);

                // Legs
                if (frame === 0 || frame === 3) {
                    g.fillStyle(pantsColor);
                    g.fillRect(ox + 4, oy + 14, 3, 2);
                    g.fillRect(ox + 9, oy + 14, 3, 2);
                } else if (frame === 1) {
                    g.fillStyle(pantsColor);
                    g.fillRect(ox + 3, oy + 14, 3, 2);
                    g.fillRect(ox + 10, oy + 14, 3, 2);
                } else if (frame === 2) {
                    g.fillStyle(pantsColor);
                    g.fillRect(ox + 5, oy + 14, 3, 2);
                    g.fillRect(ox + 8, oy + 14, 3, 2);
                }
            }

            g.generateTexture(key + '_' + frame, fw, fh);
            g.clear();
        }

        g.destroy();

        // Create animations
        this.scene.anims.create({
            key: key + '_idle',
            frames: [{ key: key + '_0' }],
            frameRate: 1,
            repeat: -1
        });

        this.scene.anims.create({
            key: key + '_walk',
            frames: [
                { key: key + '_1' },
                { key: key + '_2' }
            ],
            frameRate: 8,
            repeat: -1
        });

        this.scene.anims.create({
            key: key + '_jump',
            frames: [{ key: key + '_3' }],
            frameRate: 1,
            repeat: -1
        });

        this.scene.anims.create({
            key: key + '_dead',
            frames: [{ key: key + '_4' }],
            frameRate: 1,
            repeat: -1
        });
    }

    // -- Goomba (3 textures: walk1, walk2, squish) --
    generateGoomba() {
        const g = this.scene.make.graphics({ add: false });

        for (let frame = 0; frame < 3; frame++) {
            g.clear();

            if (frame < 2) {
                // Body
                g.fillStyle(COLORS.GOOMBA_BODY);
                g.fillRect(2, 2, 12, 8);
                g.fillRect(1, 4, 14, 6);
                g.fillRect(0, 6, 16, 4);

                // Face
                g.fillStyle(COLORS.WHITE);
                g.fillRect(3, 4, 3, 3);
                g.fillRect(10, 4, 3, 3);
                g.fillStyle(COLORS.BLACK);
                g.fillRect(4, 5, 2, 2);
                g.fillRect(11, 5, 2, 2);

                // Feet
                g.fillStyle(COLORS.GOOMBA_DARK);
                g.fillRect(1, 10, 14, 4);
                if (frame === 0) {
                    g.fillStyle(COLORS.GOOMBA_FEET);
                    g.fillRect(0, 13, 6, 3);
                    g.fillRect(10, 13, 6, 3);
                } else {
                    g.fillStyle(COLORS.GOOMBA_FEET);
                    g.fillRect(1, 13, 6, 3);
                    g.fillRect(9, 13, 6, 3);
                }
            } else {
                // Squished
                g.fillStyle(COLORS.GOOMBA_BODY);
                g.fillRect(1, 10, 14, 4);
                g.fillStyle(COLORS.GOOMBA_DARK);
                g.fillRect(0, 12, 16, 4);
                g.fillStyle(COLORS.BLACK);
                g.fillRect(3, 11, 2, 1);
                g.fillRect(11, 11, 2, 1);
            }

            g.generateTexture('goomba_' + frame, 16, 16);
        }

        g.destroy();

        this.scene.anims.create({
            key: 'goomba_walk',
            frames: [
                { key: 'goomba_0' },
                { key: 'goomba_1' }
            ],
            frameRate: 4,
            repeat: -1
        });
    }

    // -- Koopa (3 textures: walk1, walk2, shell) --
    generateKoopa() {
        const g = this.scene.make.graphics({ add: false });

        for (let frame = 0; frame < 3; frame++) {
            g.clear();

            if (frame < 2) {
                // Shell/body
                g.fillStyle(COLORS.KOOPA_SHELL);
                g.fillRect(3, 0, 10, 10);
                g.fillRect(2, 2, 12, 8);
                g.fillStyle(COLORS.KOOPA_SHELL_DARK);
                g.fillRect(5, 2, 6, 6);

                // Head
                g.fillStyle(COLORS.KOOPA_SKIN);
                g.fillRect(3, 10, 5, 4);
                g.fillStyle(COLORS.BLACK);
                g.fillRect(4, 11, 2, 1);

                // Feet
                g.fillStyle(COLORS.KOOPA_FEET);
                if (frame === 0) {
                    g.fillRect(2, 14, 4, 2);
                    g.fillRect(10, 14, 4, 2);
                } else {
                    g.fillRect(3, 14, 4, 2);
                    g.fillRect(9, 14, 4, 2);
                }
            } else {
                // Shell only
                g.fillStyle(COLORS.KOOPA_SHELL);
                g.fillRect(2, 4, 12, 10);
                g.fillRect(3, 2, 10, 12);
                g.fillStyle(COLORS.KOOPA_SHELL_DARK);
                g.fillRect(5, 5, 6, 7);
                g.fillStyle(COLORS.WHITE);
                g.fillRect(6, 6, 4, 4);
            }

            g.generateTexture('koopa_' + frame, 16, 16);
        }

        g.destroy();

        this.scene.anims.create({
            key: 'koopa_walk',
            frames: [
                { key: 'koopa_0' },
                { key: 'koopa_1' }
            ],
            frameRate: 4,
            repeat: -1
        });
    }

    // -- Coin (4 frames rotation) --
    generateCoin() {
        const g = this.scene.make.graphics({ add: false });
        const widths = [8, 6, 2, 6];

        for (let f = 0; f < 4; f++) {
            g.clear();
            const w = widths[f];
            const offX = (16 - w) / 2;

            g.fillStyle(COLORS.COIN_GOLD);
            g.fillRect(offX, 2, w, 12);
            if (w > 2) {
                g.fillStyle(COLORS.COIN_DARK);
                g.fillRect(offX + 1, 4, w - 2, 8);
                g.fillStyle(COLORS.COIN_GOLD);
                g.fillRect(offX + 2, 5, Math.max(w - 4, 1), 6);
            }

            g.generateTexture('coin_' + f, 16, 16);
        }

        g.destroy();

        this.scene.anims.create({
            key: 'coin_spin',
            frames: [
                { key: 'coin_0' },
                { key: 'coin_1' },
                { key: 'coin_2' },
                { key: 'coin_3' }
            ],
            frameRate: 6,
            repeat: -1
        });
    }

    // -- Flag --
    generateFlag() {
        const g = this.scene.make.graphics({ add: false });

        // Pole
        g.clear();
        g.fillStyle(COLORS.FLAG_POLE);
        g.fillRect(7, 0, 2, 16);
        g.generateTexture('flag_pole', 16, 16);

        // Pole top (ball)
        g.clear();
        g.fillStyle(COLORS.FLAG_POLE);
        g.fillRect(7, 4, 2, 12);
        g.fillStyle(COLORS.COIN_GOLD);
        g.fillRect(5, 0, 6, 5);
        g.fillRect(6, 0, 4, 6);
        g.generateTexture('flag_top', 16, 16);

        // Flag banner
        g.clear();
        g.fillStyle(COLORS.FLAG_GREEN);
        g.fillRect(0, 0, 8, 8);
        g.fillStyle(0x005800);
        g.fillRect(0, 0, 8, 1);
        g.fillRect(0, 0, 1, 8);
        g.generateTexture('flag_banner', 8, 8);

        g.destroy();
    }

    // -- Piranha Plant (2 frames: mouth open/closed) --
    generatePiranhaPlant() {
        const g = this.scene.make.graphics({ add: false });

        for (let f = 0; f < 2; f++) {
            g.clear();

            // Head (mouth)
            if (f === 0) {
                // Mouth open
                g.fillStyle(COLORS.PIRANHA_RED);
                g.fillRect(1, 0, 14, 6);
                g.fillStyle(COLORS.PIRANHA_DARK);
                g.fillRect(2, 4, 12, 2);
                // Teeth (white dots on top and bottom lips)
                g.fillStyle(COLORS.PIRANHA_SPOT);
                g.fillRect(3, 1, 2, 1);
                g.fillRect(7, 1, 2, 1);
                g.fillRect(11, 1, 2, 1);
                g.fillRect(4, 5, 2, 1);
                g.fillRect(8, 5, 2, 1);
            } else {
                // Mouth closed
                g.fillStyle(COLORS.PIRANHA_RED);
                g.fillRect(1, 1, 14, 5);
                g.fillStyle(COLORS.PIRANHA_DARK);
                g.fillRect(2, 3, 12, 1);
                g.fillStyle(COLORS.PIRANHA_SPOT);
                g.fillRect(3, 2, 2, 1);
                g.fillRect(7, 2, 2, 1);
                g.fillRect(11, 2, 2, 1);
            }

            // Stem
            g.fillStyle(COLORS.PIRANHA_GREEN);
            g.fillRect(5, 6, 6, 10);
            g.fillStyle(0x005800);
            g.fillRect(5, 6, 1, 10);
            g.fillRect(10, 6, 1, 10);

            // Spots on stem
            g.fillStyle(0x50d848);
            g.fillRect(7, 8, 2, 2);
            g.fillRect(7, 12, 2, 2);

            g.generateTexture('piranha_' + f, 16, 16);
        }

        g.destroy();

        this.scene.anims.create({
            key: 'piranha_chomp',
            frames: [
                { key: 'piranha_0' },
                { key: 'piranha_1' }
            ],
            frameRate: 3,
            repeat: -1
        });
    }

    // -- Mushrooms (red = fire, blue = low gravity) --
    generateMushrooms() {
        const g = this.scene.make.graphics({ add: false });

        const types = [
            { key: 'mushroom_red', cap: COLORS.MUSHROOM_RED, dark: COLORS.MUSHROOM_RED_DARK, spot: COLORS.MUSHROOM_RED_SPOT },
            { key: 'mushroom_blue', cap: COLORS.MUSHROOM_BLUE, dark: COLORS.MUSHROOM_BLUE_DARK, spot: COLORS.MUSHROOM_BLUE_SPOT }
        ];

        types.forEach(t => {
            g.clear();

            // Cap
            g.fillStyle(t.cap);
            g.fillRect(2, 0, 12, 8);
            g.fillRect(1, 2, 14, 6);
            g.fillRect(0, 4, 16, 4);

            // Dark underside of cap
            g.fillStyle(t.dark);
            g.fillRect(1, 7, 14, 1);

            // Spots
            g.fillStyle(t.spot);
            g.fillRect(3, 1, 3, 3);
            g.fillRect(10, 1, 3, 3);
            g.fillRect(6, 3, 4, 2);

            // Stem
            g.fillStyle(COLORS.MUSHROOM_STEM);
            g.fillRect(4, 8, 8, 6);
            g.fillRect(3, 9, 10, 4);

            // Stem shadow
            g.fillStyle(COLORS.MUSHROOM_STEM_DARK);
            g.fillRect(4, 13, 8, 1);
            g.fillRect(3, 12, 1, 1);
            g.fillRect(12, 12, 1, 1);

            // Eyes
            g.fillStyle(COLORS.BLACK);
            g.fillRect(5, 9, 2, 2);
            g.fillRect(9, 9, 2, 2);

            g.generateTexture(t.key, 16, 16);
        });

        g.destroy();
    }

    // -- Decorations --
    generateDecorations() {
        const g = this.scene.make.graphics({ add: false });

        // Cloud (48x16)
        g.clear();
        g.fillStyle(COLORS.CLOUD_WHITE);
        g.fillRect(8, 4, 32, 8);
        g.fillRect(4, 6, 40, 6);
        g.fillRect(12, 2, 8, 4);
        g.fillRect(28, 2, 8, 4);
        g.fillStyle(COLORS.CLOUD_LIGHT);
        g.fillRect(4, 10, 40, 4);
        g.fillRect(12, 2, 2, 2);
        g.fillRect(28, 2, 2, 2);
        g.generateTexture('cloud', 48, 16);

        // Bush (32x16)
        g.clear();
        g.fillStyle(COLORS.BUSH_GREEN);
        g.fillRect(4, 4, 24, 12);
        g.fillRect(8, 2, 16, 14);
        g.fillStyle(COLORS.BUSH_DARK);
        g.fillRect(4, 12, 24, 4);
        g.fillRect(8, 14, 16, 2);
        g.generateTexture('bush', 32, 16);

        // Hill (48x32)
        g.clear();
        g.fillStyle(COLORS.HILL_GREEN);
        g.fillRect(8, 16, 32, 16);
        g.fillRect(4, 20, 40, 12);
        g.fillRect(0, 24, 48, 8);
        g.fillRect(16, 8, 16, 8);
        g.fillRect(12, 12, 24, 4);
        g.fillStyle(COLORS.HILL_DARK);
        g.fillRect(20, 8, 8, 2);
        g.fillRect(22, 6, 4, 2);
        g.generateTexture('hill', 48, 32);

        g.destroy();
    }

    // -- Castle --
    generateCastle() {
        const g = this.scene.make.graphics({ add: false });
        g.clear();

        // Main body
        g.fillStyle(COLORS.CASTLE_GREY);
        g.fillRect(0, 16, 48, 32);

        // Battlements
        for (let i = 0; i < 6; i++) {
            g.fillRect(i * 8, 12, 6, 4);
        }

        // Tower
        g.fillRect(16, 4, 16, 12);
        g.fillRect(18, 0, 12, 4);

        // Window
        g.fillStyle(COLORS.BLACK);
        g.fillRect(20, 24, 8, 12);
        g.fillRect(22, 20, 4, 4);

        // Door arch
        g.fillStyle(COLORS.CASTLE_DARK);
        g.fillRect(20, 22, 8, 2);

        // Details
        g.fillStyle(COLORS.CASTLE_DARK);
        g.fillRect(22, 6, 4, 4);

        g.generateTexture('castle', 48, 48);
        g.destroy();
    }
}
