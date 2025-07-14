const GAME_CONFIG = {
    canvas: {
        width: 1024,
        height: 576
    },
    fighter: {
        width: 80,      // Adjusted for better proportions
        height: 160,    // Adjusted for better proportions
        speed: 6,       // Slightly reduced for better control
        jumpForce: -18, // Adjusted jump height
        gravity: 0.7,
        maxHealth: 100,
        sword: {
            length: 60,         // Length of the sword blade
            gripLength: 15,     // Length of the sword grip
            width: 4,          // Width of the sword blade
            swingSpeed: 0.1,   // Speed of sword swing animation
            damage: 25,        // Damage dealt by sword hits
            reach: 70,         // Maximum reach of the sword attack
            guardAngle: 0.6,   // Angle in radians for blocking stance (~35 degrees)
            combat: {
                parryWindow: 0.15,      // Time window for successful parry (seconds)
                parryStunDuration: 0.8, // How long attacker is stunned after being parried
                blockStability: 0.7,    // Base block effectiveness (0-1)
                guardBreakThreshold: 3, // Hits needed to break guard
                counterDamageBonus: 1.5,// Damage multiplier for counter-attacks
                staminaCost: {
                    attack: 20,         // Basic attack stamina cost
                    block: 15,          // Block stamina cost
                    parry: 25,          // Parry attempt stamina cost
                    dodge: 30           // Dodge stamina cost
                },
                attackTypes: {
                    light: {
                        damage: 0.8,    // Damage multiplier
                        speed: 1.3,     // Speed multiplier
                        stamina: 0.7    // Stamina cost multiplier
                    },
                    heavy: {
                        damage: 1.4,    // Damage multiplier
                        speed: 0.7,     // Speed multiplier
                        stamina: 1.5    // Stamina cost multiplier
                    },
                    thrust: {
                        damage: 1.1,    // Damage multiplier
                        speed: 1.1,     // Speed multiplier
                        stamina: 1.2    // Stamina cost multiplier
                    }
                }
            },
            stances: {
                high: {
                    angle: -Math.PI/4,     // Sword held high, angled down
                    handOffset: 30,        // Higher hand position
                    transitionSpeed: 0.15  // Speed of stance transition
                },
                middle: {
                    angle: Math.PI/6,      // Sword held at middle, slightly up
                    handOffset: 25,        // Default hand position
                    transitionSpeed: 0.2   // Speed of stance transition
                },
                low: {
                    angle: Math.PI/2,      // Sword held low, angled up
                    handOffset: 20,        // Lower hand position
                    transitionSpeed: 0.15  // Speed of stance transition
                },
                defensive: {
                    angle: -Math.PI/3,     // Sword held defensively
                    handOffset: 28,        // Slightly raised hand position
                    transitionSpeed: 0.25  // Speed of stance transition
                }
            }
        },
        controls: {
            player1: {
                left: 'KeyA',
                right: 'KeyD',
                jump: 'KeyW',
                attack: 'Space',
                stance: 'ShiftLeft',    // Hold to change stance
                block: 'KeyS',          // Hold to block
                lightAttack: 'KeyE',    // Light attack
                heavyAttack: 'KeyR',    // Heavy attack
                thrust: 'KeyF'          // Thrust attack
            },
            player2: {
                left: 'ArrowLeft',
                right: 'ArrowRight',
                jump: 'ArrowUp',
                attack: 'ShiftRight',
                stance: 'ControlRight', // Hold to change stance
                block: 'ArrowDown',     // Hold to block
                lightAttack: 'KeyI',    // Light attack
                heavyAttack: 'KeyO',    // Heavy attack
                thrust: 'KeyP'          // Thrust attack
            }
        }
    }
}; 