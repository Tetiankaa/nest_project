# Autoria Clone 
It`s a web application designed for the sale of cars, providing an API that supports comprehensive functionalities for managing car listings, user interactions, and administrative oversight. 

## Key Features
1. User Authentication and Authorization: Implements JWT-based authentication, with role-based access control for different types of users 
2. Post Management: Allows users to create, update, delete, and retrieve car listings. Includes features for viewing and archiving posts.
3. Image Upload and Management: Supports uploading multiple images for each car listing and managing (deleting) those images.
4. Swagger API Documentation: Comprehensive API documentation available via Swagger, providing an easy way to explore and test the API endpoints.
5. Validation and Error Handling: Ensures data integrity and security with input validation and global exception filters.

## Technologies Used
- NestJS
- TypeORM
- PostgreSQL
- TypeScript
- JWT
- Redis
- SendGrid
  
# Project Setup Instructions

## Prerequisites

- Docker and Docker Compose installed on your machine.
- Node.js and npm installed on your machine.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# start docker
Ensure Docker Desktop is running on your computer.

# run the following command to start the Docker containers for the database and other services:
$ npm run start:docker:db

# Setup MinIO Bucket
After starting Docker, open your browser and go to 'http://localhost:8001' and use creadentials from 'environments/local.env': MINIO_ROOT_USER and MINIO_ROOT_PASSWORD
  1. Select 'Create a Bucket'
  2. Write the bucket name as 'autoria-clone'
  3. Click 'Create Bucket'
  4. Select 'Access Policy: Public'

# Run Existing Migrations
npm run migration:run 

# generate migration for creating all other tables
npm run migration:generate -name=createTables
npm run migration:run

# Start the Development Server
$ npm run start:dev


```


