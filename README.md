# image-api

API with random images and GIFs. Due to copyright reaons, you have to fill them yourself in /src/images. In /src/images
create a folder for an image category, e.g. "cat". The endpoint `/cat` will then pick a random image from that folder.
Supported image types are `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`.

## For developers

### Development setup

1. Start the container (app won't start automatically):

   ```bash
   docker compose up -d
   ```

2. Connect to the container:

   ```bash
   docker compose exec app bash
   ```

3. Run deno scripts inside the container

### Production setup

```bash
docker compose -f docker-compose.prod.yml up -d
```

### Environment Variables

Copy the `.env.skel` to `.env` and choose your port.

```bash
cp .env.skel .env
```

### GitHub Actions Deployment

The repository includes a GitHub Actions workflow that:

1. Runs format and lint checks
2. Builds and pushes Docker image to GitHub Container Registry
3. Deploys to your server

**Required Secrets:**

- `DEPLOY_HOST` - Server hostname/IP
- `DEPLOY_USER` - SSH username
- `DEPLOY_SSH_KEY` - SSH private key
- `DEPLOY_PATH` - Deployment path on server (e.g. `~/image-api`)
