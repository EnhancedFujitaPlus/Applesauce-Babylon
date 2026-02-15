/**
 * APPLESAUCE Objectives Module for Three.js r182
 * Track and display level objectives and completion
 * ES Module version
 */

export class ApplesauceObjectives {
    constructor(engine) {
        this.engine = engine;
        this.objectives = [];
        
        console.log('🎯 Objectives module loaded');
    }
    
    // ===================================
    // OBJECTIVE INITIALIZATION FROM CONFIG
    // ===================================
    init(objectivesConfig) {
        // Clear existing objectives
        this.clear();
        
        // Add objectives from level config
        if (objectivesConfig.survive) {
            this.addSurviveObjective(
                objectivesConfig.survive.duration,
                objectivesConfig.survive.description
            );
        }
        
        if (objectivesConfig.score) {
            this.addScoreObjective(
                objectivesConfig.score.target,
                objectivesConfig.score.description
            );
        }
        
        if (objectivesConfig.tricks) {
            this.addTrickObjective(
                'kickflip',
                objectivesConfig.tricks.kickflips || 0,
                objectivesConfig.tricks.description
            );
        }
        
        if (objectivesConfig.grinds) {
            this.addGrindObjective(
                objectivesConfig.grinds.count,
                objectivesConfig.grinds.description
            );
        }
        
        if (objectivesConfig.kills) {
            this.addKillObjective(
                objectivesConfig.kills.count,
                objectivesConfig.kills.description
            );
        }
        
        if (objectivesConfig.boss) {
            this.addBossObjective(objectivesConfig.boss.description);
        }
        
        console.log(`🎯 Loaded ${this.objectives.length} objectives`);
    }
    
    // ===================================
    // OBJECTIVE CREATION
    // ===================================
    add(config) {
        const objective = {
            id: config.id || `obj_${this.objectives.length}`,
            description: config.description || "Unknown Objective",
            type: config.type || "generic", // 'generic', 'kill', 'trick', 'boss', 'custom'
            target: config.target || 1,
            current: 0,
            complete: false,
            checker: config.checker || null, // Custom check function
            onComplete: config.onComplete || null // Callback when completed
        };
        
        this.objectives.push(objective);
        this.updateDisplay();
        
        return objective;
    }
    
    // ===================================
    // QUICK OBJECTIVE SETUPS
    // ===================================
    addSurviveObjective(seconds, description) {
        const frames = seconds * 60; // 60 fps
        return this.add({
            id: 'survive',
            description: description || `Survive ${seconds} seconds`,
            type: 'survive',
            target: frames,
            checker: (engine) => {
                // This needs a timer in the engine, for now just return 0
                return engine.survivalFrames || 0;
            }
        });
    }
    
    addKillObjective(count, description) {
        return this.add({
            id: 'roadkill',
            description: description || `Roadkill ${count} People`,
            type: 'kill',
            target: count,
            checker: (engine) => {
                return engine.modules.enemies ? engine.modules.enemies.kills : 0;
            }
        });
    }
    
    addTrickObjective(trickType, count, description) {
        return this.add({
            id: `trick_${trickType}`,
            description: description || `Land ${count} ${trickType}s`,
            type: 'trick',
            target: count,
            checker: (engine) => {
                return engine.state.kickflips; // Extend for other tricks
            }
        });
    }
    
    addGrindObjective(count, description) {
        return this.add({
            id: 'grinds',
            description: description || `Grind ${count} rails`,
            type: 'grind',
            target: count,
            checker: (engine) => {
                return engine.state.totalGrinds || 0;
            }
        });
    }
    
    addBossObjective(description) {
        return this.add({
            id: 'boss',
            description: description || "Defeat the Boss",
            type: 'boss',
            target: 1,
            checker: (engine) => {
                if (engine.modules.enemies && engine.modules.enemies.boss) {
                    return engine.modules.enemies.boss.isDead ? 1 : 0;
                }
                return 0;
            }
        });
    }
    
    addScoreObjective(score, description) {
        return this.add({
            id: 'score',
            description: description || `Reach ${score} points`,
            type: 'score',
            target: score,
            checker: (engine) => {
                return Math.floor(engine.state.score);
            }
        });
    }
    
    // ===================================
    // OBJECTIVE MANAGEMENT
    // ===================================
    update(engine) {
        let allComplete = true;
        
        for (let obj of this.objectives) {
            if (obj.complete) continue;
            
            // Check objective progress
            if (obj.checker) {
                obj.current = obj.checker(engine);
            }
            
            // Check if completed
            if (obj.current >= obj.target) {
                obj.complete = true;
                
                // Trigger completion callback
                if (obj.onComplete) {
                    obj.onComplete(engine);
                }
                
                console.log(`✅ Objective completed: ${obj.description}`);
            }
            
            if (!obj.complete) {
                allComplete = false;
            }
        }
        
        this.updateDisplay();
        
        // Check if all objectives complete
        if (allComplete && this.objectives.length > 0) {
            this.onAllComplete(engine);
        }
    }
    
    onAllComplete(engine) {
        console.log('🎉 ALL OBJECTIVES COMPLETE!');
        // Could trigger level end, victory screen, etc.
    }
    
    // ===================================
    // HUD DISPLAY
    // ===================================
    updateDisplay() {
        const container = document.getElementById('objectives');
        if (!container) return;
        
        // Build HTML for objectives list
        let html = '<div style="font-size: 18px; font-weight: bold; margin-bottom: 10px; color: #FFD700;">OBJECTIVES:</div>';
        
        for (let i = 0; i < this.objectives.length; i++) {
            const obj = this.objectives[i];
            const checkbox = obj.complete ? '☑' : '☐';
            const color = obj.complete ? 'color: #00FF00;' : '';
            
            let displayText = obj.description;
            
            // Add progress for non-boss objectives
            if (obj.type !== 'boss' && obj.target > 1) {
                displayText += ` (${obj.current}/${obj.target})`;
            }
            
            // Special styling for boss when spawned but not complete
            let specialStyle = '';
            if (obj.type === 'boss' && obj.current > 0 && !obj.complete) {
                specialStyle = 'color: #FF0000; font-weight: bold;';
                displayText += ' [ACTIVE]';
            }
            
            html += `<div id="obj${i}" style="margin-bottom: 8px; ${color || specialStyle}">${checkbox} ${displayText}</div>`;
        }
        
        container.innerHTML = html;
    }
    
    // ===================================
    // UTILITIES
    // ===================================
    getObjective(id) {
        return this.objectives.find(obj => obj.id === id);
    }
    
    isComplete(id) {
        const obj = this.getObjective(id);
        return obj ? obj.complete : false;
    }
    
    allComplete() {
        return this.objectives.every(obj => obj.complete);
    }
    
    clear() {
        this.objectives = [];
        this.updateDisplay();
        console.log('🎯 Objectives cleared');
    }
    
    // ===================================
    // MANUAL PROGRESS (for custom logic)
    // ===================================
    increment(id, amount = 1) {
        const obj = this.getObjective(id);
        if (obj && !obj.complete) {
            obj.current += amount;
            if (obj.current >= obj.target) {
                obj.complete = true;
                if (obj.onComplete) {
                    obj.onComplete(this.engine);
                }
            }
        }
    }
    
    setProgress(id, value) {
        const obj = this.getObjective(id);
        if (obj && !obj.complete) {
            obj.current = value;
            if (obj.current >= obj.target) {
                obj.complete = true;
                if (obj.onComplete) {
                    obj.onComplete(this.engine);
                }
            }
        }
    }
}
