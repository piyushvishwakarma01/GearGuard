# How to Connect to Render PostgreSQL Database

This project is now configured to easily connect to a remote Render PostgreSQL database without needing to install PostgreSQL locally.

## Step 1: Create Database on Render

1.  Log in to your [Render Dashboard](https://dashboard.render.com/).
2.  Click **New +** and select **PostgreSQL**.
3.  Give it a name (e.g., `gearguard-db`).
4.  Choose a region and plan (Free tier is fine for dev).
5.  Click **Create Database**.

## Step 2: Get Connection Details

1.  Wait for the database to be "Available".
2.  On the database dashboard, look for the **Connect** or **Info** section.
3.  Find the **External Database URL**. It looks like:
    `postgres://user:password@oregon-postgres.render.com/gearguard_db_xxxx`
4.  **Copy** this URL.

## Step 3: Configure Backend

1.  In the `backend` folder, you will find a file named `.env.render` (or create a `.env` file).
2.  **Rename** `.env.render` to `.env` if you haven't already.
3.  Open `.env` and paste your copied URL into the `DATABASE_URL` field:
    ```env
    DATABASE_URL=postgres://your_copied_url_here...
    ```
4.  Save the file.

## Step 4: Configure Frontend

1.  In the `frontend` folder, make sure you have a `.env.local` file.
2.  It should contain:
    ```env
    NEXT_PUBLIC_API_URL=http://localhost:5000
    ```

## Step 5: Initialize the Database (Run Migrations & Seeds)

We have fixed the seed script errors!

1.  Open your terminal in the `backend` directory.
2.  Run the setup command:
    ```bash
    npm run db:setup
    ```
3.  You should see "Database setup completed successfully!".

## Step 6: Start the App

1.  **Backend**:
    ```bash
    cd backend
    npm run dev
    ```
2.  **Frontend**:
    ```bash
    cd frontend
    npm run dev
    ```

The application should now be fully working!
