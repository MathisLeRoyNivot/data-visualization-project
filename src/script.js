// Import style file
import "./styles/style.css";
// Import dependencies
const THREE = require("three");
const { OrbitControls }  = require("three/examples/jsm/controls/OrbitControls");
const { TrackballControls } = require("three/examples/jsm/controls/TrackballControls");
import ThreeGlobe from "three-globe";
const d3 = require("d3");
const polished = require('polished');
// Import .json files
import airportsData from "../Data/airports.json";
import allAirportsData from "../Data/all-airports.json";

// Canvas
const canvas = document.querySelector("canvas.globe");

// Configuration - Data selection
let busiestAirportsRadio = document.getElementById("busiest-airports");
let allAirportsRadio = document.getElementById("all-airports");

// Configuration - View mode
let pathLinesRadio = document.getElementById("path-lines");
let densityRadio = document.getElementById("density");

const getAirportsLocations = (jsonFile) => {
	let airportsLocations = [];
	jsonFile.forEach((airport) => {
		let airportLocation = {
			lat: parseFloat(airport.Latitude),
			lng: parseFloat(airport.Longitude),
			size: 0.005,
			color: ["red", "white", "blue", "green"][Math.round(Math.random() * 3)],
			name: airport.Name,
			country: airport.Country,
			iata: airport["IATA/FAA"],
			destinationsLength: airport.destinations.length,
		};
		airportsLocations.push(airportLocation);
	});
	return airportsLocations;
};
const getAirportsDataCoords = (jsonFile) => {
	let airportsDataCoords = [];
	jsonFile.forEach((airport) => {
		airportsDataCoords[airport["IATA/FAA"]] = {
			lat: airport.Latitude,
			lng: airport.Latitude,
		};
	});
	return airportsDataCoords;
};
const generatePathsData = (inputData) => {
	return [...Array(inputData.length).keys()].map((item) => {
		let lat = inputData[item].lat;
		let lng = inputData[item].lng;
		let alt = 0;
	
		return [[lat, lng, alt], ...[...Array(Math.round(0.05 * inputData[item].destinationsLength * 50)).keys()].map(() => {
			lat += (Math.random() * 2 - 1) * MAX_STEP_DEG;
			lng += (Math.random() * 2 - 1) * MAX_STEP_DEG;
			alt += (Math.random() * 2 - 1) * MAX_STEP_ALT;
			alt = Math.max(0, alt);
	
			return [lat, lng, alt];
		})];
	});
};


let airportsLocations = getAirportsLocations(airportsData);
let airportsDataCoords = getAirportsDataCoords(airportsData);

let allAirportsLocations = getAirportsLocations(allAirportsData);
let allAirportsDataCoords = getAirportsDataCoords(allAirportsData);


let airportLocationsInputData;
if (busiestAirportsRadio.checked) {
	airportLocationsInputData = airportsLocations;
} else if (allAirportsRadio.checked) {
	airportLocationsInputData = allAirportsLocations;
}
console.log(airportLocationsInputData);

const MAX_STEP_DEG = 0.4;
const MAX_STEP_ALT = 0.015;
const pathsData = generatePathsData(airportLocationsInputData);

const catColor = d3.scaleOrdinal(d3.schemeCategory10.map(col => polished.transparentize(0.2, col)));

const getAlt = d => d.elevation * 5e-5;

const getTooltip = d => `
	<div style="text-align: center">
		<div><b>${d.name}</b>, ${d.country}</div>
		<div>(${d.iata})</div>
		<div># Destinations: <em>${d.destinationsLength}</em>m</div>
	</div>
`;

const Globe = new ThreeGlobe()
	.globeImageUrl("//unpkg.com/three-globe/example/img/earth-dark.jpg")
	.bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png")
	.pointsData(airportsLocations)
	.pointAltitude("size")
	.pointColor("color")
	.pointRadius(0.2)
	/*.labelsData(airportsLocations)
	.pointLabel(getTooltip)
	.labelLat('lat')
	.labelLng('lng')
	.labelDotRadius(0.12)
	.labelDotOrientation(() => 'bottom')
	.labelText('name')
	.labelSize(0.15)
	.labelResolution(1)
	.labelLabel(getTooltip);*/

Globe.pathsData(pathsData)
	.pathColor(() => ["rgba(0,0,255,0.6)", "rgba(255,0,0,0.6)"])
	.pathStroke(2)
	.pathDashLength(0.5)
	.pathDashGap(0.05)
	.pathDashAnimateTime(15000);

setTimeout(() => {
	Globe
		.pathPointAlt((pnt) => pnt[2]) // set altitude accessor
		.pathTransitionDuration(4000);
}, 2000);

/**
 * Sizes
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};

window.addEventListener("resize", () => {
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
	canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x03000a, 1);

// Setup scene
const scene = new THREE.Scene();
scene.add(Globe);
scene.add(new THREE.AmbientLight(0xbbbbbb));
scene.add(new THREE.DirectionalLight(0xffffff, 0.6));

// Setup camera
const camera = new THREE.PerspectiveCamera();
camera.aspect = window.innerWidth / window.innerHeight;
camera.updateProjectionMatrix();
camera.position.z = 500;

// Add camera controls
const tbControls = new TrackballControls(camera, renderer.domElement);
tbControls.minDistance = 101;
tbControls.rotateSpeed = 5;
tbControls.zoomSpeed = 0.8;

// Load data functions
const loadViewWithBusiestAirports = () => {
	if (pathLinesRadio.checked) {
		loadPathLinesView();
	} else if (densityRadio.checked) {
		Globe
			.pathsData([])
			.pointsData(airportsLocations);
	}
}

const loadViewWithAllAirports = () => {
	if (densityRadio.checked) {
		Globe
			.pathsData([])
			.pointsData(allAirportsLocations);
		
		setTimeout(() => {
			allAirportsLocations.forEach(d => {
				d.color = new THREE.Color(`hsl(${d.size * d.destinationsLength}, 1.0, 0.5)`);
				d.size = 0.5 * d.size * d.destinationsLength;
			});
			Globe
				.pointsData(allAirportsLocations)
				.pointColor('color');
		}, 2000);
	}
}

// Load view function
const loadPathLinesView = () => {
	if (busiestAirportsRadio.checked) {
		Globe
			.pointsData(airportsLocations)
			.pathsData(pathsData);
	}
};
const loadDensityView = () => {
	let densityInputData = allAirportsRadio.checked ? allAirportsLocations : airportsLocations;
	Globe.pointsData([]); // Reset
	Globe
		.pathsData([])
		.pointsData(densityInputData);

	setTimeout(() => {
		densityInputData.forEach(d => d.size = Math.random());
		Globe.pointsData(densityInputData);
	}, 2000);
}

document.getElementById('data-selection').addEventListener("change", function (e) {
	let target = e.target;
	if (target.id == "busiest-airports") {
		pathLinesRadio.disabled = false;
		loadViewWithBusiestAirports();
	} else if (target.id == "all-airports") {
		pathLinesRadio.disabled = true;
		densityRadio.checked = true;
		loadViewWithAllAirports();
	}
});

document.getElementById('view-mode').addEventListener("change", function (e) {
	let target = e.target;
	if (target.id == "path-lines") {
		loadPathLinesView();
	} else if (target.id == "density") {
		loadDensityView();
	}
});

// Kick-off renderer
(function animate() {
	// Frame cycle
	tbControls.update();
	renderer.render(scene, camera);
	requestAnimationFrame(animate);
})();