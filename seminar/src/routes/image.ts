// src/routes/imageRouter.ts
import express, { Request, Response } from "express";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() }); // 파일을 메모리에 저장
export const imageRouter = express.Router();

// 메모리에 저장할 배열
type ImageItem = {
  id: string;
  filename: string;
  mimeType: string;
  buffer: Buffer;
};
const images: ImageItem[] = [];

// 이미지 업로드
imageRouter.post(
  "/upload",
  upload.single("image"),
  (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ error: "image 파일이 필요합니다." });
    }

    const id = String(Date.now());
    images.push({
      id,
      filename: req.file.originalname,
      mimeType: req.file.mimetype,
      buffer: req.file.buffer,
    });

    res.json({ id });
  }
);

// 업로드된 이미지 목록 (피드용)
imageRouter.get("/list", (req: Request, res: Response) => {
  res.json(
    images.map((img) => ({
      id: img.id,
      filename: img.filename,
    }))
  );
});

// 실제 이미지 바이너리 응답
imageRouter.get("/:id", (req: Request, res: Response) => {
  const img = images.find((i) => i.id === req.params.id);
  if (!img) {
    return res.status(404).send("Not found");
  }
  res.setHeader("Content-Type", img.mimeType);
  res.send(img.buffer);
});
