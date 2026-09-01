# NeuroForge Nexus

NeuroForge Nexus is a Software Development Lifecycle (SDLC) management platform.

It helps teams manage users, teams, projects, sprints, and milestones.

## Technology Stack

### Frontend
- React
- JavaScript
- HTML
- CSS
- Vite
- React Router
- Axios

### Backend
- Java
- Spring Boot
- Spring Security
- JWT
- REST API
- Maven

### Database
- MySQL
- Spring Data JPA
  

## Milestone 1 Features

- User Registration
- User Login
- User Management
- Role-Based Access Control (RBAC)
- Team Management
- Team Assignment
- Project Creation
- Sprint Planning
- Milestone Tracking

## Project Structure

```text
NeuroForge Nexus/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   │   ├── user/
│   │   │   ├── team/
│   │   │   ├── project/
│   │   │   ├── sprint/
│   │   │   └── milestone/
│   │   └── services/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       │   └── com/neuroforge/nexus/
│   │       │       ├── config/
│   │       │       ├── controller/
│   │       │       ├── dto/
│   │       │       ├── entity/
│   │       │       ├── exception/
│   │       │       ├── repository/
│   │       │       ├── security/
│   │       │       └── service/
│   │       └── resources/
│   └── pom.xml
│
└── .gitignore
