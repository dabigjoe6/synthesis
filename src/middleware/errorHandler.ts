import { Request, Response, NextFunction} from "express";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (!err.status) {
    res.status(500);
  } else {
    res.status(err.status);
  }
  res.json({
    status: err.status,
    message: err?.message,
    stack: err?.stack,
  });
};
