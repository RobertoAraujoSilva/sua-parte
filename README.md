# Student and Meeting Management System

This is a web application designed to help educational and religious organizations manage students, meetings, and assignments. It provides separate portals for instructors and students with role-based access control.

## Features

- **Role-Based Access:** Separate views and permissions for instructors and students.
- **Instructor Dashboard:** A central hub for instructors to manage all aspects of the system.
- **Student Management:** Instructors can add, view, and manage student information.
- **Meeting and Assignment Scheduling:** Tools for creating and organizing meetings and assigning tasks.
- **Student Portal:** A dedicated portal for students to view their assignments and track their progress.
- **Reporting:** Generate reports on student progress and meeting attendance.

## Tech Stack

- **Frontend:** React, Vite, TypeScript
- **UI:** shadcn-ui, Tailwind CSS
- **Routing:** React Router
- **Data Fetching & State Management:** TanStack Query
- **Backend:** Supabase (Authentication and Database)
- **Testing:** Cypress

## Getting Started

Follow these instructions to set up the project for local development.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone <YOUR_GIT_URL>
    cd <YOUR_PROJECT_NAME>
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**

    Create a `.env` file in the root of the project and add the following environment variables. You can get these values from your Supabase project dashboard.

    ```env
    VITE_SUPABASE_URL=YOUR_SUPABASE_URL
    VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    ```

### Running the Application

To start the development server, run the following command:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## Testing

This project uses Cypress for end-to-end testing. To run the tests, use the following commands:

-   **Run tests in headless mode:**

    ```bash
    npm run test:e2e
    ```

-   **Open the Cypress Test Runner:**

    ```bash
    npm run test:e2e:open
    ```

## Deployment

This project is ready to be deployed to any static site hosting service like Vercel, Netlify, or GitHub Pages. Run the following command to build the production-ready assets:

```bash
npm run build
```

Then, deploy the `dist` directory to your hosting provider of choice.
