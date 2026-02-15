// applesauce-noneuclid.js
import * as THREE from './three.module.js';

class ApplesauceNonEuclid {
  constructor(core, config = {}) {
    this.core = core;
    this.config = config;

    this.triggers = [];
    this.layers = new Map();
    this.enabled = true;

    this._lastPos = new THREE.Vector3();
    this._tempVec = new THREE.Vector3();

    console.log('🌀 NonEuclid module initialized');
  }

  // ===================================
  // PUBLIC API
  // ===================================

  addTrigger(trigger) {
    /*
      trigger = {
        id: 'loop-hall',
        type: 'position' | 'direction' | 'time',
        condition(engine) => boolean,
        action(engine) => void,
        once?: boolean
      }
    */
    this.triggers.push({
      fired: false,
      ...trigger
    });
  }

  addLayer(id, group) {
    this.layers.set(id, {
      group,
      active: true
    });
    this.core.scene.add(group);
  }

  setLayerActive(id, active) {
    const layer = this.layers.get(id);
    if (!layer) return;
    layer.active = active;
    layer.group.visible = active;
  }

  // ===================================
  // UPDATE LOOP
  // ===================================

  update() {
    if (!this.enabled || !this.core.player) return;

    const player = this.core.player;
    const pos = player.position;

    // Trigger evaluation
    for (const trigger of this.triggers) {
      if (trigger.once && trigger.fired) continue;

      if (trigger.condition(this.core)) {
        trigger.action(this.core);
        trigger.fired = true;
      }
    }

    // Cache last position
    this._lastPos.copy(pos);
  }

  // ===================================
  // UTILITY HELPERS
  // ===================================

  teleport(offset) {
    const p = this.core.player.position;
    p.add(offset);
  }

  hardSet(position) {
    this.core.player.position.copy(position);
  }

  warpZ(triggerZ, offsetZ) {
    const p = this.core.player.position;
    if (p.z > triggerZ) {
      p.z -= offsetZ;
    }
  }

  flipCameraYaw(amount = Math.PI) {
    this.core.state.rotation += amount;
  }

  subtleCameraDrift(time) {
    this.core.camera.rotation.z =
      Math.sin(time * 0.4) * 0.002;
  }

  // ===================================
  // CLEANUP
  // ===================================

  clear() {
    this.triggers.length = 0;
    this.layers.forEach(l => {
      this.core.scene.remove(l.group);
    });
    this.layers.clear();
  }
}

export { ApplesauceNonEuclid };
