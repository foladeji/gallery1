import * as THREE from '../build/three.module.js';
import {
    OrbitControls
} from '../libraries/three/jsm/OrbitControls.js';
import {
    GLTFLoader
} from '../libraries/three/jsm/GLTFLoader.js';
import { DRACOLoader } from '../libraries/three/jsm/DRACOLoader.js';
import {
    RGBELoader
} from '../libraries/three/jsm/RGBELoader.js';
import {
    LoadingBar
} from '../libraries/LoadingBar.js';
import {
    VRButton
} from '../libraries/VRButton.js';
import {
    XRControllerModelFactory
} from '../libraries/three/jsm/XRControllerModelFactory.js';
import {
    Stats
} from '../libraries/stats.module.js';
import {
    CanvasUI
} from '../libraries/CanvasUI.js';
import {
    GazeController
} from '../libraries/GazeController.js'



class App {

   

    constructor() {
        const container = document.createElement('div');
        document.body.appendChild(container);

        // CAMERA
        this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.01, 500000);
        // this.camera.position.set(0, 5, 0);
    
        this.position = [
            //MAIN GALLERY
            new THREE.Vector3(2, 3.5, 17), 
            new THREE.Vector3(2, 3.5, -3), 
            new THREE.Vector3(-17,3.5,-3), 
            new THREE.Vector3(-17,3.5,17), 

            //ENTRY VESTIBULE
            new THREE.Vector3(5.5,3.5,28),
            new THREE.Vector3(-20,3.5,-13),

            //STAFF OFFICE
            new THREE.Vector3(19,3.5,17),

            //PUBLIC RESTROOMS
            new THREE.Vector3(1,3.5,-25),
            new THREE.Vector3(25,3.5,2),

            //CUSTODIAN;S CLOSET W/ SINK
            new THREE.Vector3(4,3.5,-12),

            //GALLERY STORAGE
            new THREE.Vector3(19,3.5,8.5),

            //GENERAL FACILITY STORAGE
            new THREE.Vector3(-6,3.5,-13),

            //MECHNICAL ROOM
            new THREE.Vector3(16,3.5,-12),

            //TERRACE 1
            new THREE.Vector3(-70,12,60),

            //TERRACE 2
            new THREE.Vector3(-20,12,-95),

            //JAPAN HOUSE
            new THREE.Vector3(-520,12,85),

            //SOUTH ENTRY
            new THREE.Vector3(5,4.5,55),

            //NORTH ENTRY
            new THREE.Vector3(-20,4.5,-30),
        
        ]
        this.currentPosition = 0
        this.camera.position.copy (this.position[this.currentPosition])
        // this.camera.position.set(this.position[this.currentPosition].x,this.position[this.currentPosition].y,this.position[this.currentPosition].z )
        // this.camera.position.set(this.position[this.currentPosition][0],
        //     this.position[this.currentPosition][1], 
        //     this.position[this.currentPosition][2]);

        console.log(this.camera.position)

        this.dolly = new THREE.Object3D();
        this.dolly.position.set(-20 , 4.5, -30);
        this.dolly.add(this.camera);
        this.dummyCam = new THREE.Object3D();
        this.camera.add(this.dummyCam);



        // SCENE
        this.scene = new THREE.Scene();
        this.scene.add(this.dolly)
        this.scene.background = new THREE.Color(0xaaaaaaa);

        //LIGHTING
        const ambient = new THREE.HemisphereLight(0xFFFFFF, 0xAAAAAA, 0.8);
        this.scene.add(ambient);

        const light = new THREE.DirectionalLight(0x9fd8fb, 0.3);
        this.scene.add(light);

        const keyLight = new THREE.DirectionalLight(new THREE.Color('hsl(200, 13%, 75%)'), 0.3);
        keyLight.position.set(-700, 60, 0);
        keyLight.castShadow = true;

        const fillLight = new THREE.DirectionalLight(new THREE.Color('hsl(53, 13%, 75%)'), 0.75);
        fillLight.position.set(100, 0, 100);
        fillLight.castShadow = true;


        const backLight = new THREE.DirectionalLight(0xffffff, 0.55);
        backLight.position.set(100, 0, -100).normalize();
        backLight.castShadow = true;

        const ambientLight = new THREE.AmbientLight(0xCECBB3, 0.25); // soft white light

