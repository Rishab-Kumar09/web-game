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
            width: 100,
            height: 50
        };
        // Animation states
        this.isHit = false;
        this.hitRecoveryTime = 0;
        this.punchProgress = 0;
        this.isMoving = false;
        this.animationFrame = 0;
    }

    drawStickman(ctx) {
        // Base dimensions
        const headRadius = 20;
        const bodyLength = 50;
        const limbLength = 40;
        
        // Calculate center position
        const centerX = this.position.x + this.width / 2;
        const baseY = this.position.y + this.height - 20; // Anchor to feet
        
        // Calculate all body part positions from bottom up
        const feetY = baseY;
        const hipY = feetY - limbLength;
        const shoulderY = hipY - bodyLength;
        const headY = shoulderY - headRadius;
        
        // Apply movement animation
        const bounceOffset = this.isMoving ? Math.abs(Math.sin(this.animationFrame * 0.1)) * 3 : 0;
        
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 6; // Thicker lines for better visibility
        
        // Draw legs with walking animation
        const legSwing = this.isMoving ? Math.sin(this.animationFrame * 0.1) * 0.3 : 0;
        
        // Left leg
        ctx.beginPath();
        ctx.moveTo(centerX, hipY);
        ctx.lineTo(
            centerX + Math.sin(legSwing - 0.2) * limbLength,
            feetY
        );
        ctx.stroke();
        
        // Right leg
        ctx.beginPath();
        ctx.moveTo(centerX, hipY);
        ctx.lineTo(
            centerX + Math.sin(legSwing + Math.PI) * limbLength,
            feetY
        );
        ctx.stroke();
        
        // Draw body
        ctx.beginPath();
        ctx.moveTo(centerX, shoulderY);
        ctx.lineTo(centerX, hipY);
        ctx.stroke();
        
        // Draw head with fill
        ctx.beginPath();
        ctx.arc(centerX, headY, headRadius, 0, Math.PI * 2);
        ctx.fillStyle = this.isHit ? '#ffffff' : this.color;
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Reset stroke style for arms
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 6;
        
        // Draw arms with animation
        if (this.isAttacking) {
            // Punching animation
            const punchPhase = Math.sin(this.punchProgress * Math.PI);
            
            if (this.facing === 'right') {
                // Back arm
                ctx.beginPath();
                ctx.moveTo(centerX, shoulderY);
                ctx.lineTo(centerX - 20, shoulderY + 20);
                ctx.stroke();
                
                // Punching arm
                ctx.beginPath();
                ctx.moveTo(centerX, shoulderY);
                ctx.lineTo(centerX + 20 + punchPhase * 40, shoulderY);
                ctx.stroke();
            } else {
                // Back arm
                ctx.beginPath();
                ctx.moveTo(centerX, shoulderY);
                ctx.lineTo(centerX + 20, shoulderY + 20);
                ctx.stroke();
                
                // Punching arm
                ctx.beginPath();
                ctx.moveTo(centerX, shoulderY);
                ctx.lineTo(centerX - (20 + punchPhase * 40), shoulderY);
                ctx.stroke();
            }
        } else {
            // Regular fighting stance
            const armSwing = this.isMoving ? Math.sin(this.animationFrame * 0.1) * 0.2 : 0;
            
            // Left arm
            ctx.beginPath();
            ctx.moveTo(centerX, shoulderY);
            ctx.lineTo(
                centerX + Math.sin(armSwing - Math.PI/6) * limbLength * 0.8,
                shoulderY + Math.cos(armSwing - Math.PI/6) * limbLength * 0.8
            );
            ctx.stroke();
            
            // Right arm
            ctx.beginPath();
            ctx.moveTo(centerX, shoulderY);
            ctx.lineTo(
                centerX + Math.sin(armSwing + Math.PI + Math.PI/6) * limbLength * 0.8,
                shoulderY + Math.cos(armSwing + Math.PI + Math.PI/6) * limbLength * 0.8
            );
            ctx.stroke();
        }

        // Draw hit effect
        if (this.isHit) {
            ctx.beginPath();
            ctx.arc(centerX, headY, headRadius + 10, 0, Math.PI * 2);
            ctx.strokeStyle = 'yellow';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }

    draw(ctx) {
        this.drawStickman(ctx);
        
        // Draw attack indicator when attacking
        if (this.isAttacking) {
            const attackX = this.facing === 'right' 
                ? this.position.x + this.width 
                : this.position.x - this.attackBox.width;
            
            ctx.fillStyle = 'rgba(255, 255, 0, 0.2)';
            ctx.fillRect(
                attackX,
                this.position.y + this.height * 0.3,
                this.attackBox.width,
                this.attackBox.height
            );
        }
    }

    update(ctx, opponent) {
        // Update animation frame
        this.animationFrame++;
        
        // Update punch animation
        if (this.isAttacking) {
            this.punchProgress = Math.min(1, this.punchProgress + 0.15); // Slower punch
        } else {
            this.punchProgress = Math.max(0, this.punchProgress - 0.15); // Slower retraction
        }

        // Update hit state
        if (this.isHit) {
            this.hitRecoveryTime++;
            if (this.hitRecoveryTime > 10) {
                this.isHit = false;
                this.hitRecoveryTime = 0;
            }
        }

        this.draw(ctx);

        // Store previous position for collision resolution
        const prevX = this.position.x;
        
        // Update position
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        // Set moving state
        this.isMoving = Math.abs(this.velocity.x) > 0;

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
            this.punchProgress = 0;
            
            // Attack duration
            setTimeout(() => {
                this.isAttacking = false;
            }, 400); // Longer attack duration

            // Attack cooldown
            setTimeout(() => {
                this.attackCooldown = false;
            }, 600); // Slightly longer cooldown
        }
    }

    takeHit() {
        this.health -= 20;
        if (this.health < 0) this.health = 0;
        this.isHit = true;
        this.hitRecoveryTime = 0;
    }
} 