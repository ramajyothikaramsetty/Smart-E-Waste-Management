const API_URL = "https://smart-e-waste-management.onrender.com";

let allRequests = [];


// ==========================================
// LOAD REQUESTS
// ==========================================

async function loadRequests() {

    const table = document.getElementById("requestTable");

    table.innerHTML = `
        <tr>
            <td colspan="10" class="empty">
                Loading requests...
            </td>
        </tr>
    `;

    try {

        const response = await fetch(
            `${API_URL}/pickup-requests`
        );

        if (!response.ok) {
            throw new Error("Failed to fetch requests");
        }

        allRequests = await response.json();

        displayRequests(allRequests);

    } catch (error) {

        console.error(error);

        table.innerHTML = `
            <tr>
                <td colspan="10" class="empty">
                    ❌ Unable to load requests.<br>
                    Please make sure the backend server is running.
                </td>
            </tr>
        `;
    }
}


// ==========================================
// DISPLAY REQUESTS
// ==========================================

function displayRequests(requests) {

    const table = document.getElementById("requestTable");

    table.innerHTML = "";

    if (!requests || requests.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="10" class="empty">
                    📭 No requests saved yet.
                </td>
            </tr>
        `;

        return;
    }


    requests.forEach(request => {

        const row = document.createElement("tr");

        row.innerHTML = `

            <td>${request.id}</td>

            <td>${request.name}</td>

            <td>${request.email}</td>

            <td>${request.waste_type}</td>

            <td>${request.quantity}</td>

            <td>
                ${request.estimated_weight} kg
            </td>

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
                        ${request.status === "Pending" ? "selected" : ""}>
                        Pending
                    </option>

                    <option value="Picked Up"
                        ${request.status === "Picked Up" ? "selected" : ""}>
                        Picked Up
                    </option>

                    <option value="Completed"
                        ${request.status === "Completed" ? "selected" : ""}>
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
// SEARCH REQUESTS
// ==========================================

function searchRequests() {

    const searchInput =
        document.getElementById("searchInput");

    const searchText =
        searchInput.value.toLowerCase().trim();


    const filteredRequests =
        allRequests.filter(request => {

            return (

                request.name
                    .toLowerCase()
                    .includes(searchText)

                ||

                request.email
                    .toLowerCase()
                    .includes(searchText)

                ||

                request.location
                    .toLowerCase()
                    .includes(searchText)

                ||

                request.waste_type
                    .toLowerCase()
                    .includes(searchText)

            );

        });


    displayRequests(filteredRequests);
}


// ==========================================
// UPDATE STATUS
// ==========================================

async function updateStatus(id, status) {

    try {

        const response = await fetch(
            `${API_URL}/update-status/${id}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    status: status
                })
            }
        );


        const result = await response.json();


        if (!response.ok) {

            alert(
                result.message ||
                "Unable to update status."
            );

            return;
        }


        alert("✅ Status updated successfully!");

        loadRequests();


    } catch (error) {

        console.error(error);

        alert(
            "❌ Backend server is not running."
        );
    }
}


// ==========================================
// DELETE REQUEST
// ==========================================

async function deleteRequest(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this request?"
    );


    if (!confirmDelete) {
        return;
    }


    try {

        const response = await fetch(
            `${API_URL}/delete-request/${id}`,
            {
                method: "DELETE"
            }
        );


        const result = await response.json();


        if (!response.ok) {

            alert(
                result.message ||
                "Unable to delete request."
            );

            return;
        }


        alert("🗑️ Request deleted successfully!");

        loadRequests();


    } catch (error) {

        console.error(error);

        alert(
            "❌ Backend server is not running."
        );
    }
}


// ==========================================
// LOAD WHEN PAGE OPENS
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    loadRequests
);
