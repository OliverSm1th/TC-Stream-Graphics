gsap.registerPlugin(SplitText) 

// var map = L.map('map').setView([52.380, -1.56], 20);
// L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
//     maxZoom: 19,
//     // attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
// }).addTo(map);

// --- Configuration ---
// !!! IMPORTANT !!!
// PASTE YOUR TRACCAR API KEY (TOKEN) HERE.
// You can generate this in the Traccar web interface (Account -> Preferences -> Token).
const TRACCAR_API_URL = 'https://demo.traccar.org/api/positions';
const CENTRE_COORDINATES = [52.3808, -1.5610]; // Default center (London)
const SCALE = 17

const SUN_ICON = L.divIcon({
    // className: "leaflet-data-marker",
    html: L.Util.template('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="48" height="48" viewBox="0 0 256 256" xml:space="preserve"><g style="stroke: none; stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: none; fill-rule: nonzero; opacity: 1;" transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)"><circle cx="45" cy="45" r="45" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(254,192,6); fill-rule: nonzero; opacity: 1;" transform="  matrix(1 0 0 1 0 0) "/><path d="M 70 43 h -7.475 c -0.382 -3.368 -1.717 -6.447 -3.727 -8.97 l 5.294 -5.294 c 0.781 -0.781 0.781 -2.047 0 -2.828 c -0.781 -0.781 -2.047 -0.781 -2.828 0 l -5.294 5.294 c -2.523 -2.01 -5.601 -3.345 -8.97 -3.727 V 20 c 0 -1.104 -0.896 -2 -2 -2 s -2 0.896 -2 2 v 7.475 c -3.368 0.382 -6.447 1.717 -8.97 3.727 l -5.294 -5.294 c -0.78 -0.781 -2.048 -0.781 -2.828 0 c -0.781 0.781 -0.781 2.047 0 2.828 l 5.294 5.294 c -2.01 2.523 -3.345 5.602 -3.727 8.97 H 20 c -1.104 0 -2 0.896 -2 2 s 0.896 2 2 2 h 7.475 c 0.382 3.368 1.717 6.447 3.727 8.97 l -5.294 5.294 c -0.781 0.781 -0.781 2.047 0 2.828 c 0.391 0.391 0.902 0.586 1.414 0.586 s 1.024 -0.195 1.414 -0.586 l 5.294 -5.294 c 2.523 2.01 5.602 3.345 8.97 3.727 V 70 c 0 1.104 0.896 2 2 2 s 2 -0.896 2 -2 v -7.475 c 3.368 -0.382 6.447 -1.717 8.97 -3.727 l 5.294 5.294 c 0.391 0.391 0.902 0.586 1.414 0.586 s 1.023 -0.195 1.414 -0.586 c 0.781 -0.781 0.781 -2.047 0 -2.828 l -5.294 -5.294 c 2.01 -2.523 3.345 -5.602 3.727 -8.97 H 70 c 1.104 0 2 -0.896 2 -2 S 71.104 43 70 43 z M 45 58.646 c -7.525 0 -13.646 -6.122 -13.646 -13.646 c 0 -7.525 6.122 -13.646 13.646 -13.646 c 7.524 0 13.646 6.122 13.646 13.646 C 58.646 52.524 52.524 58.646 45 58.646 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(255,255,255); fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round"/></g></svg>'),
    // iconUrl: './light-mode-sun-yellow-circle-20616.svg', // https://www.iconpacks.net/free-icon/light-mode-sun-yellow-circle-20616.html
    iconSize: [5, 5],   // adjust size as needed
    iconAnchor: [24, 24], // point of the icon which will correspond to marker's location
    popupAnchor: [0, -24],// point from which the popup should open relative to the iconAnchor
    className: ''         // keep default class (no extra styling)
});

// --- DOM Elements ---
const mapElement = document.getElementById('map');

// --- Leaflet Map Initialization ---
let map;
let currentMarker = null; // To keep track of the marker

/**
 * Fetches and plots the first device's position from Traccar.
 * Uses the hardcoded TRACCAR_API_KEY for authentication.
 */
