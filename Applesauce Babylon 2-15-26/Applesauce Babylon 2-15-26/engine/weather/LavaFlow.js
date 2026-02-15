// LavaFlow.js
class LavaFlow {
    constructor(scene, startPos, angle, maxLength) {
        this.scene = scene;
        this.segments = [];
        this.position = startPos.clone();
        this.angle = angle;
        this.maxLength = maxLength;
        this.currentLength = 0;
        this.growthRate = 0.5;
        this.lifetime = 600;
        
        this.createFlow();
    }
    
    createFlow() {
        // Create initial segment
        this.addSegment();
    }
    
    addSegment() {
        const segment = new THREE.Mesh(
            new THREE.CylinderGeometry(1, 1.2, 2, 8),
            new THREE.MeshBasicMaterial({ 
                color: 0xFF4500,
                emissive: 0xFF6600
            })
        );
        
        segment.rotation.x = Math.PI / 2;
        segment.position.copy(this.position);
        this.scene.add(segment);
        this.segments.push(segment);
        
        // Move position down the slope
        this.position.x += Math.cos(this.angle) * 2;
        this.position.z += Math.sin(this.angle) * 2;
        this.position.y -= 1;
        
        this.currentLength += 2;
    }
    
    update() {
        // Grow flow
        if (this.currentLength < this.maxLength && Math.random() < 0.2) {
            this.addSegment();
        }
        
        // Pulse effect
        this.segments.forEach((seg, i) => {
            const phase = i * 0.5 + Date.now() * 0.001;
            seg.material.emissiveIntensity = 0.6 + Math.sin(phase) * 0.4;
        });
        
        this.lifetime--;
        return this.lifetime > 0;
    }
    
    remove(scene) {
        this.segments.forEach(seg => scene.remove(seg));
    }
}