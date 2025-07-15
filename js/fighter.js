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
            width: GAME_CONFIG.fighter.sword.reach,
            height: 50
        };
        // Animation states
        this.isHit = false;
        this.hitRecoveryTime = 0;
        this.swordAngle = 0;        // Current angle of the sword
        this.targetSwordAngle = 0;  // Target angle for sword animations
        this.isBlocking = false;    // Whether the fighter is in blocking stance
        this.swingProgress = 0;     // Progress of the current sword swing (0 to 1)
        this.swingType = 'horizontal'; // horizontal, vertical, or diagonal
        this.isMoving = false;
        this.animationFrame = 0;
        this.recoveryPhase = false;    // For smooth swing recovery
        this.comboCount = 0;           // For tracking attack combinations
        this.lastAttackTime = 0;       // For combo timing
        this.hitPoints = []; // Store points along sword blade for collision
        this.hitEffects = []; // Store active hit effects
        this.lastHitTime = 0; // For hit cooldown
        this.hitStunned = false; // When hit by opponent
        this.parryWindow = false; // Successful parry window
        this.hitLocation = null; // Store location of last hit for effects
        this.currentStance = 'middle';  // Default stance
        this.targetStance = 'middle';   // Stance we're transitioning to
        this.stanceProgress = 1;        // Progress of stance transition (0-1)
        this.stanceAngle = GAME_CONFIG.fighter.sword.stances.middle.angle;  // Current sword angle
        this.handOffset = GAME_CONFIG.fighter.sword.stances.middle.handOffset;  // Current hand position
        this.isChangingStance = false;  // Whether we're currently changing stance
        this.stanceChangeStartTime = 0; // Time when stance change started
        this.previousStanceAngles = []; // Store previous angles for smooth transitions
        
        // Combat properties
        this.stamina = 100;
        this.maxStamina = 100;
        this.staminaRegenRate = 0.5;
        this.isBlocking = false;
        this.isParrying = false;
        this.guardHealth = GAME_CONFIG.fighter.sword.combat.guardBreakThreshold;
        this.maxGuardHealth = GAME_CONFIG.fighter.sword.combat.guardBreakThreshold;
        this.guardBroken = false;
        this.guardBreakCooldown = false;
        this.attackType = 'normal';
        this.isStunned = false;
        this.counterWindow = false;
        this.lastBlockTime = 0;
        this.perfectBlockWindow = false;
        this.comboMultiplier = 1;
    }

    updateStance(newStance) {
        if (newStance !== this.currentStance && !this.isAttacking) {
            this.targetStance = newStance;
            this.isChangingStance = true;
            this.stanceProgress = 0;
            this.stanceChangeStartTime = Date.now();
            
            // Store current angle for smooth transition
            this.previousStanceAngles = [this.stanceAngle];
        }
    }

    interpolateStanceValues() {
        const currentStanceConfig = GAME_CONFIG.fighter.sword.stances[this.currentStance];
        const targetStanceConfig = GAME_CONFIG.fighter.sword.stances[this.targetStance];
        
        if (this.isChangingStance) {
            // Calculate transition progress with easing
            const transitionSpeed = targetStanceConfig.transitionSpeed;
            this.stanceProgress = Math.min(1, this.stanceProgress + transitionSpeed);
            
            // Apply easing function for smooth transition
            const ease = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            const progress = ease(this.stanceProgress);
            
            // Interpolate between stances
            this.stanceAngle = this.previousStanceAngles[0] + 
                (targetStanceConfig.angle - this.previousStanceAngles[0]) * progress;
            
            this.handOffset = currentStanceConfig.handOffset + 
                (targetStanceConfig.handOffset - currentStanceConfig.handOffset) * progress;
            
            // Check if transition is complete
            if (this.stanceProgress >= 1) {
                this.currentStance = this.targetStance;
                this.isChangingStance = false;
                this.stanceProgress = 1;
            }
        } else {
            // Apply subtle movement to current stance
            const stanceWave = Math.sin(this.animationFrame * 0.03) * 0.1;
            this.stanceAngle = targetStanceConfig.angle + stanceWave;
            this.handOffset = targetStanceConfig.handOffset;
        }
    }

    drawSword(ctx, centerX, shoulderY) {
        const swordConfig = GAME_CONFIG.fighter.sword;
        
        // Update stance interpolation
        this.interpolateStanceValues();
        
        // Calculate base hand position with current stance offset
        let handX = centerX;
        let handY = shoulderY - this.handOffset;
        
        if (this.isAttacking) {
            // Different swing animations based on stance and type
            let swingAngle;
            const progress = this.recoveryPhase ? 
                1 - (1 - this.swingProgress) * (1 - this.swingProgress) : 
                this.swingProgress * this.swingProgress;
            
            // Modify swing based on current stance
            const stanceModifier = this.currentStance === 'high' ? 1.2 :
                                 this.currentStance === 'low' ? 0.8 : 1;
            
            switch (this.swingType) {
                case 'horizontal':
                    swingAngle = this.facing === 'right'
                        ? this.stanceAngle + (Math.PI * 1.5 * stanceModifier) * progress
                        : this.stanceAngle - (Math.PI * 1.5 * stanceModifier) * progress;
                    break;
                case 'vertical':
                    swingAngle = this.facing === 'right'
                        ? this.stanceAngle + Math.PI * stanceModifier * progress
                        : this.stanceAngle - Math.PI * stanceModifier * progress;
                    break;
                case 'diagonal':
                    swingAngle = this.facing === 'right'
                        ? this.stanceAngle + (Math.PI * 1.2 * stanceModifier) * progress
                        : this.stanceAngle - (Math.PI * 1.2 * stanceModifier) * progress;
                    break;
            }
            
            // Add stance-specific body rotation
            const bodyRotation = Math.sin(progress * Math.PI) * 
                (this.currentStance === 'high' ? 0.3 : 
                 this.currentStance === 'low' ? 0.15 : 0.2);
            
            handX += Math.cos(bodyRotation) * 5 * (this.facing === 'right' ? 1 : -1);
            handY += Math.sin(bodyRotation) * 5;
            
            this.swordAngle = swingAngle;
        } else if (this.isBlocking) {
            // Blocking stance varies based on current stance
            const blockAngle = GAME_CONFIG.fighter.sword.guardAngle;
            const blockVariation = Math.sin(this.animationFrame * 0.05) * 0.1;
            
            // Different blocking angles based on stance
            const stanceBlockModifier = 
                this.currentStance === 'high' ? -0.2 :
                this.currentStance === 'low' ? 0.2 :
                this.currentStance === 'defensive' ? -0.3 : 0;
            
            this.swordAngle = this.facing === 'right'
                ? -blockAngle + blockVariation + stanceBlockModifier
                : -Math.PI + blockAngle + blockVariation + stanceBlockModifier;
        } else {
            // Use interpolated stance angle
            this.swordAngle = this.facing === 'right' 
                ? this.stanceAngle 
                : Math.PI - this.stanceAngle;
        }
        
        // Add movement sway based on stance
        if (this.isMoving && !this.isAttacking) {
            const stanceSwayMultiplier = 
                this.currentStance === 'high' ? 0.8 :
                this.currentStance === 'low' ? 1.2 :
                this.currentStance === 'defensive' ? 0.6 : 1;
            
            const sway = Math.sin(this.animationFrame * 0.1) * 0.15 * stanceSwayMultiplier;
            this.swordAngle += sway;
            handY += Math.cos(this.animationFrame * 0.1) * 3 * stanceSwayMultiplier;
        }
        
        // Calculate final hand position
        handX += Math.cos(this.swordAngle) * this.handOffset * (this.facing === 'right' ? 1 : -1);
        handY += Math.sin(this.swordAngle) * this.handOffset;
        
        // Draw sword components with stance-specific effects
        const momentumOffset = this.isAttacking ? 
            Math.sin(this.swingProgress * Math.PI) * 
            (this.currentStance === 'high' ? 4 :
             this.currentStance === 'low' ? 2 : 3) : 0;
        
        // Draw sword grip with momentum
        ctx.beginPath();
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 6;
        ctx.moveTo(handX, handY);
        ctx.lineTo(
            handX + Math.cos(this.swordAngle) * (swordConfig.gripLength + momentumOffset) * (this.facing === 'right' ? 1 : -1),
            handY + Math.sin(this.swordAngle) * (swordConfig.gripLength + momentumOffset)
        );
        ctx.stroke();
        
        // Draw sword guard with momentum
        const guardLength = 15 + (momentumOffset * 0.5);
        const guardAngle = this.swordAngle + Math.PI/2;
        const guardX = handX + Math.cos(this.swordAngle) * swordConfig.gripLength * (this.facing === 'right' ? 1 : -1);
        const guardY = handY + Math.sin(this.swordAngle) * swordConfig.gripLength;
        
        ctx.beginPath();
        ctx.strokeStyle = '#C0C0C0';
        ctx.lineWidth = 4;
        ctx.moveTo(guardX - Math.cos(guardAngle) * guardLength, guardY - Math.sin(guardAngle) * guardLength);
        ctx.lineTo(guardX + Math.cos(guardAngle) * guardLength, guardY + Math.sin(guardAngle) * guardLength);
        ctx.stroke();
        
        // Draw sword blade with momentum and trail effect
        if (this.isAttacking && this.swingProgress > 0.2) {
            // Draw swing trail
            const trailAlpha = Math.min(0.6, this.swingProgress);
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 255, 255, ${trailAlpha})`;
            ctx.lineWidth = 2;
            
            const trailPoints = 5;
            for (let i = 0; i < trailPoints; i++) {
                const trailProgress = this.swingProgress - (i * 0.1);
                if (trailProgress > 0) {
                    let trailAngle;
                    switch (this.swingType) {
                        case 'horizontal':
                            trailAngle = this.facing === 'right'
                                ? -Math.PI/4 + (Math.PI * 1.5) * trailProgress
                                : -Math.PI * 0.75 - (Math.PI * 1.5) * trailProgress;
                            break;
                        case 'vertical':
                            trailAngle = this.facing === 'right'
                                ? -Math.PI/2 + Math.PI * trailProgress
                                : -Math.PI/2 - Math.PI * trailProgress;
                            break;
                        case 'diagonal':
                            trailAngle = this.facing === 'right'
                                ? -Math.PI/3 + (Math.PI * 1.2) * trailProgress
                                : -Math.PI * 0.6 - (Math.PI * 1.2) * trailProgress;
                            break;
                    }
                    
                    ctx.moveTo(guardX, guardY);
                    ctx.lineTo(
                        guardX + Math.cos(trailAngle) * swordConfig.length * (this.facing === 'right' ? 1 : -1),
                        guardY + Math.sin(trailAngle) * swordConfig.length
                    );
                }
            }
            ctx.stroke();
        }
        
        // Draw main blade
        ctx.beginPath();
        ctx.strokeStyle = '#C0C0C0';
        ctx.lineWidth = swordConfig.width;
        ctx.moveTo(guardX, guardY);
        ctx.lineTo(
            guardX + Math.cos(this.swordAngle) * (swordConfig.length + momentumOffset) * (this.facing === 'right' ? 1 : -1),
            guardY + Math.sin(this.swordAngle) * (swordConfig.length + momentumOffset)
        );
        ctx.stroke();
        
        // Draw blade edge highlight
        ctx.beginPath();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.moveTo(guardX, guardY);
        ctx.lineTo(
            guardX + Math.cos(this.swordAngle) * (swordConfig.length + momentumOffset) * (this.facing === 'right' ? 1 : -1),
            guardY + Math.sin(this.swordAngle) * (swordConfig.length + momentumOffset)
        );
        ctx.stroke();

        // Add stance-specific visual effects
        if (!this.isAttacking && !this.isBlocking) {
            // Draw stance indicator
            const stanceColor = 
                this.currentStance === 'high' ? 'rgba(255, 200, 100, 0.2)' :
                this.currentStance === 'low' ? 'rgba(100, 200, 255, 0.2)' :
                this.currentStance === 'defensive' ? 'rgba(255, 255, 100, 0.2)' :
                'rgba(200, 200, 200, 0.2)';
            
            ctx.beginPath();
            ctx.fillStyle = stanceColor;
            ctx.arc(handX, handY, 20, 0, Math.PI * 2);
            ctx.fill();
        }
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
        
        // Draw arms with sword-holding animation
        const armSwing = this.isMoving ? Math.sin(this.animationFrame * 0.1) * 0.2 : 0;
        
        // Draw back arm (non-sword arm)
        ctx.beginPath();
        ctx.moveTo(centerX, shoulderY);
        ctx.lineTo(
            centerX + Math.sin(armSwing + (this.facing === 'right' ? Math.PI : 0)) * limbLength * 0.8,
            shoulderY + Math.cos(armSwing) * limbLength * 0.8
        );
        ctx.stroke();
        
        // Draw sword and sword arm
        this.drawSword(ctx, centerX, shoulderY);

        // Draw hit effect
        if (this.isHit) {
            ctx.beginPath();
            ctx.arc(centerX, headY, headRadius + 10, 0, Math.PI * 2);
            ctx.strokeStyle = 'yellow';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }

    calculateSwordPoints(centerX, shoulderY) {
        const swordConfig = GAME_CONFIG.fighter.sword;
        const handOffset = 25;
        
        // Calculate hand position
        let handX = centerX;
        let handY = shoulderY;
        
        if (this.isAttacking) {
            const bodyRotation = Math.sin(this.swingProgress * Math.PI) * 0.2;
            handX += Math.cos(bodyRotation) * 5 * (this.facing === 'right' ? 1 : -1);
            handY += Math.sin(bodyRotation) * 5;
        }
        
        handX += Math.cos(this.swordAngle) * handOffset * (this.facing === 'right' ? 1 : -1);
        handY += Math.sin(this.swordAngle) * handOffset;
        
        // Calculate guard position
        const guardX = handX + Math.cos(this.swordAngle) * swordConfig.gripLength * (this.facing === 'right' ? 1 : -1);
        const guardY = handY + Math.sin(this.swordAngle) * swordConfig.gripLength;
        
        // Calculate points along the blade
        const points = [];
        const numPoints = 10; // Number of collision points along blade
        
        for (let i = 0; i <= numPoints; i++) {
            const t = i / numPoints;
            const x = guardX + Math.cos(this.swordAngle) * (swordConfig.length * t) * (this.facing === 'right' ? 1 : -1);
            const y = guardY + Math.sin(this.swordAngle) * (swordConfig.length * t);
            points.push({ x, y });
        }
        
        return points;
    }

    drawHitEffects(ctx) {
        // Update and draw hit effects
        this.hitEffects = this.hitEffects.filter(effect => {
            effect.life -= 1;
            
            if (effect.life > 0) {
                const progress = effect.life / effect.maxLife;
                
                // Draw spark effect
                ctx.beginPath();
                ctx.strokeStyle = effect.color || `rgba(255, 255, 150, ${progress})`;
                ctx.lineWidth = 2;
                
                for (let i = 0; i < 8; i++) {
                    const angle = (Math.PI * 2 * i / 8) + effect.rotation;
                    const length = effect.radius * progress;
                    
                    ctx.moveTo(effect.x, effect.y);
                    ctx.lineTo(
                        effect.x + Math.cos(angle) * length,
                        effect.y + Math.sin(angle) * length
                    );
                }
                ctx.stroke();
                
                // Draw flash circle
                ctx.beginPath();
                ctx.fillStyle = effect.color || `rgba(255, 255, 200, ${progress * 0.5})`;
                ctx.arc(effect.x, effect.y, effect.radius * (1 - progress), 0, Math.PI * 2);
                ctx.fill();
                
                return true;
            }
            return false;
        });
    }

    createHitEffect(x, y, isParry = false) {
        this.hitEffects.push({
            x,
            y,
            radius: isParry ? 30 : 20,
            life: isParry ? 15 : 10,
            maxLife: isParry ? 15 : 10,
            rotation: Math.random() * Math.PI * 2
        });
    }

    update(opponent) {
        // Update position
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        
        // Keep player within canvas bounds
        if (this.position.x < 0) this.position.x = 0;
        if (this.position.x + this.width > GAME_CONFIG.canvas.width) {
            this.position.x = GAME_CONFIG.canvas.width - this.width;
        }
        
        // Update facing direction based on opponent position
        if (opponent.position.x < this.position.x) {
            this.facing = 'left';
        } else if (opponent.position.x > this.position.x) {
            this.facing = 'right';
        }
        
        // Update movement state
        this.isMoving = Math.abs(this.velocity.x) > 0;
        
        // Update animation frame
        this.animationFrame++;
        
        // Update hit recovery
        if (this.isHit) {
            this.hitRecoveryTime++;
            if (this.hitRecoveryTime > 30) {
                this.isHit = false;
                this.hitRecoveryTime = 0;
            }
        }
        
        // Update swing animation
        if (this.isAttacking) {
            this.swingProgress += 0.05;
            if (this.swingProgress >= 1) {
                this.recoveryPhase = true;
                this.swingProgress = Math.max(0, this.swingProgress - 0.08);
            }
        }
        
        // Regenerate stamina
        if (this.stamina < this.maxStamina) {
            this.stamina = Math.min(this.maxStamina, this.stamina + this.staminaRegenRate);
        }
        
        // Update guard health regeneration
        if (this.guardHealth < this.maxGuardHealth && !this.isBlocking) {
            this.guardHealth = Math.min(this.maxGuardHealth, this.guardHealth + 0.1);
        }
    }

    draw(ctx) {
        // Draw hit stun effect
        if (this.hitStunned) {
            ctx.save();
            ctx.translate(this.position.x + this.width / 2, this.position.y + this.height / 2);
            ctx.rotate(Math.sin(this.animationFrame * 0.8) * 0.1);
            ctx.translate(-(this.position.x + this.width / 2), -(this.position.y + this.height / 2));
        }

        this.drawStickman(ctx);
        
        // Draw hit effects
        this.drawHitEffects(ctx);
        
        if (this.hitStunned) {
            ctx.restore();
        }

        // Store sword points for collision detection
        this.hitPoints = this.calculateSwordPoints(
            this.position.x + this.width / 2,
            this.position.y + this.height * 0.4
        );
        
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

    checkCollision(opponent) {
        return (
            this.position.x < opponent.position.x + opponent.width &&
            this.position.x + this.width > opponent.position.x &&
            this.position.y < opponent.position.y + opponent.height &&
            this.position.y + this.height > opponent.position.y
        );
    }

    checkSwordCollision(opponent) {
        if (!this.isAttacking || this.swingProgress < 0.3 || this.recoveryPhase) return false;
        
        // Get opponent's sword points for parry detection
        const opponentSwordPoints = opponent.hitPoints;
        
        // Check each point along our sword blade
        for (const point of this.hitPoints) {
            // Check for parry (sword-to-sword collision)
            if (opponent.isBlocking || opponent.isAttacking) {
                for (const opPoint of opponentSwordPoints) {
                    const dx = point.x - opPoint.x;
                    const dy = point.y - opPoint.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < 15) { // Parry detection radius
                        this.createHitEffect(point.x, point.y, true);
                        opponent.createHitEffect(point.x, point.y, true);
                        this.parryWindow = true;
                        opponent.parryWindow = true;
                        setTimeout(() => {
                            this.parryWindow = false;
                            opponent.parryWindow = false;
                        }, 300);
                        return 'parry';
                    }
                }
            }
            
            // Check for body hit
            const opponentCenterX = opponent.position.x + opponent.width / 2;
            const opponentCenterY = opponent.position.y + opponent.height / 2;
            
            // Calculate distance to opponent's center
            const dx = point.x - opponentCenterX;
            const dy = point.y - opponentCenterY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < opponent.width * 0.4) { // Hit detection radius
                this.hitLocation = { x: point.x, y: point.y };
                return 'hit';
            }
        }
        
        return false;
    }

    canPerformAction(actionType) {
        const staminaCost = GAME_CONFIG.fighter.sword.combat.staminaCost[actionType];
        const multiplier = actionType === 'attack' ? 
            GAME_CONFIG.fighter.sword.combat.attackTypes[this.attackType]?.stamina || 1 : 1;
        
        return this.stamina >= staminaCost * multiplier && !this.isStunned && !this.guardBroken;
    }

    consumeStamina(actionType) {
        const staminaCost = GAME_CONFIG.fighter.sword.combat.staminaCost[actionType];
        const multiplier = actionType === 'attack' ? 
            GAME_CONFIG.fighter.sword.combat.attackTypes[this.attackType]?.stamina || 1 : 1;
        
        this.stamina = Math.max(0, this.stamina - (staminaCost * multiplier));
    }

    startBlock() {
        if (this.canPerformAction('block') && !this.isAttacking) {
            this.isBlocking = true;
            this.perfectBlockWindow = true;
            this.lastBlockTime = Date.now();
            
            // Perfect block window duration
            setTimeout(() => {
                this.perfectBlockWindow = false;
            }, 150);
        }
    }

    endBlock() {
        this.isBlocking = false;
        this.perfectBlockWindow = false;
    }

    breakGuard() {
        this.guardBroken = true;
        this.guardBreakCooldown = true;
        this.isBlocking = false;
        
        // Guard break recovery
        setTimeout(() => {
            this.guardBroken = false;
            this.guardHealth = this.maxGuardHealth;
        }, 2000);
        
        // Guard break cooldown
        setTimeout(() => {
            this.guardBreakCooldown = false;
        }, 3000);
    }

    attack(type = 'normal') {
        if (!this.attackCooldown && this.canPerformAction('attack')) {
            this.attackType = type;
            this.isAttacking = true;
            this.attackCooldown = true;
            this.swingProgress = 0;
            this.recoveryPhase = false;
            
            // Consume stamina
            this.consumeStamina('attack');
            
            // Get attack type modifiers
            const attackConfig = GAME_CONFIG.fighter.sword.combat.attackTypes[type] || {
                damage: 1,
                speed: 1,
                stamina: 1
            };
            
            // Update combo system
            const now = Date.now();
            if (now - this.lastAttackTime < 1000) {
                this.comboCount = (this.comboCount + 1) % 3;
                this.comboMultiplier = Math.min(2, this.comboMultiplier + 0.2);
            } else {
                this.comboCount = 0;
                this.comboMultiplier = 1;
            }
            this.lastAttackTime = now;
            
            // Choose swing type based on combo, stance, and attack type
            this.swingType = this.getSwingType(type);
            
            // Calculate attack duration
            const baseSpeed = this.swingType === 'vertical' ? 600 : 500;
            const stanceMultiplier = 
                this.currentStance === 'high' ? 1.2 :
                this.currentStance === 'low' ? 0.8 :
                this.currentStance === 'defensive' ? 1.3 : 1;
            
            const duration = baseSpeed * stanceMultiplier / attackConfig.speed;
            
            setTimeout(() => {
                this.isAttacking = false;
            }, duration);

            setTimeout(() => {
                this.attackCooldown = false;
            }, duration + 200 * stanceMultiplier);
        }
    }

    getSwingType(attackType) {
        switch (attackType) {
            case 'light':
                return this.currentStance === 'high' ? 'diagonal' :
                       this.currentStance === 'low' ? 'horizontal' : 'vertical';
            case 'heavy':
                return this.currentStance === 'high' ? 'vertical' :
                       this.currentStance === 'low' ? 'diagonal' : 'horizontal';
            case 'thrust':
                return 'thrust';
            default:
                return this.getDefaultSwingType();
        }
    }

    getDefaultSwingType() {
        switch (this.comboCount) {
            case 0:
                return this.currentStance === 'high' ? 'vertical' :
                       this.currentStance === 'low' ? 'diagonal' : 'horizontal';
            case 1:
                return this.currentStance === 'high' ? 'diagonal' :
                       this.currentStance === 'low' ? 'horizontal' : 'diagonal';
            case 2:
                return this.currentStance === 'high' ? 'horizontal' :
                       this.currentStance === 'low' ? 'vertical' : 'vertical';
        }
    }

    handleBlock(attacker, collisionPoint) {
        if (!this.isBlocking || this.guardBroken) return false;
        
        // Calculate block effectiveness based on angle
        const blockAngle = Math.abs(this.swordAngle - attacker.swordAngle);
        const blockEffectiveness = Math.cos(blockAngle) * GAME_CONFIG.fighter.sword.combat.blockStability;
        
        // Perfect block timing check
        const timeSinceBlock = Date.now() - this.lastBlockTime;
        const isPerfectBlock = this.perfectBlockWindow && timeSinceBlock < 150;
        
        if (isPerfectBlock) {
            // Perfect block creates a parry opportunity
            this.parrySuccess(attacker, collisionPoint);
            return true;
        }
        
        // Regular block
        this.consumeStamina('block');
        this.guardHealth -= (1 - blockEffectiveness);
        
        // Create block effect
        this.createBlockEffect(collisionPoint, blockEffectiveness);
        
        // Check for guard break
        if (this.guardHealth <= 0) {
            this.breakGuard();
            return false;
        }
        
        return true;
    }

    parrySuccess(attacker, collisionPoint) {
        // Create parry effect
        this.createHitEffect(collisionPoint.x, collisionPoint.y, true);
        attacker.createHitEffect(collisionPoint.x, collisionPoint.y, true);
        
        // Stun the attacker
        attacker.isStunned = true;
        setTimeout(() => {
            attacker.isStunned = false;
        }, GAME_CONFIG.fighter.sword.combat.parryStunDuration * 1000);
        
        // Grant counter attack window
        this.counterWindow = true;
        setTimeout(() => {
            this.counterWindow = false;
        }, 1000);
    }

    createBlockEffect(point, effectiveness) {
        // Create visual feedback for block
        const blockColor = effectiveness > 0.8 ? 'rgba(255, 255, 100, 0.5)' :
                          effectiveness > 0.5 ? 'rgba(255, 200, 100, 0.5)' :
                          'rgba(255, 100, 100, 0.5)';
        
        this.hitEffects.push({
            x: point.x,
            y: point.y,
            radius: 25,
            life: 10,
            maxLife: 10,
            rotation: Math.random() * Math.PI * 2,
            color: blockColor
        });
    }

    takeHit(attacker) {
        if (Date.now() - this.lastHitTime > 500 && !this.isStunned) { // Hit cooldown
            // Check for block
            if (this.isBlocking && this.handleBlock(attacker, attacker.hitLocation)) {
                return;
            }
            
            // Calculate damage
            let damage = GAME_CONFIG.fighter.sword.damage;
            
            // Apply attack type modifier
            const attackConfig = GAME_CONFIG.fighter.sword.combat.attackTypes[attacker.attackType] || {
                damage: 1
            };
            damage *= attackConfig.damage;
            
            // Apply combo multiplier
            damage *= attacker.comboMultiplier;
            
            // Apply counter attack bonus
            if (attacker.counterWindow) {
                damage *= GAME_CONFIG.fighter.sword.combat.counterDamageBonus;
            }
            
            // Apply damage
            this.health = Math.max(0, this.health - damage);
            this.isHit = true;
            this.hitRecoveryTime = 0;
            this.lastHitTime = Date.now();
            
            // Cancel attack if hit
            this.isAttacking = false;
            this.swingProgress = 0;
            this.recoveryPhase = false;
            
            // Reset combo
            this.comboCount = 0;
            this.comboMultiplier = 1;
        }
    }
} 