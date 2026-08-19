document
    .getElementById("loginForm")
    .addEventListener("submit", async function(event) {

        event.preventDefault();

        const email =
            document
            .getElementById("email")
            .value
            .trim();

        const password =
            document
            .getElementById("password")
            .value;

        const message =
            document
            .getElementById("loginMessage");

        try {

            const response =
                await fetch(
                    "http://127.0.0.1:5000/login",
                    {
                        method: "POST",

                        credentials: "include",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            email: email,
                            password: password
                        })
                    }
                );

            const data =
                await response.json();


            if (response.ok && data.success) {

                message.style.color = "green";

                message.textContent =
                    "✅ Login successful!";


                // SAVE USER EMAIL FOR PROFILE
                localStorage.setItem(
                    "userEmail",
                    email
                );


                setTimeout(function() {

                    window.location.href =
                        "admin.html";

                }, 700);


            } else {

                message.style.color = "red";

                message.textContent =
                    "❌ " + data.message;

            }


        } catch (error) {

            console.error(error);

            message.style.color = "red";

            message.textContent =
                "❌ Backend server is not running.";

        }

    });