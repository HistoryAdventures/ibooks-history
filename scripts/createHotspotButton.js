import * as THREE from '@scripts/build/three.module.js';
import * as TWEEN from '@scripts/js/tween';

function createButton() {
    var group = new THREE.Group();

    var geometry = new THREE.RingGeometry( 4.8, 5, 32 );
    var material = new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.DoubleSide, opacity: 1, transparent: true, } );
    var mesh = new THREE.Mesh( geometry, material );
    group.add( mesh );
    mesh.scale.set(0.02, 0.02, 0);

    var geometry2 = new THREE.RingGeometry( 4, 4.5, 32 );
    var material2 = new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.DoubleSide, opacity: 1, transparent: true, } );
    var mesh2 = new THREE.Mesh( geometry2, material2 );
    group.add( mesh2 );
    mesh2.scale.set(0.035, 0.035, 0);

    var geometry3 = new THREE.CircleGeometry( 5, 32 );
    var material3 = new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.DoubleSide, opacity: 0.0, transparent: true, } );
    var circle = new THREE.Mesh( geometry3, material3 );
    circle.scale.set(0.3, 0.3, 0);
    group.add( circle );

    new TWEEN.Tween(mesh.scale)
        .delay(600)
        .to({
            x: 0.15,
            y: 0.15,
            z: 0
        }, 3000)
        .easing(TWEEN.Easing.Linear.None)
        .repeat(Infinity)
        .start();

    new TWEEN.Tween(mesh2.scale)
        .delay(600)
        .to({
            x: 0.175,
            y: 0.175,
            z: 0
        }, 3000)
        .easing(TWEEN.Easing.Quadratic.In)
        .repeat(Infinity)
        .start();

    return group;
}

export default createButton;
