import { Context, Hono } from "hono";
import { load } from "std/dotenv";
import * as log from "std/log";

await load({ export: true });

log.setup({
  handlers: {
    console: new log.handlers.ConsoleHandler("INFO"),
  },
  loggers: {
    default: {
      level: "INFO",
      handlers: ["console"],
    },
  },
});

const PORT = parseInt(Deno.env.get("PORT") || "4000");
const app = new Hono();

function getContentType(filename: string): string {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf("."));
  const contentTypes: Record<string, string> = {
    ".gif": "image/gif",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
  };
  return contentTypes[ext] || "application/octet-stream";
}

async function sendRandomImage(c: Context, name: string): Promise<Response> {
  try {
    const imagesPath = `./src/images/${name}`;

    const entries: Deno.DirEntry[] = [];
    for await (const entry of Deno.readDir(imagesPath)) {
      if (entry.isFile) {
        entries.push(entry);
      }
    }

    if (entries.length === 0) {
      return c.json(
        {
          status: 404,
          error: "Not Found",
          message: "No images found",
        },
        404,
      );
    }

    const randomIndex = Math.floor(Math.random() * entries.length);
    const selectedFile = entries[randomIndex].name;
    const filePath = `${imagesPath}/${selectedFile}`;

    const fileData = await Deno.readFile(filePath);
    const contentType = getContentType(selectedFile);

    return new Response(fileData, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": fileData.length.toString(),
      },
    });
  } catch (err) {
    log.error(`Failed to read image file: ${err}`);
    return c.json(
      {
        status: 500,
        error: "Failed to read image file",
      },
      500,
    );
  }
}

app.get("/", async (c) => {
  try {
    const imagesPath = "./src/images";
    const endpoints: string[] = [];

    for await (const entry of Deno.readDir(imagesPath)) {
      if (entry.isDirectory) {
        endpoints.push(entry.name);
      }
    }

    endpoints.sort();

    return c.json({
      status: 200,
      error: null,
      message: "Internal Image API - Returns random images as binary data",
      endpoints: endpoints.map((endpoint) => `/${endpoint}`),
      totalCategories: endpoints.length,
    });
  } catch (_err) {
    return c.json(
      {
        status: 500,
        error: "Internal Server Error",
        message: "Failed to read images directory",
      },
      500,
    );
  }
});

app.get("/:category", async (c) => {
  const categoryName = c.req.param("category");
  const categoryPath = `./src/images/${categoryName}`;

  try {
    const stat = await Deno.stat(categoryPath);

    if (!stat.isDirectory) {
      throw new Error("Directory does not exist.");
    }

    return await sendRandomImage(c, categoryName);
  } catch (_err) {
    return c.json(
      {
        status: 404,
        error: "Not Found",
        message: `The endpoint '/${categoryName}' does not exist`,
      },
      404,
    );
  }
});

Deno.serve({ port: PORT, onListen: () => {} }, app.fetch);
log.info(`Listening on http://localhost:${PORT}/`);
