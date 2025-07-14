const GAME_CONFIG = {
    canvas: {
        width: 1024,
        height: 576
    },
    fighter: {
        width: 60,      // Adjusted for stickman
        height: 120,    // Adjusted for stickman
        speed: 7,       // Increased for better mobility
        jumpForce: -20, // Increased for higher jumps
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