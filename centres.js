// ==========================================
// MAP
// ==========================================

const map = L.map("map").setView(
    [16.3067, 80.4365],
    12
);


// OpenStreetMap

L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution:
            "&copy; OpenStreetMap contributors"
    }
).addTo(map);


// ==========================================
// E-WASTE CENTRES
// ==========================================

const centres = [

    {
        name: "Guntur E-Waste Collection Centre",
        lat: 16.3067,
        lng: 80.4365,
        zone: "Green",
        address: "Guntur"
    },

    {
        name: "Electronics Recycling Centre",
        lat: 16.3150,
        lng: 80.4270,
        zone: "Moderate",
        address: "Guntur"
    },

    {
        name: "E-Waste Recycling Point",
        lat: 16.2900,
        lng: 80.4500,
        zone: "Red",
        address: "Guntur"
    }

];


// ==========================================
// ZONE ICON
// ==========================================

function getEmoji(zone) {

    if (zone === "Green") {
        return "🟢";
    }

    if (zone === "Moderate") {
        return "🟡";
    }

    return "🔴";
}


// ==========================================
// ADD MARKERS
// ==========================================

centres.forEach(centre => {

    const marker =
        L.marker([
            centre.lat,
            centre.lng
        ]).addTo(map);


    marker.bindPopup(`

        <b>
            ${getEmoji(centre.zone)}
            ${centre.name}
        </b>

        <br><br>

        📍 ${centre.address}

        <br>

        Zone:
        <b>
            ${centre.zone}
        </b>

    `);

});


// ==========================================
// CENTRE LIST
// ==========================================

const list =
    document.getElementById("centreList");


list.innerHTML = "";


centres.forEach(centre => {

    const card =
        document.createElement("div");

    card.className =
        "centre-card";


    card.innerHTML = `

        <h3>
            ${getEmoji(centre.zone)}
            ${centre.name}
        </h3>

        <p>
            📍 ${centre.address}
        </p>

        <p>
            Zone:
            <strong>
                ${centre.zone}
            </strong>
        </p>

        <button
            onclick="
                map.setView(
                    [${centre.lat}, ${centre.lng}],
                    16
                )
            "
        >
            🗺️ View on Map
        </button>

    `;


    list.appendChild(card);

});