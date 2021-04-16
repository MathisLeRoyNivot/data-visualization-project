import './styles/style.css';
const THREE = require('three');
const { OrbitControls } = require('three/examples/jsm/controls/OrbitControls');
const { TrackballControls } = require('three/examples/jsm/controls/TrackballControls');
import ThreeGlobe from 'three-globe';
import airportsData from '../Data/airports.json';

const convertLatLngToPolarCoordinate = (lat, lng, sphereRadius) => {
	let x = 6371 * Math.cos(lat) * Math.cos(lng)
	let y = 6371 * Math.cos(lat) * Math.sin(lng)
	let z = 6371 * Math.sin(lat)

	console.log([x, y, z])
  	return [x, y, z];
}

let airportsDataFormatted = [];
let airportsLocations = [];
airportsData.forEach((airport) => {
  airportsDataFormatted[airport["IATA/FAA"]] = {lat: parseFloat(airport.Latitude), lng: parseFloat(airport.Longitude)};

  if (airport["IATA/FAA"] = 'NTE') {
		let convertedAirportData = convertLatLngToPolarCoordinate(parseFloat(airport.Latitude), parseFloat(airport.Longitude), Math.random() / 3);
		let airportLocation = {
			lat: convertedAirportData[0],
			lng: convertedAirportData[1],
			size: convertedAirportData[2],
			color: ['red', 'white', 'blue', 'green'][Math.round(Math.random() * 3)]
		}
		airportsLocations.push(airportLocation);
	}
});
// console.log(airportsDataFormatted);

/*const test = [...airportsDataFormatted.keys()].map((airport) => ({
  lat: conv,
  lng: (Math.random() - 0.5) * 360,
  size: Math.random() / 3,
  color: ['red', 'white', 'blue', 'green'][Math.round(Math.random() * 3)]
}));
console.log(test);*/


// Canvas
const canvas = document.querySelector('canvas.webgl');

// Gen random data
/*const N = 300;
const airportsLocations = [...Array(N).keys()].map(() => ({
  lat: (Math.random() - 0.5) * 180,
  lng: (Math.random() - 0.5) * 360,
  size: Math.random() / 3,
  color: ['red', 'white', 'blue', 'green'][Math.round(Math.random() * 3)]
}));*/

const Globe = new ThreeGlobe()
  .globeImageUrl('//unpkg.com/three-globe/example/img/earth-dark.jpg')
  .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
  .pointsData(airportsLocations)
  .pointAltitude('size')
  .pointColor('color');

setTimeout(() => {
  airportsLocations.forEach(d => d.size = Math.random());
  Globe.pointsData(airportsLocations);
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
