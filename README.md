# 🌿 Health Assistant – Full-Stack Application

Health Assistant is a modern full-stack project built with **Java Spring Boot**, **PostgreSQL**, and **Angular**.  
It helps users monitor their daily health activity, track progress, and store fitness data in a secure way.  
The application is fully containerized with **Docker**, making it easy to deploy in cloud environments.  

---

## 📊 Executive Summary

Health Assistant is designed as a distributed, containerized full-stack solution.  
It provides a simple and intuitive interface for monitoring activity and wellness data, while ensuring scalability and secure data management.  

The platform emphasizes:  
- **Scalability** – modular architecture, cloud-ready deployment with Docker.  
- **Security** – OAuth2 authentication, session management, encrypted data in PostgreSQL.  
- **Data-driven insights** – activity, exercise, nutrition, and sleep data stored in a relational model.  
- **Great UX** – Angular frontend with responsive dashboards and modern UI.  

---

## 🧩 Architectural Principles

- **Separation of Concerns** – clear split between backend (Spring Boot), frontend (Angular), and persistence (PostgreSQL).  
- **REST API Design** – backend provides secured REST endpoints consumed by Angular.  
- **Spring Security with OAuth2** – secure authentication and session-based access.  
- **Resiliency** – error handling, caching mechanisms, and robust database design.  

---

## 🛠 Service Portfolio

| Service      | Responsibility                             | Tech Highlights                                   |
|--------------|--------------------------------------------|--------------------------------------------------|
| **Frontend** | Angular UI for health tracking & dashboards | OAuth2-protected routes, charts, responsive UI   |
| **Backend**  | Spring Boot & business logic            |  Spring Security, validation      |
| **Auth**     | OAuth2 login, session management           | Google / GitHub OAuth2, JWT sessions             |
| **Database** | PostgreSQL for persistence                 | Relational schema, encrypted storage             |
| **DevOps**   | Containerized deployment                   | Docker, Docker Compose                           |

---

## 💻 Technology Stack

| Layer      | Technology                                |
|------------|-------------------------------------------|
| **Frontend** | Angular 20.3.3, TypeScript                |
| **Backend**  | Spring Boot 3.5.6 (Java 21), Gradle       |
| **Auth**     | OAuth2 (Google & GitHub), Spring Security |
| **Database** | PostgreSQL (containerized)                |
| **DevOps**   | Docker, Docker Compose                    |

---

## 🏗 High-Level Architecture

**Interaction Flow:**  
1. User logs in via Google or GitHub OAuth2.  
2. Spring Security validates identity and creates session.  
3. User data stored securely in PostgreSQL.  
4. Angular frontend communicates with backend REST API.  
5. Backend processes business logic and persists activity data.  
6. Results are visualized in real-time on Angular dashboards.  

---

## 🔐 Security Design

- OAuth2 Authorization Code Flow (Google, GitHub).  
- Spring Security session 

---

## 🚀 Local Development Workflow

**Start App**  

```bash
docker-compose up --build
```

Runs on: [http://localhost:80](http://localhost:8080)  

---

## 👨‍💻 Maintainer

Milosz Podsiadly  
📧 m.podsadly99@gmail.com  
🔗 [GitHub – MiloszPodsiadly](https://github.com/MiloszPodsiadly)  

---

## 📜 License

Licensed under the [MIT License](LICENSE).  
