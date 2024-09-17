# Docker Deployment of NCF Site

## Prerequisites

1. Ensure that Docker is installed on your machine. You can download Docker from the official website.
2. Make sure you have the latest version of Docker Compose installed.

## Step-by-Step Guide

### Step 1: Clone the Repository

First, clone the NCF repository from GitHub:

```bash
git clone https://github.com/Senparc/NeuCharFramework.git
cd NeuCharFramework
```

### Step 2: Build the Docker Image

Navigate to the directory containing the Dockerfile and build the Docker image:

```bash
docker build -t ncf-site .
```

### Step 3: Run the Docker Container

Run the Docker container using the following command:

```bash
docker run -d -p 80:80 --name ncf-site ncf-site
```

### Step 4: Verify the Deployment

Open your web browser and navigate to `http://localhost`. You should see the NCF site up and running.

## Troubleshooting

- If you encounter any issues during the build process, check the Docker logs for more information:

```bash
docker logs ncf-site
```

- Ensure that the necessary ports are not being used by other applications.

## Conclusion

By following these steps, you should have successfully deployed the NCF site using Docker. For more information, refer to the official documentation or the GitHub repository.