async function fetchAndPlotPosition() {

    if (TRACCAR_API_KEY === "YOUR_API_KEY_HERE") {
        showMessage('Configuration Error', 'Please paste your Traccar API key into the `TRACCAR_API_KEY` constant in the `index.html` file.');
        reloadButton.disabled = false;
        reloadButton.textContent = 'Reload Position';
        return;
    }

    try {
        const response = await fetch(TRACCAR_API_URL, {
            method: 'GET',
            headers: {
                // Use Bearer token authentication
                'Authorization': `Bearer ${TRACCAR_API_KEY}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Authentication failed. Please check your hardcoded `TRACCAR_API_KEY`.');
            }
            throw new Error(`Failed to fetch data. Server responded with status: ${response.status}`);
        }

        const data = await response.json();

        if (!data || data.length === 0) {
            throw new Error('No position data found for your account.');
        }

        // Get the very first position (which is the latest)
        const firstDevice = data[0];
        const lat = firstDevice.latitude;
        const lon = firstDevice.longitude;
        const timestamp = firstDevice.fixTime;

        if (!lat || !lon) {
            throw new Error('Invalid position data received from Traccar.');
        }

        // Update or create marker
        if (currentMarker) {
            currentMarker.setLatLng([lat, lon]);
        } else {
            currentMarker = L.marker([lat, lon], { icon: SUN_ICON }).addTo(map);
        }

        // Update last updated time
        // document.getElementById('last-updated-time').textContent = new Date(timestamp).toLocaleTimeString();

        // Center the map on the new position
        map.setView(CENTRE_COORDINATES, SCALE);

        console.log(`Successfully loaded position for Device ID: ${firstDevice.deviceId}.`);

    } catch (error) {
        console.error('Error fetching Traccar data:', error);
        // Check for potential CORS error
        let errorMessage = error.message;
        if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
            errorMessage = 'A network error occurred. This could be a CORS (Cross-Origin Resource Sharing) issue. The server <strong>server.traccar.org</strong> may not be configured to allow requests from this web page.';
        }
        console.error('Detailed error:', error);
    } finally {
    }
}

// --- App Initialization ---
window.onload = () => {
    // Initialize the map with a default view
    map = L.map('map', { attributionControl: false, zoomControl: false }).setView(CENTRE_COORDINATES, 18); // Default centered at [20, 0] with zoom 2

    L.maplibreGL({
        style: 'https://tiles.openfreemap.org/styles/liberty',
    }).addTo(map)
    // L.maplibreGL().addTo(map)
    // {
    //     style: './custom_gip_mapstyle.json',
    // }

    const route = [
        [52.3790808, -1.5609833],
        [52.3792347, -1.5610515],
        [52.3793362, -1.5608674],
        [52.379657, -1.5602258],
        [52.3801809, -1.5592644],
        [52.3803874, -1.5595644],
        [52.3804935, -1.5597064],
        [52.3805784, -1.5598939],
        [52.3805293, -1.560058],
        [52.38068, -1.5602676],
        [52.3808619, -1.5605125],
        [52.3812438, -1.5599134],
        [52.38155, -1.5592754],
        [52.3825965, -1.5608271],
        [52.3825065, -1.5609951],
        [52.3823824, -1.5612308],
        [52.3821302, -1.5616955],
        [52.3816341, -1.5626075],
        [52.3814912, -1.5624043],
        [52.3813961, -1.5622631],
        [52.3813919, -1.5623159],
        [52.3813501, -1.5623365],
        [52.3812184, -1.5623511],
        [52.3811575, -1.5623718],
        [52.3811129, -1.5624086],
        [52.3810488, -1.56244],
        [52.3809846, -1.5624445],
        [52.3809147, -1.5623866],
        [52.380853, -1.5622966],
        [52.3807264, -1.5620737],
        [52.3805229, -1.5616704],
        [52.3804058, -1.5614803],
        [52.3804046, -1.5612147],
        [52.3802747, -1.5610905],
        [52.3801828, -1.5610707],
        [52.3801252, -1.5610736],
        [52.3801118, -1.5607922],
        [52.3799948, -1.56062],
        [52.3798457, -1.5604376],
        [52.3797244, -1.5602498],
        [52.3793911, -1.5608767]
    ];
    const poly = L.polyline(route, { color: '#F1977F', weight: 10, opacity: 0.8 }).addTo(map);

    // Fetch position immediately on load
    fetchAndPlotPosition();

    // Set interval to refresh position every 10 seconds
    setInterval(fetchAndPlotPosition, 10000);
};











var state = 1

async function play() {
    if (state == 0) return
    else if (state == 1) {
        // Play Animation
        animateIn()
        state=2
    } else if (state == 2) {
        // Hide Animation
        animateOut()
        state=1
    }
}

function animateIn() {
    return new Promise((resolve, reject) => {
        const tl  = new gsap.timeline({ease: 'power1.in', onComplete: resolve});    
        tl.set('.graphic', {
            opacity: 1
        })
        tl.from('.graphic', {
            x: 1000
        })
        tl.from('.title', {
            y: 200
        }, ">-=0.2")
    })
}


function animateOut() {
    return new Promise((resolve, reject) => {
        const tl  = new gsap.timeline({ease: 'power1.in', onComplete: resolve});
        tl.to('.title', {
            x: 1000
        })
        tl.to('.graphic', {
            x: 1000
        }, "<+0.1")
        tl.set('.graphic', {
            opacity: 0,
            x: 0
        })
        tl.set('.title', {
            x: 0
        })
    });
}



// function g_animateIn(tl) {
//     // let title = document.querySelector('.title').textContent;
//     let split = SplitText.create(".title", { type: "words, lines" });
//     tl.set('.title', {
//         opacity: 1,
//         text: ""
//     })
//     // tl.to('.title', {
//     //     duration: 2,
//     //     text: {
//     //         value: title,
//     //         delimiter: " "
//     //     },
//     // })
//     tl.from(split.words, {
//         duration: 0.5, 
//         y: 100,       // animate from 100px below
//         autoAlpha: 0, // fade in from opacity: 0 and visibility: hidden
//         stagger: 0.05 // 0.05 seconds between each
//     }, ">-=0.2")
//     tl.from('.subtitle', {
//         opacity: 0,
//         y: 20
//     })
// }
// function g_animateOut(tl) {

// }