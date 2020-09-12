import * as THREE from '@scripts/build/three.module.js';
import * as TWEEN from '@scripts/js/tween';

function createButton(name) {
    var group = new THREE.Group();

    var geometry = new THREE.RingGeometry( 4.8, 5, 32 );
    var material = new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.DoubleSide, opacity: 1, transparent: true, } );
    var mesh = new THREE.Mesh( geometry, material );
    mesh.name = name;
    group.add( mesh );
    mesh.scale.set(0.02, 0.02, 0.00001);

    var geometry2 = new THREE.RingGeometry( 4, 4.5, 32 );
    var material2 = new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.DoubleSide, opacity: 1, transparent: true, } );
    var mesh2 = new THREE.Mesh( geometry2, material2 );
    mesh2.name = name;
    group.add( mesh2 );
    mesh2.scale.set(0.035, 0.035, 0.00001);

    var geometry3 = new THREE.CircleGeometry( 2, 32 );
    var material3 = new THREE.MeshBasicMaterial( { color: 0xff00ff, side: THREE.DoubleSide, opacity: 0, transparent: true, } );
    var circle = new THREE.Mesh( geometry3, material3 );
    circle.name = name;
    circle.scale.set(0.3, 0.3, 0.00001);
    group.add( circle );

    new TWEEN.Tween(mesh.scale)
        .delay(200)
        .to({
            x: 0.15,
            y: 0.15,
            z: 0.00001
        }, 3000)
        .easing(TWEEN.Easing.Linear.None)
        .onUpdate(function (target) {
            if (target.x > 0.13) {
                mesh.material.opacity = Math.abs(target.x - 0.15) * 50;
            } else {
                mesh.material.opacity = 1;
            }
        })
        .repeat(Infinity)
        .start();

    new TWEEN.Tween(mesh2.scale)
        .delay(200)
        .to({
            x: 0.17,
            y: 0.17,
            z: 0.00001
        }, 3000)
        .easing(TWEEN.Easing.Quadratic.In)
        .onUpdate(function (target) {
            if (target.x > 0.15) {
                mesh2.material.opacity = Math.abs(target.x - 0.17) * 50;
            } else {
                mesh2.material.opacity = 1;
            }
        })
        .repeat(Infinity)
        .start();

    return group;
}

export default createButton;
