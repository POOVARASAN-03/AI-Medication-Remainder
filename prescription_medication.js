### Authentication Routes (`/api/auth`)

-   **`POST /api/auth/register`**
    -   **Description:** Register a new user.
    -   **Access:** Public
    -   **Request Body:**
        ```json
        {
            "name": "John Doe",
            "email": "john.doe@example.com",
            "password": "password123"
        }
        ```
    -   **Success Response (201 Created):**
        ```json
        {
            "_id": "<user_id>",
            "name": "John Doe",
            "email": "john.doe@example.com",
            "token": "<jwt_token>"
        }
        ```

-   **`POST /api/auth/login`**
    -   **Description:** Authenticate user and get a JWT token.
    -   **Access:** Public
    -   **Request Body:**
        ```json
        {
            "email": "john.doe@example.com",
            "password": "password123"
        }
        ```
    -   **Success Response (200 OK):**
        ```json
        {
            "_id": "<user_id>",
            "name": "John Doe",
            "email": "john.doe@example.com",
            "token": "<jwt_token>"
        }
        ```

-   **`GET /api/auth/profile`**
    -   **Description:** Get authenticated user's profile.
    -   **Access:** Private (requires JWT token in `Authorization` header)
    -   **Success Response (200 OK):**
        ```json
        {
            "_id": "<user_id>",
            "name": "John Doe",
            "email": "john.doe@example.com"
        }
        ```

### Prescription Routes (`/api/prescriptions`)

-   **`POST /api/prescriptions/upload`**
    -   **Description:** Upload a prescription image, analyze it, and save details.
    -   **Access:** Private
    -   **Request Body:** `multipart/form-data` with a field named `image` containing the image file.
    -   **Success Response (201 Created):**
        ```json
        {
            "message": "Prescription uploaded and analyzed successfully",
            "prescription": {
                "_id": "<prescription_id>",
                "user": "<user_id>",
                "image": "uploads/<image_filename>",
                "extractedText": "<extracted_text>",
                "medicines": [
                    { "name": "MedicineA", "dosage": "10mg", "frequency": "1-0-1", "duration": "7 days" }
                ],
                "interactions": [
                    { "med1": "MedicineA", "med2": "MedicineB", "severity": "mild", "note": "Possible interaction." }
                ],
                "uploadDate": "2023-10-27T10:00:00.000Z",
                "__v": 0
            }
        }
        ```

### Reminder Routes (`/api/reminders`)

-   **`POST /api/reminders`**
    -   **Description:** Set a new medication reminder.
    -   **Access:** Private
    -   **Request Body:**
        ```json
        {
            "prescription": "<prescription_id>",
            "medicineName": "MedicineA",
            "time": "08:00",
            "startDate": "2023-10-27",
            "endDate": "2023-11-03"
        }
        ```
    -   **Success Response (201 Created):**
        ```json
        {
            "message": "Reminder set successfully",
            "reminder": {
                "_id": "<reminder_id>",
                "user": "<user_id>",
                "prescription": "<prescription_id>",
                "medicineName": "MedicineA",
                "time": "08:00",
                "startDate": "2023-10-27T00:00:00.000Z",
                "endDate": "2023-11-03T00:00:00.000Z",
                "status": "active",
                "createdAt": "2023-10-27T10:00:00.000Z",
                "__v": 0
            }
        }
        ```

-   **`GET /api/reminders`**
    -   **Description:** Get all reminders for the authenticated user.
    -   **Access:** Private
    -   **Success Response (200 OK):** An array of reminder objects.

-   **`GET /api/reminders/history`**
    -   **Description:** Get reminder history for the authenticated user.
    -   **Access:** Private
    -   **Success Response (200 OK):** An array of reminder history objects.

-   **`PUT /api/reminders/:id`**
    -   **Description:** Update the status of a specific reminder history entry.
    -   **Access:** Private
    -   **URL Params:** `id` (ID of the reminder history entry)
    -   **Request Body:**
        ```json
        {
            "status": "taken"  // or "missed"
        }
        ```
    -   **Success Response (200 OK):**
        ```json
        {
            "message": "Reminder status updated successfully",
            "reminderHistory": { /* updated reminder history object */ }
        }
        ```

### Chatbot Routes (`/api/chat`)

-   **`POST /api/chat/medical`**
    -   **Description:** Get a response from the Gemini medical chatbot.
    -   **Access:** Private
    -   **Request Body:**
        ```json
        {
            "prompt": "What are the side effects of Metformin?"
        }
        ```
    -   **Success Response (200 OK):**
        ```json
        {
            "response": "<chatbot_response_text>"
        }
        ```

## Sample Test Data

(To be provided here)
