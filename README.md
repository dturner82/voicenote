# voicenote
record, save and load audio recordings

## Run the demo with Docker

Start Docker Desktop, then run from this directory:

```sh
docker compose up --build -d
```

Open http://localhost:8080 to load `demo/index.html`.
Files in `dist/` are served at `/dist/`. To load a JavaScript file from
the demo, add a script tag using its filename, for example:

```html
<script src="/dist/voicenote.js"></script>
```

The `dist/` directory is initially empty; add your JavaScript files there.
Both directories are mounted read-only into the container, so local edits
appear when you refresh the browser without rebuilding the image.
The image also includes both directories for running without these mounts.

Stop the demo with:

```sh
docker compose down
```
