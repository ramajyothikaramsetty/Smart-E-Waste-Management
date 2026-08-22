from flask import Flask, request, jsonify, session
from flask_cors import CORS
import sqlite3

app = Flask(__name__)

app.secret_key = "smart-ewaste-secret-key"

CORS(app, supports_credentials=True)

DATABASE = "ewaste.db"


# ==================================================
# DATABASE CONNECTION
# ==================================================

def get_db():
    connection = sqlite3.connect(DATABASE)
    connection.row_factory = sqlite3.Row
    return connection


# ==================================================
# CREATE DATABASE
# ==================================================

def create_database():

    connection = get_db()
    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS pickup_requests (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            name TEXT NOT NULL,

            email TEXT NOT NULL,

            waste_type TEXT NOT NULL,

            quantity INTEGER NOT NULL,

            location TEXT NOT NULL,

            pickup_date TEXT NOT NULL,

            status TEXT DEFAULT 'Pending',

            estimated_weight REAL DEFAULT 0

        )
    """)

    connection.commit()
    connection.close()


# ==================================================
# HOME
# ==================================================

@app.route("/")
def home():

    return "Smart E-Waste Management System is running!"


# ==================================================
# LOGIN
# ==================================================

@app.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    if email == "admin@ewaste.com" and password == "admin123":

        session["logged_in"] = True
        session["email"] = email
        session["role"] = "admin"

        return jsonify({
            "success": True,
            "message": "Login successful!",
            "role": "admin"
        })

    return jsonify({
        "success": False,
        "message": "Invalid email or password."
    }), 401


# ==================================================
# LOGOUT
# ==================================================

@app.route("/logout", methods=["POST"])
def logout():

    session.clear()

    return jsonify({
        "success": True,
        "message": "Logged out successfully!"
    })


# ==================================================
# LOGIN STATUS
# ==================================================

@app.route("/login-status")
def login_status():

    return jsonify({

        "logged_in": session.get("logged_in", False),

        "email": session.get("email", ""),

        "role": session.get("role", "")

    })


# ==================================================
# SUBMIT PICKUP REQUEST
# ==================================================

@app.route("/submit-request", methods=["POST"])
def submit_request():

    try:

        data = request.get_json()

        name = data.get("name")
        email = data.get("email")
        waste_type = data.get("wasteType")
        quantity = int(data.get("quantity"))
        location = data.get("location")
        pickup_date = data.get("pickupDate")

        if not all([
            name,
            email,
            waste_type,
            quantity,
            location,
            pickup_date
        ]):

            return jsonify({
                "message": "Please fill all fields."
            }), 400


        # Weight per device in kg

        weight_per_device = {

            "Mobile": 0.2,

            "Laptop": 2.0,

            "Battery": 0.5,

            "TV": 10.0,

            "Refrigerator": 50.0,

            "Other": 1.0

        }


        estimated_weight = (
            weight_per_device.get(waste_type, 1.0)
            * quantity
        )


        connection = get_db()
        cursor = connection.cursor()


        cursor.execute("""

            INSERT INTO pickup_requests

            (
                name,
                email,
                waste_type,
                quantity,
                location,
                pickup_date,
                status,
                estimated_weight
            )

            VALUES (?, ?, ?, ?, ?, ?, ?, ?)

        """, (

            name,
            email,
            waste_type,
            quantity,
            location,
            pickup_date,
            "Pending",
            estimated_weight

        ))


        connection.commit()

        request_id = cursor.lastrowid

        connection.close()


        return jsonify({

            "success": True,

            "message":
                "Pickup request submitted successfully!",

            "request_id":
                request_id,

            "estimated_weight":
                estimated_weight

        })


    except Exception as error:

        print(error)

        return jsonify({

            "success": False,

            "message":
                "Unable to submit request."

        }), 500


# ==================================================
# GET ALL PICKUP REQUESTS
# ==================================================

@app.route("/pickup-requests", methods=["GET"])
def pickup_requests():

    connection = get_db()

    cursor = connection.cursor()

    cursor.execute("""

        SELECT *

        FROM pickup_requests

        ORDER BY id DESC

    """)

    rows = cursor.fetchall()

    connection.close()


    return jsonify([

        dict(row)

        for row in rows

    ])


# ==================================================
# UPDATE STATUS
# ==================================================

@app.route(
    "/update-status/<int:request_id>",
    methods=["PUT"]
)
def update_status(request_id):

    data = request.get_json()

    status = data.get("status")


    allowed_status = [

        "Pending",

        "Picked Up",

        "Completed"

    ]


    if status not in allowed_status:

        return jsonify({

            "message":
                "Invalid status."

        }), 400


    connection = get_db()

    cursor = connection.cursor()


    cursor.execute("""

        UPDATE pickup_requests

        SET status = ?

        WHERE id = ?

    """, (

        status,
        request_id

    ))


    connection.commit()

    updated = cursor.rowcount

    connection.close()


    if updated == 0:

        return jsonify({

            "message":
                "Request not found."

        }), 404


    return jsonify({

        "message":
            "Status updated successfully!"

    })


# ==================================================
# DELETE REQUEST
# ==================================================

@app.route(
    "/delete-request/<int:request_id>",
    methods=["DELETE"]
)
def delete_request(request_id):

    connection = get_db()

    cursor = connection.cursor()


    cursor.execute("""

        DELETE FROM pickup_requests

        WHERE id = ?

    """, (

        request_id,

    ))


    connection.commit()

    deleted = cursor.rowcount

    connection.close()


    if deleted == 0:

        return jsonify({

            "message":
                "Request not found!"

        }), 404


    return jsonify({

        "message":
            "Request deleted successfully!"

    })


# ==================================================
# PROFILE
# ==================================================

@app.route("/profile/<email>", methods=["GET"])
def profile(email):

    connection = get_db()

    cursor = connection.cursor()


    cursor.execute("""

        SELECT *

        FROM pickup_requests

        WHERE email = ?

        ORDER BY id DESC

    """, (

        email,

    ))


    rows = cursor.fetchall()

    connection.close()


    total_requests = len(rows)


    total_quantity = sum(

        int(row["quantity"])

        for row in rows

    )


    total_weight = sum(

        float(row["estimated_weight"] or 0)

        for row in rows

    )


    completed = sum(

        1

        for row in rows

        if row["status"] == "Completed"

    )


    # Eco points

    points = (

        total_requests * 10

        + completed * 20

        + int(total_weight * 5)

    )


    # Badge

    if points >= 200:

        badge = "🏆 Eco Champion"

    elif points >= 100:

        badge = "🌿 Green Hero"

    elif points >= 50:

        badge = "♻️ Eco Saver"

    else:

        badge = "🌱 Beginner"


    return jsonify({

        "email": email,

        "total_requests":
            total_requests,

        "total_quantity":
            total_quantity,

        "total_weight":
            round(total_weight, 2),

        "completed_requests":
            completed,

        "points":
            points,

        "badge":
            badge

    })


# ==================================================
# WASTE PERCENTAGE
# ==================================================

@app.route("/waste-percentage", methods=["GET"])
def waste_percentage():

    connection = get_db()

    cursor = connection.cursor()


    cursor.execute("""

        SELECT

            waste_type,

            SUM(quantity) AS total

        FROM pickup_requests

        GROUP BY waste_type

    """)


    rows = cursor.fetchall()

    connection.close()


    total = sum(

        row["total"]

        for row in rows

    )


    result = []


    for row in rows:

        percentage = (

            row["total"] / total * 100

            if total > 0

            else 0

        )


        result.append({

            "waste_type":
                row["waste_type"],

            "quantity":
                row["total"],

            "percentage":
                round(percentage, 2)

        })


    return jsonify(result)


# ==================================================
# ZONES
# ==================================================

@app.route("/zones", methods=["GET"])
def zones():

    connection = get_db()

    cursor = connection.cursor()


    cursor.execute("""

        SELECT

            location,

            COUNT(*) AS requests

        FROM pickup_requests

        GROUP BY location

    """)


    rows = cursor.fetchall()

    connection.close()


    result = []


    for row in rows:

        count = row["requests"]


        if count <= 5:

            zone = "Green"

        elif count <= 10:

            zone = "Yellow"

        else:

            zone = "Red"


        result.append({

            "location":
                row["location"],

            "requests":
                count,

            "zone":
                zone

        })


    return jsonify(result)


# ==================================================
# RUN SERVER
# ==================================================

if __name__ == "__main__":

    create_database()

    app.run(
        debug=False,
        host="0.0.0.0",
        port=5000
    )
