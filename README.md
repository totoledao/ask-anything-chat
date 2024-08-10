[![License: MIT][license-shield]][license-url]
![Size](https://img.shields.io/github/repo-size/totoledao/ask-anything-chat)
![Platform](https://img.shields.io/badge/platform-Web-7F00FF)

## Front-end

[![React][react-shield]][react-url][![TypeScript][typescript-shield]][typescript-url]

## Back-end

[![Go][go-shield]][go-url][![Postgres][postgres-shield]][postgres-url]

[![Docker][docker-shield]][docker-url]

<!-- <br>[API documentation](server/README.md) -->

<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="https://github.com/totoledao/ask-anything-chat">
    <img src="https://github.com/user-attachments/assets/ffee4779-2237-40c9-9dea-5d79f048d02c" alt="Ask anything Logo" width="60">
  </a>
  
  <p align="center">
    Stream smarter: real-time Q&A with dynamic reactions!
    <br />
    <a href="https://github.com/totoledao/ask-anything-chat"><strong>Explore the docs »</strong></a>    
  </p>
</p>

<!-- TABLE OF CONTENTS -->
<details open="open">
  <summary><h2 style="display: inline-block">Table of Contents</h2></summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>    
    <li><a href="#usage">Usage</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>    
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

<!-- ![web-home](https://github.com/totoledao/totoledao/assets/40635662/11f0d79a-6733-4daa-b501-9a397c0ed065) -->

**A real-time interaction platform designed for streamers, allowing them to create and share rooms where participants can join, post questions, and engage in real-time. Questions are dynamically sorted based on reactions, ensuring the most popular content rises to the top.**

The primary objective of developing this app was to improve my proficiency in Go and WebSockets while staying updated with the new hooks and APIs in React 19.<br>
The backend features PostgreSQL as the database and Docker for containerizing the services. Tools like [pgx](https://github.com/jackc/pgx), [sqlc](https://github.com/sqlc-dev/sqlc) and [tern](https://github.com/jackc/tern) streamline database configuration and reduce boilerplate.

### Built With

**Web**<br>- [React][react-shield]

**Server**<br>- [Go][go-url]<br>- [Postgres][postgres-url]<br>- [Docker][docker-url]

<!-- GETTING STARTED -->

## Getting Started

Check the [API documentation](server/README.md).<br>
To get a local copy up and running follow these simple steps.

### Prerequisites

- [Node.JS](https://nodejs.org/)
- [Go](https://go.dev/doc/install)
- [Docker and Docker Compose](https://docs.docker.com/desktop/)

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/totoledao/ask-anything-chat.git
   ```
2. Install the dependencies of each folder
   ```sh
   cd server; go mod download
   ```
   ```sh
   cd web; npm i
   ```
3. Start Docker and apply migrations after the container is up
   ```sh
   cd server; docker compose up -d
   ```
   ```sh
   make
   ```
4. Start the web app
   ```sh
   npm run dev
   ```

<!-- USAGE EXAMPLES -->

<!-- ## Usage -->

<!-- ![web-login](https://github.com/totoledao/totoledao/assets/40635662/60743232-836d-4190-96bc-828b88c560ed)
Create an account or Login using your GitHub account -->

<!-- LICENSE -->

## License

Distributed under the MIT License. See [`LICENSE`][license-url] for more information.

<!-- CONTACT -->

## Contact

Guilherme Toledo - guilherme-toledo@live.com

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/guilhermemtoledo/)[![Instagram](https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://www.instagram.com/totoledao)[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=whit)](https://www.github.com/totoledao)

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[license-shield]: https://img.shields.io/badge/License-MIT-blue.svg
[license-url]: https://github.com/totoledao/ask-anything-chat/blob/main/LICENSE
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=0e76a8
[linkedin-url]: http://www.linkedin.com/in/guilhermemtoledo
[react-shield]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[react-url]: https://react.dev/
[typescript-shield]: https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white
[typescript-url]: https://www.typescriptlang.org/
[go-shield]: https://img.shields.io/badge/go-%2300ADD8.svg?style=for-the-badge&logo=go&logoColor=white
[go-url]: https://go.dev/
[postgres-shield]: https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white
[postgres-url]: https://www.postgresql.org/
[docker-shield]: https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white
[docker-url]: https://www.docker.com/
