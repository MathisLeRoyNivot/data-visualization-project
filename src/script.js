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
let densityArtRadio = document.getElementById("density-art");

const getAirportsLocations = (jsonFile) => {
	let airportsLocations = [];
	jsonFile.forEach((airport) => {
		let airportLocation = {
			lat: parseFloat(airport.Latitude),
			lng: parseFloat(airport.Longitude),
			size: 0.005,
			color: `rgba(${[1,2,3].map(x => Math.random() * 256|0)}, 1.0)`,
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
		let color = inputData[item].color;
	
		return [[lat, lng, alt], ...[...Array(Math.round(0.05 * inputData[item].destinationsLength * 50)).keys()].map(() => {
			lat += (Math.random() * 2 - 1) * MAX_STEP_DEG;
			lng += (Math.random() * 2 - 1) * MAX_STEP_DEG;
			alt += (Math.random() * 2 - 1) * MAX_STEP_ALT;
			alt = Math.max(0, alt);
	
			return [lat, lng, alt, color];
		})];
	});
};

let airportsLocations = getAirportsLocations(airportsData);
//let airportsDataCoords = getAirportsDataCoords(airportsData);
let allAirportsLocations = getAirportsLocations(allAirportsData);
//let allAirportsDataCoords = getAirportsDataCoords(allAirportsData);

let airportLocationsInputData;
if (busiestAirportsRadio.checked) {
	airportLocationsInputData = airportsLocations;
} else if (allAirportsRadio.checked) {
	airportLocationsInputData = allAirportsLocations;
}

const MAX_STEP_DEG = 0.4;
const MAX_STEP_ALT = 0.015;
const pathsData = generatePathsData(airportLocationsInputData);

const Globe = new ThreeGlobe()
	.globeImageUrl("//unpkg.com/three-globe/example/img/earth-dark.jpg")
	.bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png")
	.pointsData(airportsLocations)
	.pointAltitude("size")
	.pointColor("color")
	.pointRadius(0.2);

Globe
	.pathsData(pathsData)
	.pathColor((pathData) => [pathData[1][3], 'rgba(255, 255, 255, 0.75)'])
	.pathStroke(2)
	.pathDashLength(0.5)
	.pathDashGap(0.05)
	.pathDashAnimateTime(15000);

setTimeout(() => {
	Globe
		.pathPointAlt((pnt) => pnt[2]) // set altitude accessor
		.pathTransitionDuration(4000);
}, 2000);

// Screen sizes
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

const colorGradient = (fadeFraction, rgbColor1, rgbColor2) => {
    var color1 = rgbColor1;
    var color2 = rgbColor2;
    var fade = fadeFraction;

    var diffRed = color2.red - color1.red;
    var diffGreen = color2.green - color1.green;
    var diffBlue = color2.blue - color1.blue;

    var gradient = {
      red: parseInt(Math.floor(color1.red + (diffRed * fade)), 10),
      green: parseInt(Math.floor(color1.green + (diffGreen * fade)), 10),
      blue: parseInt(Math.floor(color1.blue + (diffBlue * fade)), 10),
    };

    return `rgb(${gradient.red}, ${gradient.green}, ${gradient.blue})`;
}

const scaleValue = (value, from, to) => {
	let valueStd = (value - from) / (to - from);
	return valueStd //* (to - from) + from
};

// Load view function
const loadPathLinesView = () => {
	if (busiestAirportsRadio.checked) {
		Globe
			.pointAltitude(0.005)
			.pointsData(airportsLocations)
			.pathsData(pathsData);
	}
};
const loadDensityView = (artActivated = false) => {
	let densityInputData = allAirportsRadio.checked ? allAirportsLocations : airportsLocations;
	Globe.pointsData([]); // Reset
	Globe
		.pathsData([])
		.pointsData(densityInputData);

	setTimeout(() => {
		densityInputData.forEach(d => {
			d.color = colorGradient(scaleValue(d.destinationsLength, (artActivated ? 1 : 63), 239), {red: 0, green: 0, blue: 255}, {red: 255, green: 0, blue:0});
			d.size = (artActivated ? 20 : 1) * 0.5 * 0.005 * d.destinationsLength;
		});
		Globe.pointsData(densityInputData);
	}, 2000);
}

// Load data functions
const loadViewWithBusiestAirports = () => {
	if (pathLinesRadio.checked) {
		loadPathLinesView();
	} else if (densityRadio.checked) {
		loadDensityView();
	}
}

const loadViewWithAllAirports = () => {
	if (densityRadio.checked) {
		loadDensityView();
	}
}

document.getElementById('data-selection').addEventListener("change", function (e) {
	let target = e.target;
	if (target.id == "busiest-airports") {
		pathLinesRadio.disabled = false;
		densityArtRadio.disabled = true;
		loadViewWithBusiestAirports();
	} else if (target.id == "all-airports") {
		densityArtRadio.disabled = false;
		pathLinesRadio.disabled = true;
		densityRadio.checked = true;
		loadViewWithAllAirports();
	}
});

document.getElementById('view-mode').addEventListener("change", function (e) {
	let target = e.target;
	if (target.id == "path-lines") {
		busiestAirportsRadio.disabled = false;
		loadPathLinesView();
	} else if (target.id == "density") {
		busiestAirportsRadio.disabled = false;
		loadDensityView();
	} else if (target.id == "density-art") {
		busiestAirportsRadio.disabled = true;
		loadDensityView(true);
	}
});

// Kick-off renderer
(function animate() {
	// Frame cycle
	tbControls.update();
	renderer.render(scene, camera);
	requestAnimationFrame(animate);
})();