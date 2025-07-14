const GAME_CONFIG = {
    canvas: {
        width: 1024,
        height: 576
    },
    fighter: {
        width: 50,
        height: 150,
        speed: 5,
        jumpForce: -15,
        gravity: 0.7,
        maxHealth: 100
    },
    controls: {
        player1: {
            left: 'KeyA',
            right: 'KeyD',
            jump: 'KeyW',
            attack: 'Space'
        },
        player2: {
            left: 'ArrowLeft',
            right: 'ArrowRight',
            jump: 'ArrowUp',
            attack: 'ShiftRight'
        }
    }
}; 