document
    .getElementById("pickupForm")
    .addEventListener("submit", async function(event) {

        event.preventDefault();


        const name =
            document.getElementById("name").value.trim();


        const email =
            document.getElementById("email").value.trim();


        const wasteType =
            document.getElementById("wasteType").value;


        const quantity =
            document.getElementById("quantity").value;


        const location =
            document.getElementById("location").value.trim();


        const pickupDate =
            document.getElementById("pickupDate").value;


        const message =
            document.getElementById("message");


        try {

            const response = await fetch(

                "https://smart-e-waste-management.onrender.com/submit-request",

                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        name: name,

                        email: email,

                        wasteType: wasteType,

                        quantity: quantity,

                        location: location,

                        pickupDate: pickupDate

                    })

                }

            );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message || "Request failed"
                );

            }


            // Save user email for profile

            localStorage.setItem(
                "userEmail",
                email
            );


            message.innerHTML = `

                <div class="success-message">

                    ✅ Pickup request submitted!

                    <br><br>

                    ⚖️ Estimated E-Waste:

                    <strong>
                        ${data.estimated_weight} kg
                    </strong>

                </div>

            `;


            document
                .getElementById("pickupForm")
                .reset();


        } catch(error) {

            console.error(error);


            message.innerHTML = `

                <div class="error-message">

                    ❌ Backend server is not running.

                </div>

            `;

        }

    });
