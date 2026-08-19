let chart;


// ==========================================
// LOAD PROFILE
// ==========================================

async function loadProfile() {

    // Demo/user email
    const email =
        localStorage.getItem("userEmail")
        || "admin@ewaste.com";


    try {

        const response = await fetch(

            `http://127.0.0.1:5000/profile/${encodeURIComponent(email)}`

        );


        const data =
            await response.json();


        document.getElementById("profileEmail")
            .textContent = data.email;


        document.getElementById("totalRequests")
            .textContent = data.total_requests;


        document.getElementById("totalQuantity")
            .textContent = data.total_quantity;


        document.getElementById("totalWeight")
            .textContent =
            data.total_weight + " kg";


        document.getElementById("completed")
            .textContent =
            data.completed_requests;


        document.getElementById("points")
            .textContent =
            data.points;


        document.getElementById("badge")
            .textContent =
            data.badge;


        loadPercentage();


    } catch (error) {

        console.error(error);

        alert("Backend server is not running.");

    }

}


// ==========================================
// WASTE PERCENTAGE
// ==========================================

async function loadPercentage() {

    try {

        const response = await fetch(

            "http://127.0.0.1:5000/waste-percentage"

        );


        const data =
            await response.json();


        const labels =
            data.map(item =>
                item.waste_type
            );


        const values =
            data.map(item =>
                item.percentage
            );


        if (chart) {

            chart.destroy();

        }


        chart = new Chart(

            document.getElementById("wasteChart"),

            {

                type: "doughnut",

                data: {

                    labels: labels,

                    datasets: [{

                        data: values,

                        label: "Waste Percentage"

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


    } catch (error) {

        console.error(error);

    }

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


    localStorage.removeItem("userEmail");

    window.location.href =
        "login.html";

}


// ==========================================
// START
// ==========================================

loadProfile();