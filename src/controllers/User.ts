import { Request, Response, NextFunction } from "express";
import UserService from '../services/users.js';

export const markSeenResources = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, seenResources } = req.body;

    const userService = new UserService();
    await userService.markSeenResources(userId, seenResources);

    return res.status(200).json({
      status: 200,
      message: "Successfully mark resources as seen",
    });
  } catch (err) {
    console.error("Couldn't unsubscribe", err);
    next(err);
  }
};