        const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 2);
        hemisphereLight.position.set(100, 0, -100).normalize();
        hemisphereLight.castShadow = true;

        this.scene.add(keyLight);
        this.scene.add(fillLight);
        this.scene.add(backLight);
        this.scene.add(ambientLight);
        this.scene.add(hemisphereLight);

        // SKYDOME
        const vertexShader = document.getElementById('vertexShader').textContent;
        const fragmentShader = document.getElementById('fragmentShader').textContent;
        const uniforms = {
            topColor: {
                value: new THREE.Color(0x0077ff)
            },
            bottomColor: {
                value: new THREE.Color(0xffffff)
            },
            offset: {
                value: 400
            },
            exponent: {
                value: 0.6
            }
        };
        uniforms.topColor.value.copy(light.color);

        const skyGeo = new THREE.SphereGeometry(4000, 32, 15);
        const skyMat = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            side: THREE.BackSide
        });

        const sky = new THREE.Mesh(skyGeo, skyMat);
        this.scene.add(sky);


        //RENDERER
        this.renderer = new THREE.WebGLRenderer({
            antialias: true
        });

        this.renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.physicallyCorrectLights = true;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.setClearColor(0xcccccc);
        container.appendChild(this.renderer.domElement);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
      

        // Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.autorotate = true;
        this.controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
        this.controls.dampingFactor = 1;
        this.controls.minDistance = 10;
        this.controls.maxDistance = 400;
        this.controls.target = new THREE.Vector3(0, 5, 0);
        this.controls.update();

