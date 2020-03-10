import * as THREE from '@scripts/build/three.module.js';
import { RenderPass } from '@scripts/jsm/postprocessing/RenderPass.js';
import { EffectComposer } from '@scripts/jsm/postprocessing/EffectComposer.js';
import { OutlinePass } from '@scripts/jsm/postprocessing/OutlinePass.js';

export default () => {
    var composer = new EffectComposer(renderer);

    var renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    var outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
    outlinePass.edgeStrength = 4;
    outlinePass.edgeGlow = 1;
    outlinePass.edgeThickness = 3;
    outlinePass.pulsePeriod = 5;
    outlinePass.hiddenEdgeColor = new THREE.Color(0x000000);
    composer.addPass(outlinePass);

    return { composer, outlinePass };
}