import { NextFunction, Request, Response } from "express";

const AsyncWrapper =
  (func: Function) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await func(req, res, next);
    } catch (error: any) {
      res.status(error.code || 500).json({
        success: false,
        message: error.message,
      });
    }
  };

export default AsyncWrapper;
