import express, { Request, Response } from "express";
import fs from "fs";

const app = express();
app.use(express.static("public"));

app.get("/", (req: Request, res: Response) => {
  res.sendFile(__dirname + "/../index.html");
});

app.get("/video", (req: Request, res: Response) => {
  const range = req.headers.range;

  if (!range) {
    return res.sendStatus(416);
  }

  const videoPath = __dirname + "/../public/movie.mp4";
  const videoSize = fs.statSync(videoPath).size;

  const CHUNK_SIZE = 10 ** 6; // 1MB

  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

  const contentLength = end - start + 1;

  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };

  res.writeHead(206, headers);

  const videoStream = fs.createReadStream(videoPath, {
    start,
    end,
  });

  videoStream.pipe(res);
});

app.listen(3000, () => {
  console.log("[INFO] Server is running on port 3000");
});
