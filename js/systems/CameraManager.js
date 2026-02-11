class CameraManager {
    constructor(scene, player1, player2, mapWidth) {
        this.scene = scene;
        this.player1 = player1;
        this.player2 = player2;

        // Invisible focus point
        this.focusPoint = scene.add.rectangle(0, 0, 1, 1, 0x000000, 0);

        const cam = scene.cameras.main;
        cam.setZoom(ZOOM);
        cam.setBounds(0, 0, mapWidth, LEVEL_ROWS * TILE);
        cam.startFollow(this.focusPoint, true, 0.1, 0.1);
        cam.setDeadzone(10, 10);

        // Offset camera so players are shown lower in the viewport
        cam.setFollowOffset(0, 40);
    }

    update() {
        const p1Alive = this.player1.alive;
        const p2Alive = this.player2.alive;

        let tx, ty;

        if (p1Alive && p2Alive) {
            tx = (this.player1.x + this.player2.x) / 2;
            ty = (this.player1.y + this.player2.y) / 2;
        } else if (p1Alive) {
            tx = this.player1.x;
            ty = this.player1.y;
        } else if (p2Alive) {
            tx = this.player2.x;
            ty = this.player2.y;
        } else {
            return;
        }

        this.focusPoint.x = tx;
        this.focusPoint.y = ty;
    }
}
