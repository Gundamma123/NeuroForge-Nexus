# NeuroForge Nexus - Frontend

## Overview

NeuroForge Nexus is a Software Development Lifecycle (SDLC) management platform.

This repository contains the **React frontend** of the NeuroForge Nexus project. The frontend provides user interfaces for authentication and user management.

## Technology Stack

- React
- JavaScript
- HTML5
- CSS3
- Vite
- React Router

## Completed Frontend Modules

### 1. Login

- Login page UI
- Email input
- Password input
- Sign In button
- Error message display
- Navigation to Registration

### 2. Registration

- Registration page UI
- User registration form
- Form input fields
- Registration error handling
- Navigation to Login

### 3. User Management

- User Management dashboard UI
- User list/table
- Search users by name or email
- Filter users by role
- Display user role
- Display team information
- Display active/inactive status
- Add User navigation
- View user details
- Edit user
- Activate/Deactivate user

## User Roles

The User Management UI currently supports:

- Admin
- Project Manager
- Developer
- Tester
- DevOps Engineer

## Frontend Project Structure

```text
frontend/
│
├── public/
│
├── src/
│   ├── assets/
│   │   ├── images/
│   │   └── icons/
│   │
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   └── Footer.jsx
│   │
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   └── user/
│   │       ├── UserProfile.jsx
│   │       ├── UserList.jsx
│   │       ├── UserManagement.jsx
│   │       ├── UserDetails.jsx
│   │       └── EditUser.jsx
│   │
│   ├── services/
│   │   ├── api.js
│   │   └── userService.js
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
└── .gitignore
