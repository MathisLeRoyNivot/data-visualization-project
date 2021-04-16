import './styles/style.css';
const THREE = require('three');
const { OrbitControls } = require('three/examples/jsm/controls/OrbitControls');
const { TrackballControls } = require('three/examples/jsm/controls/TrackballControls');
import ThreeGlobe from 'three-globe';
import airportsData from '../Data/airports.json';

let airportsLocations = [];
let airportsDataCoords = [];
airportsData.forEach((airport) => {
	airportsDataCoords[airport["IATA/FAA"]] = {lat: airport.Latitude, lng: airport.Latitude};
    let airportLocation = {
      lat: parseFloat(airport.Latitude),
      lng: parseFloat(airport.Longitude),
      size: 0.1,
      color: ['red', 'white', 'blue', 'green'][Math.round(Math.random() * 3)]
    }
    airportsLocations.push(airportLocation);
});

const MAX_STEP_DEG = 0.4;
const MAX_STEP_ALT = 0.015;


const ourData = [...Array(airportsLocations.length).keys()].map((item) => {
  let lat = airportsLocations[item].lat;
  let lng = airportsLocations[item].lng;
  let alt = 0;

  return [[lat, lng, alt], ...[...Array(Math.round(0.05 * airportsData[item].destinations.length * 50)).keys()].map(() => {
    lat += (Math.random() * 2 - 1) * MAX_STEP_DEG;
    lng += (Math.random() * 2 - 1) * MAX_STEP_DEG;
    alt += (Math.random() * 2 - 1) * MAX_STEP_ALT;
    alt = Math.max(0, alt);

    return [lat, lng, alt];
  })];
});


// Canvas
const canvas = document.querySelector('canvas.webgl');

const Globe = new ThreeGlobe()
	.globeImageUrl('//unpkg.com/three-globe/example/img/earth-dark.jpg')
	.bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
	.pointsData(airportsLocations)
	.pointAltitude('size')
	.pointColor('color');
  
  Globe.pathsData(ourData)
      .pathColor(() => ['rgba(0,0,255,0.6)', 'rgba(255,0,0,0.6)'])
      .pathStroke(2)
      .pathDashLength(0.5)
      .pathDashGap(0.05)
      .pathDashAnimateTime(10000)

      setTimeout(() => {
        Globe
          .pathPointAlt(pnt => pnt[2]) // set altitude accessor
          .pathTransitionDuration(4000)
      }, 2000);
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
