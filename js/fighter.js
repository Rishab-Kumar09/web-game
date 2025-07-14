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
        this.lastDirection = facing;
        this.attackBox = {
            position: {
                x: this.position.x,
                y: this.position.y
            },
            width: 80,
            height: 50
        };
    }

    drawStickman(ctx) {
        const headRadius = 15;
        const bodyLength = 40;
        const limbLength = 30;
        
        // Calculate center position for the stickman
        const centerX = this.position.x + this.width / 2;
        const headY = this.position.y + headRadius;
        
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 4;
        
        // Draw head
        ctx.beginPath();
        ctx.arc(centerX, headY, headRadius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw body
        ctx.beginPath();
        ctx.moveTo(centerX, headY + headRadius);
        ctx.lineTo(centerX, headY + headRadius + bodyLength);
        ctx.stroke();
        
        // Draw legs
        const hipY = headY + headRadius + bodyLength;
        // Left leg with animation
        ctx.beginPath();
        ctx.moveTo(centerX, hipY);
        ctx.lineTo(centerX - 15, hipY + limbLength);
        ctx.stroke();
        
        // Right leg with animation
        ctx.beginPath();
        ctx.moveTo(centerX, hipY);
        ctx.lineTo(centerX + 15, hipY + limbLength);
        ctx.stroke();
        
        // Draw arms
        const shoulderY = headY + headRadius + 15;
        
        // Attack animation for arms
        if (this.isAttacking) {
            // Extended punching arm based on facing direction
            if (this.facing === 'right') {
                // Left arm normal
                ctx.beginPath();
                ctx.moveTo(centerX, shoulderY);
                ctx.lineTo(centerX - 20, shoulderY + 20);
                ctx.stroke();
                
                // Right arm attacking
                ctx.beginPath();
                ctx.moveTo(centerX, shoulderY);
                ctx.lineTo(centerX + 40, shoulderY);
                ctx.stroke();
            } else {
                // Right arm normal
                ctx.beginPath();
                ctx.moveTo(centerX, shoulderY);
                ctx.lineTo(centerX + 20, shoulderY + 20);
                ctx.stroke();
                
                // Left arm attacking
                ctx.beginPath();
                ctx.moveTo(centerX, shoulderY);
                ctx.lineTo(centerX - 40, shoulderY);
                ctx.stroke();
            }
        } else {
            // Normal arm position
            ctx.beginPath();
            ctx.moveTo(centerX, shoulderY);
            ctx.lineTo(centerX - 20, shoulderY + 20);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(centerX, shoulderY);
            ctx.lineTo(centerX + 20, shoulderY + 20);
            ctx.stroke();
        }
    }

    draw(ctx) {
        // Draw stickman
        this.drawStickman(ctx);
        
        // Draw attack box when attacking
        if (this.isAttacking) {
            ctx.fillStyle = 'rgba(255, 255, 0, 0.2)';
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

        // Store previous position for collision resolution
        const prevX = this.position.x;
        const prevY = this.position.y;

        // Update position
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

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

        // Check collision with opponent
        if (opponent && this.checkCollision(opponent)) {
            // Revert to previous position if collision occurs
            this.position.x = prevX;
        }

        // Update attack box position
        this.attackBox.position = {
            x: this.facing === 'right' ? this.position.x + this.width : this.position.x - this.attackBox.width,
            y: this.position.y + this.height * 0.3
        };

        // Update facing direction based on opponent position if not attacking
        if (!this.isAttacking && opponent) {
            this.facing = this.position.x < opponent.position.x ? 'right' : 'left';
        }
    }

    checkCollision(opponent) {
        return (
            this.position.x < opponent.position.x + opponent.width &&
            this.position.x + this.width > opponent.position.x &&
            this.position.y < opponent.position.y + opponent.height &&
            this.position.y + this.height > opponent.position.y
        );
    }

    attack() {
        if (!this.attackCooldown) {
            this.isAttacking = true;
            this.attackCooldown = true;
            
            // Attack duration
            setTimeout(() => {
                this.isAttacking = false;
            }, 200);

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