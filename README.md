> **Full-stack interactive booking platform** built with React 18, TypeScript, Tailwind CSS, and Firebase. It features real-time time-conflict validation, role-based access control (RBAC), meeting participant management, and a dedicated personal dashboard with a modern Dark UI.

[![Live Demo](https://img.shields.io/badge/Live_Demo-🚀_View_Project-brightgreen?style=for-the-badge)](https://skoulskiy.github.io/Meeting-Room-Booking-App/)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-blueviolet?style=for-the-badge)](https://github.com/Skoulskiy/Meeting-Room-Booking-App)

---

## 📌 Project Overview
The Room Booking App is a modern, serverless web platform designed to streamline the scheduling of meeting rooms and shared spaces. It provides a seamless experience for both regular users and administrators, allowing them to browse available rooms, join existing meetings, and manage their personal schedules without time overlaps.

Key engineering highlights include **strict TypeScript typing**, **serverless backend integration with Firebase Firestore & Auth**, **complex array-based database querying for participant tracking**, and **custom stateful UI components (Modals)** replacing native browser alerts for a premium user experience.

---

## 💡 Engineering & Architecture Highlights

* **Role-Based Access Control (RBAC)**: Secure UI and functional restrictions based on user roles (Admin vs. Regular User) for room management.
* **Time-Conflict Validation Algorithm**: Client-to-server real-time checking against the Firestore database to prevent overlapping bookings for the same room and date.
* **Advanced Firestore Querying**: Utilizing `array-contains`, `arrayUnion`, and `arrayRemove` to efficiently manage and filter meeting participants without data duplication.
* **Custom UI Modals & State**: Fully integrated, state-driven React modals for confirmations (Cancel/Leave/Errors) and form submissions, ensuring a smooth UX.

---

## 🛠️ Tech Stack

| Category | Technology |
| :--- | :--- |
| **Frontend Framework** | React 18 (TypeScript) |
| **Routing & Navigation** | React Router DOM v6 |
| **Styling & UI** | Tailwind CSS |
| **Backend & Database** | Firebase Authentication, Cloud Firestore |
| **Build Tooling & Deploy** | Vite, Git, GitHub Pages (`gh-pages`) |

---

## 🚀 Key Features

* 🔐 **Authentication & Roles**: Secure sign-up/login system. Only authorized hosts can create, edit, or delete meeting rooms from the main dashboard.
* 📅 **Smart Booking System**: Book rooms by selecting dates and time slots. The system automatically rejects overlapping meetings with clear UI error states.
* 🤝 **Interactive Participant Management**: Users can freely join existing meetings created by others, instantly updating the global attendee list.
* 📋 **"My Bookings" Dashboard**: A dedicated, filtered personal space for users to track meetings they host (with Cancel options) or attend (with Leave options).
* 📱 **Responsive Dark Theme UI**: A fully fluid and adaptive dark mode interface optimized for Mobile, Tablet, and Desktop displays.

---

## 💻 Local Development Setup

Follow these steps to run the project locally on your machine:

### Prerequisites
* **Node.js**: `v18.x` or higher recommended
* **npm**: `v9.x` or higher
* **Firebase Account**: Required for database and auth configuration

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Skoulskiy/Meeting-Room-Booking-App
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Start the development server:**
  ```bash
   npm start
   ```
4. **Build for production:**
  ```bash
  npm run build
  ```

## 👤 Author & Contact

* **GitHub**: [@Skoulskiy](https://github.com/Skoulskiy)
* **LinkedIn**: [@Ilya-Yaskevych](https://www.linkedin.com/in/ilya-yaskevych-2819b6432/)
