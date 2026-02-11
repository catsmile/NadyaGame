class LevelData {
    static getLevel1() {
        const E = TILES.EMPTY;
        const G = TILES.GROUND;
        const T = TILES.GROUND_TOP;
        const B = TILES.BRICK;
        const Q = TILES.QUESTION;
        const PT = TILES.PIPE_TL;
        const PR = TILES.PIPE_TR;
        const PB = TILES.PIPE_BL;
        const PD = TILES.PIPE_BR;

        // 14 rows x 210 cols
        const data = [];
        for (let r = 0; r < LEVEL_ROWS; r++) {
            data[r] = new Array(LEVEL_COLS).fill(E);
        }

        // Helper: fill ground from row 12-13 (bottom two rows)
        function ground(startCol, endCol) {
            for (let c = startCol; c <= endCol; c++) {
                data[12][c] = T;
                data[13][c] = G;
            }
        }

        // Helper: place a pipe (2 tiles wide, height tiles tall, bottom at row 11)
        function pipe(col, height) {
            const topRow = 12 - height;
            data[topRow][col] = PT;
            data[topRow][col + 1] = PR;
            for (let r = topRow + 1; r < 12; r++) {
                data[r][col] = PB;
                data[r][col + 1] = PD;
            }
        }

        // Helper: horizontal brick row
        function brickRow(row, startCol, endCol) {
            for (let c = startCol; c <= endCol; c++) {
                data[row][c] = B;
            }
        }

        // Helper: question block
        function question(row, col) {
            data[row][col] = Q;
        }

        // ===== SECTION 0-15: Flat ground, intro =====
        ground(0, 15);

        // ===== SECTION 16-25: First ?-blocks and bricks, Goomba =====
        ground(16, 25);
        question(8, 16);
        brickRow(8, 18, 19);
        question(8, 20);
        brickRow(8, 21, 22);
        question(8, 23);

        // ===== SECTION 26-35: Pipes, steps =====
        ground(26, 48);
        pipe(28, 2);
        pipe(32, 3);
        pipe(36, 4);

        // Steps
        data[11][40] = B;
        data[10][41] = B;
        data[11][41] = B;

        // ===== SECTION 36-48: Multiple Goomba, first pit =====
        // Clear pit at 43-44 (was filled by ground(26,48) above)
        for (let c = 43; c <= 44; c++) {
            data[12][c] = E;
            data[13][c] = E;
        }

        // ===== SECTION 49-70: Platform with coins on top, Koopa =====
        ground(45, 70);
        // Floating platform with coins area
        brickRow(6, 52, 58);
        question(6, 54);
        question(6, 56);
        // Lower blocks
        question(9, 50);
        brickRow(9, 60, 63);
        question(9, 61);

        // ===== SECTION 71-90: Series of small platforms over pit =====
        ground(71, 73);
        // Big gap 74-80
        brickRow(9, 75, 76);
        brickRow(9, 78, 79);
        brickRow(8, 81, 82);
        ground(83, 90);
        // Some blocks in this section
        question(6, 84);
        brickRow(6, 85, 87);
        question(6, 88);

        // ===== SECTION 91-120: Pyramid of blocks, ?-blocks =====
        ground(91, 120);

        // Pyramid (step structure)
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j <= i; j++) {
                data[11 - j][95 + i] = B;
            }
        }
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j <= i; j++) {
                data[11 - j][102 - i] = B;
            }
        }

        // ? blocks between pyramids
        question(7, 98);
        question(7, 99);

        // More blocks
        brickRow(8, 105, 110);
        question(8, 106);
        question(8, 108);

        // Pipes
        pipe(113, 2);
        pipe(117, 3);

        // ===== SECTION 121-150: More enemies, coin arch =====
        ground(121, 150);

        // Coin arch (? blocks in arch shape)
        question(9, 125);
        question(8, 126);
        question(7, 127);
        question(7, 128);
        question(7, 129);
        question(8, 130);
        question(9, 131);

        // Bricks
        brickRow(8, 135, 140);
        question(8, 137);

        // Steps
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j <= i; j++) {
                data[11 - j][145 + i] = B;
            }
        }

        // ===== SECTION 151-180: Final challenge: platforms + Goomba =====
        ground(151, 155);
        // Gap
        ground(158, 162);
        brickRow(9, 156, 157);
        // More ground
        ground(163, 180);

        // Elevated platforms
        brickRow(6, 165, 170);
        question(6, 167);
        question(6, 169);

        // Pipe
        pipe(175, 3);

        brickRow(9, 172, 173);

        // ===== SECTION 181-210: Staircase to flag, castle =====
        ground(181, 210);

        // Grand staircase
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j <= i; j++) {
                data[11 - j][190 + i] = B;
            }
        }

        // Flag at column 200, castle starts at 203
        // (Flag placed programmatically in GameScene)

        return data;
    }

    static getEnemies() {
        return [
            // Section 16-25: intro goombas
            { type: 'goomba', col: 20, row: 11 },
            { type: 'goomba', col: 23, row: 11 },

            // Section 36-48
            { type: 'goomba', col: 38, row: 11 },
            { type: 'goomba', col: 40, row: 11 },
            { type: 'goomba', col: 42, row: 11 },

            // Section 49-70
            { type: 'koopa', col: 55, row: 11 },
            { type: 'goomba', col: 65, row: 11 },
            { type: 'goomba', col: 67, row: 11 },

            // Section 91-120
            { type: 'goomba', col: 93, row: 11 },
            { type: 'koopa', col: 103, row: 11 },
            { type: 'goomba', col: 110, row: 11 },
            { type: 'goomba', col: 112, row: 11 },

            // Section 121-150
            { type: 'goomba', col: 123, row: 11 },
            { type: 'goomba', col: 133, row: 11 },
            { type: 'koopa', col: 142, row: 11 },
            { type: 'goomba', col: 148, row: 11 },

            // Section 151-180
            { type: 'goomba', col: 153, row: 11 },
            { type: 'goomba', col: 160, row: 11 },
            { type: 'koopa', col: 168, row: 5 },
            { type: 'goomba', col: 177, row: 11 },
            { type: 'goomba', col: 179, row: 11 },

            // Section 181-210
            { type: 'goomba', col: 185, row: 11 },
            { type: 'goomba', col: 187, row: 11 }
        ];
    }

    static getCoins() {
        return [
            // Section 16-25: above ? blocks
            { col: 19, row: 7 },

            // Section 49-70: coin row on platform
            { col: 53, row: 5 },
            { col: 54, row: 5 },
            { col: 55, row: 5 },
            { col: 56, row: 5 },
            { col: 57, row: 5 },

            // Section 71-90: reward for platforming
            { col: 75, row: 8 },
            { col: 76, row: 8 },
            { col: 78, row: 8 },
            { col: 79, row: 8 },
            { col: 81, row: 7 },
            { col: 82, row: 7 },

            // Section 91-120: between pyramids
            { col: 98, row: 6 },
            { col: 99, row: 6 },
            { col: 107, row: 7 },

            // Section 121-150: scattered
            { col: 136, row: 7 },
            { col: 137, row: 7 },
            { col: 138, row: 7 },
            { col: 139, row: 7 },

            // Section 151-180
            { col: 166, row: 5 },
            { col: 167, row: 5 },
            { col: 168, row: 5 },
            { col: 169, row: 5 },
            { col: 170, row: 5 },

            // Section 181-210: approach
            { col: 183, row: 11 },
            { col: 184, row: 11 },
            { col: 185, row: 10 },
            { col: 186, row: 10 }
        ];
    }

    static getPiranhaPlants() {
        // col = left column of pipe, topRow = row of the pipe top
        // Pipes: pipe(28,2)→top=10, pipe(32,3)→top=9, pipe(36,4)→top=8
        // pipe(113,2)→top=10, pipe(117,3)→top=9, pipe(175,3)→top=9
        return [
            { col: 32, topRow: 9 },
            { col: 36, topRow: 8 },
            { col: 113, topRow: 10 },
            { col: 117, topRow: 9 },
            { col: 175, topRow: 9 }
        ];
    }

    static getDecorations() {
        return [
            { type: 'cloud', col: 8, row: 2 },
            { type: 'cloud', col: 28, row: 1 },
            { type: 'cloud', col: 55, row: 2 },
            { type: 'cloud', col: 80, row: 1 },
            { type: 'cloud', col: 105, row: 2 },
            { type: 'cloud', col: 130, row: 1 },
            { type: 'cloud', col: 160, row: 2 },
            { type: 'cloud', col: 190, row: 1 },

            { type: 'bush', col: 5, row: 11 },
            { type: 'bush', col: 48, row: 11 },
            { type: 'bush', col: 100, row: 11 },
            { type: 'bush', col: 155, row: 11 },

            { type: 'hill', col: 0, row: 10 },
            { type: 'hill', col: 60, row: 10 },
            { type: 'hill', col: 120, row: 10 },
            { type: 'hill', col: 180, row: 10 }
        ];
    }
}
