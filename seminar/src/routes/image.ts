// src/routes/imageRouter.ts
import express, { Request, Response } from "express";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });
export const imageRouter = express.Router();

type ImageItem = {
  id: string;
  filename: string;
  mimeType: string;
  buffer: Buffer;
};

const images: ImageItem[] = [];

// 새 이미지 업로드 (추가)
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

// 목록
imageRouter.get("/list", (req: Request, res: Response) => {
  res.json(
    images.map((img) => ({
      id: img.id,
      filename: img.filename,
    }))
  );
});

// 실제 이미지
imageRouter.get("/:id", (req: Request, res: Response) => {
  const img = images.find((i) => i.id === req.params.id);
  if (!img) {
    return res.status(404).send("Not found");
  }
  res.setHeader("Content-Type", img.mimeType);
  res.send(img.buffer);
});

// 현재 이미지 교체 (PUT)
imageRouter.put(
  "/:id",
  upload.single("image"),
  (req: Request, res: Response) => {
    const img = images.find((i) => i.id === req.params.id);
    if (!img) {
      return res.status(404).json({ error: "이미지를 찾을 수 없습니다." });
    }
    if (!req.file) {
      return res.status(400).json({ error: "image 파일이 필요합니다." });
    }

    img.filename = req.file.originalname;
    img.mimeType = req.file.mimetype;
    img.buffer = req.file.buffer;

    res.json({ message: "이미지가 교체되었습니다.", id: img.id });
  }
);

// 현재 이미지 삭제 (DELETE)
imageRouter.delete("/:id", (req: Request, res: Response) => {
  const idx = images.findIndex((i) => i.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: "이미지를 찾을 수 없습니다." });
  }

  images.splice(idx, 1);
  res.json({ message: "이미지가 삭제되었습니다." });
});

export default imageRouter;