//        this.stats = new Stats();
//		container.appendChild( this.stats.dom );
//        
        this.loadingBar = new LoadingBar();
        this.loadModels();

        this.immersive = false;

        const self = this;

        window.addEventListener('resize', this.resize.bind(this));

        this.clock = new THREE.Clock();
        this.up = new THREE.Vector3(0, 1, 0);
        this.origin = new THREE.Vector3();
        this.workingVec3 = new THREE.Vector3();
        this.workingQuaternion = new THREE.Quaternion();
        this.raycaster = new THREE.Raycaster();

        window.addEventListener('click', this.changePosition.bind(this));
        // window.addEventListener('touch', this.changePosition.bind(this));
    
    }

    changePosition(){
        
        this.currentPosition += 1
        if (this.renderer.xr.enabled){
            this.dolly.position.set(0, 1.6, 0);
            if (this.currentPosition < this.position.length){
                this.dolly.position.copy (this.position[this.currentPosition])

            }else{
                this.currentPosition = 0;
                this.dolly.position.copy (this.position[this.currentPosition])
            }
        }else{
            if (this.currentPosition < this.position.length){
                this.camera.position.copy (this.position[this.currentPosition])
           
            }else{
                this.currentPosition = 0;
                this.camera.position.copy (this.position[this.currentPosition])
            }
        }
        
        console.log(this.camera.position)

    }

    resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }


    loadModels() {

        const loader = new GLTFLoader();
        const dracoloader = new DRACOLoader();
        dracoloader.setDecoderPath('../../libraries/three/js/draco/')
        const self = this;

        //MAIN BUILDING ELEMENTS
        loader.load('models/glbModels/building.glb', function (gltf) {
            const building = gltf.scene;
            self.scene.add(building);
            
            building.traverse(function (child) {
    				if (child.isMesh){
						if (child.name.indexOf("PROXY")!=-1){
							child.material.visible = false;
							self.proxy = child;
						}else if (child.material.name.indexOf('Glass')!=-1){
                            child.material.opacity = 0.1;
                            child.material.transparent = true;
                        }else if (child.material.name.indexOf("SkyBox")!=-1){
                            const mat1 = child.material;
                            const mat2 = new THREE.MeshBasicMaterial({map: mat1.map});
                            child.material = mat2;
                            mat1.dispose();
                        }
					}
				});
            
            self.building = building;

            self.loadingBar.visible = false;

            self.setupXR();
        });


        //WOODEN FACADE
        loader.load('models/glbModels/woodenFacade.glb', function (gltf) {
            const wooden = gltf.scene;
            self.scene.add(wooden);
            self.wooden = wooden;

            self.loadingBar.visible = false;

            // self.setupXR();
        });


        //SITE
        loader.load('models/glbModels/landscape.glb', function (gltf) {
            const site = gltf.scene;
            self.scene.add(site);
            self.site = site;

            self.loadingBar.visible = false;

            // self.setupXR();
        });


            //POND
            loader.load('models/glbModels/pond.glb', function (gltf) {
                const site = gltf.scene;
                self.scene.add(site);
                self.site = site;
    
                self.loadingBar.visible = false;
    
                // self.setupXR();
            });



        //FIGURES
        loader.load('models/glbModels/figures.glb', function (gltf) {
            const figures = gltf.scene;
            self.scene.add(figures);
            self.figures = figures;

            self.loadingBar.visible = false;

            // self.setupXR();
        });


        //EXTERIOR FACADE
        loader.load('models/glbModels/exteriorFacade.glb', function (gltf) {
            const exterior = gltf.scene;
            self.scene.add(exterior);
            self.exterior = exterior;

            self.loadingBar.visible = false;

            // self.setupXR();
        });

        //MULLIONS
        loader.load('models/glbModels/mullions.glb', function (gltf) {
            const mullions = gltf.scene;
            self.scene.add(mullions);
            self.mullions = mullions;

            self.loadingBar.visible = false;

            // self.setupXR();
        });

        //GLASS
        loader.load('models/glbModels/allglass.glb', function (gltf) {
            const glass = gltf.scene;
            self.scene.add(glass);
            self.glass = glass;

            self.loadingBar.visible = false;

            // self.setupXR();
        });


        //PAVEMENT
        loader.load('models/glbModels/pavement.glb', function (gltf) {
            const pavement = gltf.scene;
            self.scene.add(pavement);
            self.exterior = pavement;

            self.loadingBar.visible = false;

            // self.setupXR();
        });

                //ROAD
                loader.load('models/glbModels/road.glb', function (gltf) {
                    const pavement = gltf.scene;
                    self.scene.add(pavement);
                    self.exterior = pavement;
        
                    self.loadingBar.visible = false;
        
                    // self.setupXR();
                });


        //PERGOLAS
        loader.load('models/glbModels/pergolas.glb', function (gltf) {
            const pergolas = gltf.scene;
            self.scene.add(pergolas);
            self.pergolas = pergolas;

            self.loadingBar.visible = false;

            // self.setupXR();
        });


        //TERRACES
        loader.load('models/glbModels/terraces.glb', function (gltf) {
            const terraces = gltf.scene;
            self.scene.add(terraces);
            self.terraces = terraces;

            self.loadingBar.visible = false;

            // self.setupXR();
        });

        //TERRACE SIDINGS
        loader.load('models/glbModels/terraceSidings.glb', function (gltf) {
            const sidings = gltf.scene;
            self.scene.add(sidings);
            self.sidings = sidings;

            self.loadingBar.visible = false;

            // self.setupXR();
        });

        //PLANTERS
        loader.load('models/glbModels/planters.glb', function (gltf) {
            const planters = gltf.scene;
            self.scene.add(planters);
            self.planters = planters;

            self.loadingBar.visible = false;

            // self.setupXR();
        });

        //BENCHES
        loader.load('models/glbModels/benches.glb', function (gltf) {
            const planters = gltf.scene;
            self.scene.add(planters);
            self.planters = planters;

            self.loadingBar.visible = false;

            // self.setupXR();
        });

        //LAMPRODS
        loader.load('models/glbModels/lampRods.glb', function (gltf) {
            const planters = gltf.scene;
            self.scene.add(planters);
            self.planters = planters;

            self.loadingBar.visible = false;

            // self.setupXR();
        });

        //LAMPCASING
        loader.load('models/glbModels/lampCasing.glb', function (gltf) {
            const planters = gltf.scene;
            self.scene.add(planters);
            self.planters = planters;

            self.loadingBar.visible = false;

            // self.setupXR();
        });

        //SEATING
        loader.load('models/glbModels/seating.glb', function (gltf) {
            const planters = gltf.scene;
            self.scene.add(planters);
            self.planters = planters;

            self.loadingBar.visible = false;

            // self.setupXR();
        });

        //DOOR
        loader.load('models/glbModels/doors.glb', function (gltf) {
            const planters = gltf.scene;
            self.scene.add(planters);
            self.planters = planters;

            self.loadingBar.visible = false;

            // self.setupXR();
        });

        //DOORHANDLES
        loader.load('models/glbModels/doorhandles.glb', function (gltf) {
            const planters = gltf.scene;
            self.scene.add(planters);
            self.planters = planters;

            self.loadingBar.visible = false;

            // self.setupXR();
        });

        //DESK
        loader.load('models/glbModels/desk.glb', function (gltf) {
            const planters = gltf.scene;
            self.scene.add(planters);
            self.planters = planters;

            self.loadingBar.visible = false;

            // self.setupXR();
        });

        // //TREELEAVES
        // loader.load('models/glbModels/treeleaves.glb', function (gltf) {
        //     const planters = gltf.scene;
        //     self.scene.add(planters);
        //     self.planters = planters;

        //     self.loadingBar.visible = false;

        //     self.setupXR();
        // });

        //TREETRUNKS
        loader.load('models/glbModels/testtrees2.glb', function (gltf) {
            const planters = gltf.scene;
        
            self.scene.add(planters);
            self.planters = planters;

            self.loadingBar.visible = false;

            // self.setupXR();
        });
        
        //TREETRUNKS
        loader.load('models/glbModels/japanhouse.glb', function (gltf) {
            const planters = gltf.scene;
      
            self.scene.add(planters);
            self.planters = planters;

            self.loadingBar.visible = false;

            // self.setupXR();
        });



        //CENTERTREE
        loader.load('models/glbModels/centertree2.glb', function (gltf) {
            const planters = gltf.scene;
            self.scene.add(planters);
            self.planters = planters;

            self.loadingBar.visible = false;

            // self.setupXR();
        });
        
        //SHRUBS
        loader.load('models/glbModels/pottedplants.glb', function (gltf) {
            const planters = gltf.scene;
            self.scene.add(planters);
            self.planters = planters;

            self.loadingBar.visible = false;

            // self.setupXR();
        });

        //CARS1
        loader.load('models/glbModels/cars1.glb', function (gltf) {
            const planters = gltf.scene;
            self.scene.add(planters);
            self.planters = planters;
            
            self.loadingBar.visible = false;
            
            // self.setupXR();
        });
                
         //CARS2
         loader.load('models/glbModels/cars2.glb', function (gltf) {
            const planters = gltf.scene;
            self.scene.add(planters);
            self.planters = planters;
                                
            self.loadingBar.visible = false;
                                
            // self.setupXR();
        });
               
        //CARS3
         loader.load('models/glbModels/cars3.glb', function (gltf) {
            const planters = gltf.scene;
            self.scene.add(planters);
            self.planters = planters;
                                
            self.loadingBar.visible = false;
                                
            // self.setupXR();
        });

        //CARS4
        loader.load('models/glbModels/cars4.glb', function (gltf) {
            const planters = gltf.scene;
            self.scene.add(planters);
            self.planters = planters;
                                    
            self.loadingBar.visible = false;
                                    
            // self.setupXR();
        });
               
        //CARS5
        loader.load('models/glbModels/cars5.glb', function (gltf) {
            const planters = gltf.scene;
            self.scene.add(planters);
            self.planters = planters;
                                    
            self.loadingBar.visible = false;
                                    
            // self.setupXR();
        });
                   
    }



    //XR FUNCTION
    setupXR() {
        this.renderer.xr.enabled = true;

//         const XR = navigator.xr;

// if (XR) {
//     console.log("in xr")
//   XR.requestSession("immersive-vr").then((xrSession) => {
// console.log ("in request")
//     xrSession.addEventListener("onSelect", this.changePosition.bind(this) );

//     xrSession.requestReferenceSpace("local").then((xrReferenceSpace) => {
//       xrSession.requestAnimationFrame((time, xrFrame) => {
//         let viewer = xrFrame.getViewerPose(xrReferenceSpace);

//         gl.bindFramebuffer(xrWebGLLayer.framebuffer);

//         for (xrView of viewer.views) {
//           let xrViewport = xrWebGLLayer.getViewport(xrView);
//           gl.viewport(xrViewport.x, xrViewport.y,
//                       xrViewport.width, xrViewport.height);
//         }
//       });
//     });
//   });
// } else {
//   /* WebXR is not available */
// }

        const button = new VRButton(this.renderer);

        const self = this;

        function onSelectStart(event) {
            this.userData.selectPressed = true;
            const XR = navigator.xr;

            if (XR) {
                console.log("in xr")
              XR.requestSession("immersive-vr").then((xrSession) => {
            console.log ("in request")
                xrSession.addEventListener("select", this.changePosition.bind(this) );
            
                xrSession.requestReferenceSpace("local").then((xrReferenceSpace) => {
                  xrSession.requestAnimationFrame((time, xrFrame) => {
                    let viewer = xrFrame.getViewerPose(xrReferenceSpace);
            
                    gl.bindFramebuffer(xrWebGLLayer.framebuffer);
            
                    for (xrView of viewer.views) {
                      let xrViewport = xrWebGLLayer.getViewport(xrView);
                      gl.viewport(xrViewport.x, xrViewport.y,
                                  xrViewport.width, xrViewport.height);
                    }
                  });
                });
              });
            } else {
              /* WebXR is not available */
            }
        }

        function onSelectEnd(event) {
            this.userData.selectPressed = false;
        }

     
        this.renderer.setAnimationLoop(this.render.bind(this));
        
    }

    buildControllers(parent = this.scene) {
        const controllerModelFactory = new XRControllerModelFactory();

        const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1)]);

        const line = new THREE.Line(geometry);
        line.scale.z = 0;

        const controllers = [];

        for (let i = 0; i <= 1; i++) {
            const controller = this.renderer.xr.getController(i);
            controller.add(line.clone());
            controller.userData.selectPressed = false;
            parent.add(controller);
            controllers.push(controller);

            const grip = this.renderer.xr.getControllerGrip(i);
            grip.add(controllerModelFactory.createControllerModel(grip));
            parent.add(grip);
        }

        return controllers;
    }

    moveDolly(dt) {
        if (this.proxy === undefined) return;

        const wallLimit = 1.3;
        const speed = 2;
        let pos = this.dolly.position.clone();
        pos.y += 1;

        let dir = new THREE.Vector3();
        //Store original dolly rotation
        const quaternion = this.dolly.quaternion.clone();
        //Get rotation for movement from the headset pose
 this.dolly.quaternion.copy(this.dummyCam.getWorldQuaternion(this.workingQuaternion));
        this.dolly.getWorldDirection(dir);
        dir.negate();
        this.raycaster.set(pos, dir);

        let blocked = false;

        let intersect = this.raycaster.intersectObject(this.proxy);
        if (intersect.length > 0) {
            if (intersect[0].distance < wallLimit) blocked = true;
        }

        if (!blocked) {
            this.dolly.translateZ(-dt * speed);
            pos = this.dolly.getWorldPosition(this.origin);
        }

        //cast left
        dir.set(-1, 0, 0);
        dir.applyMatrix4(this.dolly.matrix);
        dir.normalize();
        this.raycaster.set(pos, dir);

        intersect = this.raycaster.intersectObject(this.proxy);
        if (intersect.length > 0) {
            if (intersect[0].distance < wallLimit) this.dolly.translateX(wallLimit - intersect[0].distance);
        }

        //cast right
        dir.set(1, 0, 0);
        dir.applyMatrix4(this.dolly.matrix);
        dir.normalize();
        this.raycaster.set(pos, dir);

        intersect = this.raycaster.intersectObject(this.proxy);
        if (intersect.length > 0) {
            if (intersect[0].distance < wallLimit) this.dolly.translateX(intersect[0].distance - wallLimit);
        }

        //cast down
        dir.set(0, -1, 0);
        pos.y += 1.5;
        this.raycaster.set(pos, dir);

        intersect = this.raycaster.intersectObject(this.proxy);
        if (intersect.length > 0) {
            this.dolly.position.copy(intersect[0].point);
        }

        //Restore the original rotation
        this.dolly.quaternion.copy(quaternion);
    }

    get selectPressed() {
        return (this.controllers !== undefined && (this.controllers[0].userData.selectPressed || this.controllers[1].userData.selectPressed));
    }


    render(timestamp, frame) {
        const dt = this.clock.getDelta();

        if (this.renderer.xr.isPresenting) {
            let moveGaze = false;
            
            if (this.useGaze && this.gazeController !== undefined) {
                this.gazeController.update();
                moveGaze = (this.gazeController.mode == GazeController.Modes.MOVE);

            }

            if (this.selectPressed || moveGaze) {
                this.moveDolly(dt);
                if (this.boardData) {
                    const scene = this.scene;
                    const dollyPos = this.dolly.getWorldPosition(new THREE.Vector3());
                    let boardFound = false;
                    Object.entries(this.boardData).forEach(([name, info]) => {
                        const obj = scene.getObjectByName(name);
                        if (obj !== undefined) {
                            const pos = obj.getWorldPosition(new THREE.Vector3());
                            if (dollyPos.distanceTo(pos) < 3) {
                                boardFound = true;
                                if (this.boardShown !== name) this.showInfoboard(name, info, pos);
                            }
                        }
                    });
                    if (!boardFound) {
                        this.boardShown = "";
                        this.ui.visible = false;
                    }
                }
            }
        }

        if (this.immersive != this.renderer.xr.isPresenting) {
            this.resize();
            this.immersive = this.renderer.xr.isPresenting;
        }

//this.stats.update();
        this.renderer.render(this.scene, this.camera);
    }



}

export {
    App
};
