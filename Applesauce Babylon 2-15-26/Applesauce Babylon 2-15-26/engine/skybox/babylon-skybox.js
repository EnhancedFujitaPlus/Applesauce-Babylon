import * as BABYLON from '@babylonjs/core';
import { SkyMaterial } from '@babylonjs/materials/sky';
import { StarfieldProceduralTexture } from '@babylonjs/procedural-textures';

export class ApplesauceSkybox {
    constructor(scene) {
        this.scene = scene;
        this.currentSkybox = null;
        console.log('🌌 Babylon.js Skybox system initialized');
    }

    /**
     * Load a cubemap skybox (standard 6 images)
     */
    loadCubemap(rootPath) {
        // Babylon automatically looks for _px.jpg, _nx.jpg, etc.
        const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, this.scene);
        const skyboxMaterial = new BABYLON.StandardMaterial("skyBoxMat", this.scene);
        
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(rootPath, this.scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.disableLighting = true;
        
        skybox.material = skyboxMaterial;
        skybox.infiniteDistance = true; // Makes skybox follow camera
        this.currentSkybox = skybox;
        return skybox;
    }

    /**
     * Procedural Skybox using SkyMaterial (Simulates Rayleigh/Mie scattering)
     */
    createProceduralSkybox(mode = 'day') {
        const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, this.scene);
        const skyMaterial = new SkyMaterial("skyMaterial", this.scene);
        skyMaterial.backFaceCulling = false;

        if (mode === 'day') {
            skyMaterial.turbidity = 1;
            skyMaterial.luminance = 1;
            skyMaterial.inclination = 0.5; // Sun position
        } else {
            skyMaterial.inclination = -0.5; // Night/Sunset
        }

        skybox.material = skyMaterial;
        skybox.infiniteDistance = true;
        this.currentSkybox = skybox;
        return skybox;
    }

    /**
     * Enhanced Starfield using Procedural Textures
     */
    createStarfield() {
        const starfieldMesh = BABYLON.MeshBuilder.CreateSphere("stars", { diameter: 900, segments: 32 }, this.scene);
        const starfieldMat = new BABYLON.StandardMaterial("starfieldMat", this.scene);
        
        const starfieldTexture = new StarfieldProceduralTexture("starfieldTex", 512, this.scene);
        starfieldTexture.darkmatter = 0.2;
        starfieldTexture.distancia = 1.0;
        
        starfieldMat.diffuseTexture = starfieldTexture;
        starfieldMat.backFaceCulling = false;
        starfieldMat.disableLighting = true;
        
        starfieldMesh.material = starfieldMat;
        starfieldMesh.infiniteDistance = true;
        return starfieldMesh;
    }

    update(deltaTime) {
        if (this.currentSkybox) {
            this.currentSkybox.rotation.y += deltaTime * 0.01;
        }
    }
}