
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


