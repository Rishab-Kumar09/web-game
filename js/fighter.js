class Fighter {
    constructor({ position, velocity, color = 'red', facing = 'right' }) {
        this.position = position;
        this.velocity = velocity;
        this.width = GAME_CONFIG.fighter.width;
        this.height = GAME_CONFIG.fighter.height;
        this.health = GAME_CONFIG.fighter.maxHealth;
        this.color = color;
        this.facing = facing;
        this.isAttacking = false;
        this.attackCooldown = false;
        this.attackBox = {
            position: {
                x: this.position.x,
                y: this.position.y
            },
            width: 100,
            height: 50
        };
    }

    draw(ctx) {
        // Draw fighter body
        ctx.fillStyle = this.color;
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);

        // Draw attack box when attacking
        if (this.isAttacking) {
            ctx.fillStyle = 'yellow';
            const attackX = this.facing === 'right' 
                ? this.position.x + this.width 
                : this.position.x - this.attackBox.width;
            ctx.fillRect(
                attackX,
                this.position.y + this.height * 0.3,
                this.attackBox.width,
                this.attackBox.height
            );
        }
    }

    update(ctx, opponent) {
        this.draw(ctx);

        // Update position
        const nextX = this.position.x + this.velocity.x;
        const nextY = this.position.y + this.velocity.y;

        // Check horizontal collision with opponent
        const wouldCollide = rectangularCollision(
            { 
                x: nextX, 
                y: this.position.y, 
                width: this.width, 
                height: this.height 
            },
            opponent
        );

        // Only update X position if there's no collision
        if (!wouldCollide) {
            this.position.x = nextX;
        }

        this.position.y = nextY;

        // Apply gravity
        if (this.position.y + this.height + this.velocity.y >= GAME_CONFIG.canvas.height) {
            this.velocity.y = 0;
            this.position.y = GAME_CONFIG.canvas.height - this.height;
        } else {
            this.velocity.y += GAME_CONFIG.fighter.gravity;
        }

        // Keep fighter within canvas bounds
        if (this.position.x < 0) this.position.x = 0;
        if (this.position.x + this.width > GAME_CONFIG.canvas.width) {
            this.position.x = GAME_CONFIG.canvas.width - this.width;
        }

        // Update attack box position
        this.attackBox.position = {
            x: this.facing === 'right' ? this.position.x + this.width : this.position.x - this.attackBox.width,
            y: this.position.y + this.height * 0.3
        };
    }

    attack() {
        if (!this.attackCooldown) {
            this.isAttacking = true;
            this.attackCooldown = true;
            
            // Attack duration
            setTimeout(() => {
                this.isAttacking = false;
            }, 100);

            // Attack cooldown
            setTimeout(() => {
                this.attackCooldown = false;
            }, 500);
        }
    }

    takeHit() {
        this.health -= 20;
        if (this.health < 0) this.health = 0;
    }
} 