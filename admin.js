let allRequests = [];

let chart;


// ==========================================
// LOAD REQUESTS
// ==========================================

async function loadRequests() {

    try {

        const response = await fetch(
            "http://127.0.0.1:5000/pickup-requests"
        );

        allRequests = await response.json();

        displayRequests(allRequests);

        updateDashboard(allRequests);

        createChart(allRequests);

    } catch (error) {

        console.error(error);

        document.getElementById("adminTable").innerHTML =
            "<tr><td colspan='10'>❌ Backend server is not running</td></tr>";

    }
}


// ==========================================
// DASHBOARD
// ==========================================

function updateDashboard(data) {

    document.getElementById("totalRequests").textContent =
        data.length;


    let quantity = 0;
    let pending = 0;
    let completed = 0;
    let weight = 0;


    data.forEach(request => {

        quantity += Number(request.quantity) || 0;

        weight += Number(request.estimated_weight) || 0;


        if (!request.status || request.status === "Pending") {

            pending++;

        }


        if (request.status === "Completed") {

            completed++;

        }

    });


    document.getElementById("totalQuantity").textContent =
        quantity;


    document.getElementById("pendingRequests").textContent =
        pending;


    document.getElementById("completedRequests").textContent =
        completed;


    document.getElementById("totalWeight").textContent =
        weight.toFixed(1) + " kg";
}


// ==========================================
// DISPLAY TABLE
// ==========================================

function displayRequests(data) {

    const table =
        document.getElementById("adminTable");

    table.innerHTML = "";


    if (data.length === 0) {

        table.innerHTML =
            "<tr><td colspan='10'>No requests found.</td></tr>";

        return;
    }


    data.forEach(request => {

        const row =
            document.createElement("tr");


        const status =
            request.status || "Pending";


        row.innerHTML = `

            <td>${request.id}</td>

            <td>${request.name}</td>

            <td>${request.email}</td>

            <td>${request.waste_type}</td>

            <td>${request.quantity}</td>

            <td>${request.estimated_weight} kg</td>

            <td>${request.location}</td>

            <td>${request.pickup_date}</td>

            <td>

                <select
                    onchange="updateStatus(
                        ${request.id},
                        this.value
                    )"
                >

                    <option value="Pending"
                        ${status === "Pending" ? "selected" : ""}>
                        Pending
                    </option>

                    <option value="Picked Up"
                        ${status === "Picked Up" ? "selected" : ""}>
                        Picked Up
                    </option>

                    <option value="Completed"
                        ${status === "Completed" ? "selected" : ""}>
                        Completed
                    </option>

                </select>

            </td>

            <td>

                <button
                    class="delete-btn"
                    onclick="deleteRequest(${request.id})"
                >
                    🗑️ Delete
                </button>

            </td>

        `;


        table.appendChild(row);

    });

}


// ==========================================
// UPDATE STATUS
// ==========================================

async function updateStatus(id, status) {

    try {

        const response = await fetch(

            `http://127.0.0.1:5000/update-status/${id}`,

            {

                method: "PUT",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    status: status
                })

            }

        );


        const data = await response.json();


        alert(data.message);


        loadRequests();

    } catch (error) {

        alert("Failed to update status.");

    }

}


// ==========================================
// DELETE REQUEST
// ==========================================

async function deleteRequest(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this request?"
        );


    if (!confirmDelete) {

        return;

    }


    try {

        const response = await fetch(

            `http://127.0.0.1:5000/delete-request/${id}`,

            {

                method: "DELETE"

            }

        );


        const data = await response.json();


        alert(data.message);


        loadRequests();

    } catch (error) {

        alert("Failed to delete request.");

    }

}


// ==========================================
// SEARCH
// ==========================================

function searchRequests() {

    const search =
        document
            .getElementById("searchInput")
            .value
            .toLowerCase();


    const filtered =
        allRequests.filter(request =>

            request.name
                .toLowerCase()
                .includes(search)

            ||

            request.email
                .toLowerCase()
                .includes(search)

            ||

            request.location
                .toLowerCase()
                .includes(search)

            ||

            request.waste_type
                .toLowerCase()
                .includes(search)

        );


    displayRequests(filtered);

}


// ==========================================
// PIE CHART
// ==========================================

function createChart(data) {

    const wasteTypes = {};


    data.forEach(request => {

        const type =
            request.waste_type;


        const quantity =
            Number(request.quantity) || 0;


        if (wasteTypes[type]) {

            wasteTypes[type] += quantity;

        } else {

            wasteTypes[type] = quantity;

        }

    });


    const labels =
        Object.keys(wasteTypes);


    const values =
        Object.values(wasteTypes);


    if (chart) {

        chart.destroy();

    }


    chart = new Chart(

        document.getElementById("wasteChart"),

        {

            type: "pie",

            data: {

                labels: labels,

                datasets: [{

                    label:
                        "E-Waste Quantity",

                    data: values

                }]

            },

            options: {

                responsive: true,

                plugins: {

                    legend: {

                        position: "bottom"

                    }

                }

            }

        }

    );

}


// ==========================================
// HOME
// ==========================================

function goHome() {

    window.location.href =
        "index.html";

}


// ==========================================
// LOGOUT
// ==========================================

async function logout() {

    try {

        await fetch(
            "http://127.0.0.1:5000/logout",
            {
                method: "POST",
                credentials: "include"
            }
        );

    } catch (error) {

        console.error(error);

    }


    window.location.href =
        "login.html";

}


// ==========================================
// START
// ==========================================

loadRequests();