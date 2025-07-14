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
            width: 120,
            height: 60
        };
        // Animation states
        this.isHit = false;
        this.hitRecoveryTime = 0;
        this.punchProgress = 0;
        this.isMoving = false;
        this.animationFrame = 0;
    }

    drawStickman(ctx) {
        const headRadius = 25;
        const bodyLength = 70;
        const limbLength = 50;
        
        const centerX = this.position.x + this.width / 2;
        const headY = this.position.y + headRadius + 20;
        
        // Apply hit effect shake
        let drawX = centerX;
        let drawY = headY;
        if (this.isHit) {
            drawX += Math.random() * 6 - 3;
            drawY += Math.random() * 6 - 3;
        }

        // Fighting stance adjustment
        const stanceOffset = this.isMoving ? Math.sin(this.animationFrame * 0.1) * 5 : 0;
        const kneesBent = this.isMoving ? Math.abs(Math.sin(this.animationFrame * 0.1)) * 10 : 0;

        // Draw filled head with white outline
        ctx.beginPath();
        ctx.arc(drawX, drawY, headRadius, 0, Math.PI * 2);
        ctx.fillStyle = this.isHit ? '#ffffff' : this.color; // Flash white when hit
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 4;
        ctx.stroke();
        
        // Draw body with fighting stance
        ctx.strokeStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(drawX, drawY + headRadius);
        ctx.lineTo(drawX + (this.facing === 'right' ? 5 : -5), drawY + headRadius + bodyLength);
        ctx.stroke();
        
        // Draw legs with animation
        const hipY = drawY + headRadius + bodyLength;
        
        // Animate legs while moving
        const leftLegAngle = this.isMoving ? 
            Math.sin(this.animationFrame * 0.1) * 0.3 : 
            (this.facing === 'right' ? -0.2 : 0.2);
        const rightLegAngle = this.isMoving ? 
            -Math.sin(this.animationFrame * 0.1) * 0.3 : 
            (this.facing === 'right' ? 0.2 : -0.2);

        // Left leg
        ctx.beginPath();
        ctx.moveTo(drawX, hipY);
        ctx.lineTo(
            drawX + Math.sin(leftLegAngle) * limbLength,
            hipY + Math.cos(leftLegAngle) * limbLength + kneesBent
        );
        ctx.stroke();
        
        // Right leg
        ctx.beginPath();
        ctx.moveTo(drawX, hipY);
        ctx.lineTo(
            drawX + Math.sin(rightLegAngle) * limbLength,
            hipY + Math.cos(rightLegAngle) * limbLength + kneesBent
        );
        ctx.stroke();
        
        // Draw arms with punch animation
        const shoulderY = drawY + headRadius + 20;
        
        if (this.isAttacking) {
            const punchExtension = Math.sin(this.punchProgress * Math.PI) * 40;
            
            if (this.facing === 'right') {
                // Back arm (left)
                ctx.beginPath();
                ctx.moveTo(drawX, shoulderY);
                ctx.lineTo(drawX - 30, shoulderY + 30);
                ctx.stroke();
                
                // Punching arm (right)
                ctx.beginPath();
                ctx.moveTo(drawX, shoulderY);
                const controlPoint1X = drawX + 30;
                const controlPoint1Y = shoulderY - 10;
                const controlPoint2X = drawX + 45;
                const controlPoint2Y = shoulderY;
                const endX = drawX + 60 + punchExtension;
                const endY = shoulderY;
                
                ctx.moveTo(drawX, shoulderY);
                ctx.bezierCurveTo(controlPoint1X, controlPoint1Y, controlPoint2X, controlPoint2Y, endX, endY);
                ctx.stroke();
                
                // Draw fist
                ctx.beginPath();
                ctx.arc(endX, endY, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            } else {
                // Back arm (right)
                ctx.beginPath();
                ctx.moveTo(drawX, shoulderY);
                ctx.lineTo(drawX + 30, shoulderY + 30);
                ctx.stroke();
                
                // Punching arm (left)
                ctx.beginPath();
                const controlPoint1X = drawX - 30;
                const controlPoint1Y = shoulderY - 10;
                const controlPoint2X = drawX - 45;
                const controlPoint2Y = shoulderY;
                const endX = drawX - (60 + punchExtension);
                const endY = shoulderY;
                
                ctx.moveTo(drawX, shoulderY);
                ctx.bezierCurveTo(controlPoint1X, controlPoint1Y, controlPoint2X, controlPoint2Y, endX, endY);
                ctx.stroke();
                
                // Draw fist
                ctx.beginPath();
                ctx.arc(endX, endY, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            }
        } else {
            // Normal fighting stance arms
            const armAngle = Math.PI / 6; // 30 degrees
            const forearmLength = 35;
            
            if (this.facing === 'right') {
                // Back arm
                ctx.beginPath();
                ctx.moveTo(drawX, shoulderY);
                ctx.lineTo(drawX - 20, shoulderY + 25);
                ctx.stroke();
                
                // Front arm
                ctx.beginPath();
                ctx.moveTo(drawX, shoulderY);
                ctx.lineTo(drawX + Math.cos(armAngle) * forearmLength, 
                          shoulderY - Math.sin(armAngle) * forearmLength);
                ctx.stroke();
            } else {
                // Back arm
                ctx.beginPath();
                ctx.moveTo(drawX, shoulderY);
                ctx.lineTo(drawX + 20, shoulderY + 25);
                ctx.stroke();
                
                // Front arm
                ctx.beginPath();
                ctx.moveTo(drawX, shoulderY);
                ctx.lineTo(drawX - Math.cos(armAngle) * forearmLength, 
                          shoulderY - Math.sin(armAngle) * forearmLength);
                ctx.stroke();
            }
        }

        // Draw hit effect
        if (this.isHit) {
            ctx.beginPath();
            ctx.arc(drawX, drawY, headRadius + 20, 0, Math.PI * 2);
            ctx.strokeStyle = 'yellow';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }

    draw(ctx) {
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
        // Update animation frame
        this.animationFrame++;
        
        // Update punch animation
        if (this.isAttacking) {
            this.punchProgress = Math.min(1, this.punchProgress + 0.2);
        } else {
            this.punchProgress = Math.max(0, this.punchProgress - 0.2);
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
        const prevY = this.position.y;

        // Update position
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        // Set moving state
        this.isMoving = this.velocity.x !== 0;

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
            }, 300); // Increased duration for smoother animation

            // Attack cooldown
            setTimeout(() => {
                this.attackCooldown = false;
            }, 500);
        }
    }

    takeHit() {
        this.health -= 20;
        if (this.health < 0) this.health = 0;
        this.isHit = true;
        this.hitRecoveryTime = 0;
    }
} 