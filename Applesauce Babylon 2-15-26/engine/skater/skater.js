 // Player

 export class ApplesauceSkater {
    constructor(core) {
        this.core = core;
        this.player = null; // Reference to collision module

        const player = new THREE.Group();
        
        const deckGeo = new THREE.BoxGeometry(0.8, 0.1, 2.5);
        const deckMat = new THREE.MeshLambertMaterial({ color: 0xFF1493 });
        const deck = new THREE.Mesh(deckGeo, deckMat);
        deck.position.y = 0.3;
        player.add(deck);
        
        for (let pos of [[-0.3, 0.15, -0.8], [0.3, 0.15, -0.8], [-0.3, 0.15, 0.8], [0.3, 0.15, 0.8]]) {
            const wheelGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 12);
            const wheelMat = new THREE.MeshLambertMaterial({ color: 0x000000 });
            const wheel = new THREE.Mesh(wheelGeo, wheelMat);
            wheel.position.set(...pos);
            wheel.rotation.z = Math.PI / 2;
            player.add(wheel);
        }
        
        const bodyGeo = new THREE.BoxGeometry(0.6, 1.2, 0.4);
        const bodyMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.set(0, 1.2, -0.2);
        player.add(body);
        
        const headGeo = new THREE.SphereGeometry(0.3, 8, 8);
        const headMat = new THREE.MeshLambertMaterial({ color: 0xFFDBAC });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.set(0, 2.1, -0.2);
        player.add(head);
        
        for (let side of [-1, 1]) {
            const armGeo = new THREE.BoxGeometry(0.2, 0.8, 0.2);
            const arm = new THREE.Mesh(armGeo, bodyMat);
            arm.position.set(side * 0.4, 1.2, -0.2);
            player.add(arm);
        }