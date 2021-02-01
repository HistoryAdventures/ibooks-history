import * as THREE from '@scripts/build/three.module.js';

export default {
    setup(scene, gui) {
        this.scene = scene;
        this.gui = gui;

        const mainLight = this.mainLight(scene);
        const ambientLight = this.ambientLight();
        const fireplaceLight = this.firePlaceLight();

        scene.add(mainLight);
        scene.add(ambientLight);
        scene.add(fireplaceLight);

        if (window.location.hash === '#debug') {
            gui.add(ambientLight, 'intensity', 0, 4).name("Ambient light").step(0.01).listen();
            gui.add(mainLight, 'intensity', 0, 4).name("Spot light").step(0.01).listen();
            gui.add(mainLight, 'penumbra', 0, 1).name("Spot feather").step(0.01).listen();
            gui.add(mainLight, 'distance', 0, 5).name("Distance").step(0.01).listen();
            gui.add(fireplaceLight, 'intensity', 0, 4).name("Firelight").step(0.01).listen();
        }

        // const spot1 = this.pictureLight({ x: 3.4, y: 2.1, z: 4.9 });
        // scene.add(spot1);

        // const spot2 = this.pictureLight({ x: -3.8, y: 2.1, z: 4.9 });
        // scene.add(spot2);

        // const spot3 = this.pictureLight({ x: -5.5, y: 2.1, z: 3 });
        // scene.add(spot3);

        // const spot4 = this.pictureLight({ x: -5.5, y: 2.1, z: 1.4 });
        // scene.add(spot4);

        // const spot5 = this.pictureLight({ x: -3.5, y: 2.1, z: -5.1 });
        // scene.add(spot5);

        // const spot6 = this.pictureLight({ x: -2.2, y: 2.1, z: -5.1 });
        // scene.add(spot6);

        // // const spot7 = this.pictureLight({ x: 2.2, y: 2.1, z: -5.1 }, "spot7");
        // const spot7 = this.pictureLight({ x: 2.2, y: 2.1, z: -5.1 });
        // scene.add(spot7);

        // Create a helper for the shadow camera (optional)
        // var helper = new THREE.CameraHelper( spotLight );
        // scene.add( helper );
    },
    firePlaceLight() {
        var fireLight = new THREE.PointLight(0xeecccc, 1.03);
        fireLight.position.set(-2.6, 0.1, -4.6);
        fireLight.distance = 8;
        fireLight.penumbra = 1;
        fireLight.shadow.radius = 8;
        // fireLight.castShadow = true;
        fireLight.shadow.mapSize.width = 1024;
        fireLight.shadow.mapSize.height = 1024;
        fireLight.shadow.camera.near = 0.5;
        fireLight.shadow.camera.far = 10;

        return fireLight;
    },
    mainLight(scene) {
        var spotLight;
        spotLight = new THREE.SpotLight(0xffffff, 3);
        spotLight.position.set(0, 1.8, 0);

        var targetObject = new THREE.Object3D();
        targetObject.position.set(0, 0, 0);
        scene.add(targetObject);
        spotLight.target = targetObject;
        spotLight.angle = Math.PI / 3;
        spotLight.decay = 1;
        spotLight.distance = 3;
        spotLight.penumbra = 1;
        // spotLight.castShadow = true;
        spotLight.shadow.mapSize.width = 1024;
        spotLight.shadow.mapSize.height = 1024;
        spotLight.shadow.camera.near = 1.5;
        spotLight.shadow.camera.far = 8;

        return spotLight;
    },
    ambientLight() {
        return new THREE.AmbientLight(0xcccccc, 0.14);
    },
    pictureLight(pos, name) {
        var spotLight;
        spotLight = new THREE.PointLight(0xffffff, 3);
        spotLight.position.set(pos.x, pos.y, pos.z);

        // var targetObject = new THREE.Object3D();
        // targetObject.position.set(pos.x, pos.y, pos.z);
        // this.scene.add(targetObject);

        // spotLight.target = targetObject;
        spotLight.angle = Math.PI / 8;
        spotLight.decay = 1;
        spotLight.distance = 1.5;
        spotLight.penumbra = 0;
        // spotLight.castShadow = true;
        // spotLight.shadow.mapSize.width = 1024;
        // spotLight.shadow.mapSize.height = 1024;
        // spotLight.shadow.camera.near = 1.5;
        // spotLight.shadow.camera.far = 8;

        // var lightHelper;
        // lightHelper = new THREE.SpotLightHelper(spotLight);
        // this.scene.add( lightHelper );

        if (name && this.gui) {
            this.gui.add(spotLight.position, 'z', -10, 10).name(name + 'z').step(0.1).listen();
            this.gui.add(spotLight.position, 'x', -10, 10).name(name + 'x').step(0.1).listen();
            this.gui.add(spotLight.position, 'y', -10, 10).name(name + 'y').step(0.1).listen();
        }
        // this.gui.add(spotLight.rotation, 'y', -10, 10).name('light y rot').step(0.1).listen();

        return spotLight;
    }
}