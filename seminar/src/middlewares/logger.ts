import { Request, Response, NextFunction } from "express";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const now = new Date().toISOString(); // 현재 시각 (ISO 문자열)

  console.log(`[${now}] ${req.method} ${req.path}`);

  next();
}