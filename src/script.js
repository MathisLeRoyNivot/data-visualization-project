import './styles/style.css';
const THREE = require('three');
const { OrbitControls } = require('three/examples/jsm/controls/OrbitControls');
const { TrackballControls } = require('three/examples/jsm/controls/TrackballControls');
import ThreeGlobe from 'three-globe';
const dat = require('dat.gui');

// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
//const scene = new THREE.Scene();

// Objects
// Gen random data
/*const N = 20;
const arcsData = [...Array(N).keys()].map(() => ({
  startLat: (Math.random() - 0.5) * 180,
  startLng: (Math.random() - 0.5) * 360,
  endLat: (Math.random() - 0.5) * 180,
  endLng: (Math.random() - 0.5) * 360,
  color: [['red', 'white', 'blue', 'green'][Math.round(Math.random() * 3)], ['red', 'white', 'blue', 'green'][Math.round(Math.random() * 3)]]
}));

const globe = new ThreeGlobe()
  .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
  .arcsData(arcsData)
  .arcColor('color')
  .arcDashLength(() => Math.random())
  .arcDashGap(() => Math.random())
  .arcDashAnimateTime(() => Math.random() * 4000 + 500)

scene.add(globe);*/
// const sphereGeometry = new THREE.SphereBufferGeometry(.5, 64, 64);

// // Materials
// const material = new THREE.MeshBasicMaterial();
// material.color = new THREE.Color(0xffffff);

// // Mesh
// const sphere = new THREE.Mesh(sphereGeometry, material);
// scene.add(sphere)


// Lights
/*const pointLight = new THREE.PointLight(0xffffff, 0.1);
pointLight.position.x = 2;
pointLight.position.y = 3;
pointLight.position.z = 4;
scene.add(pointLight);*/

// Gen random data
const N = 300;
const gData = [...Array(N).keys()].map(() => ({
  lat: (Math.random() - 0.5) * 180,
  lng: (Math.random() - 0.5) * 360,
  size: Math.random() / 3,
  color: ['red', 'white', 'blue', 'green'][Math.round(Math.random() * 3)]
}));

const Globe = new ThreeGlobe()
  .globeImageUrl('//unpkg.com/three-globe/example/img/earth-dark.jpg')
  .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
  .pointsData(gData)
  .pointAltitude('size')
  .pointColor('color');

setTimeout(() => {
  gData.forEach(d => d.size = Math.random());
  Globe.pointsData(gData);
}, 4000);

/**
 * Sizes
 */
 const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Setup renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Setup scene
const scene = new THREE.Scene();
scene.add(Globe);
scene.add(new THREE.AmbientLight(0xbbbbbb));
scene.add(new THREE.DirectionalLight(0xffffff, 0.6));

// Setup camera
const camera = new THREE.PerspectiveCamera();
camera.aspect = window.innerWidth/window.innerHeight;
camera.updateProjectionMatrix();
camera.position.z = 500;

// Add camera controls
const tbControls = new TrackballControls(camera, renderer.domElement);
tbControls.minDistance = 101;
tbControls.rotateSpeed = 5;
tbControls.zoomSpeed = 0.8;

// Kick-off renderer
(function animate() {
  // Frame cycle
  tbControls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
})();