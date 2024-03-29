import { Request, Response, NextFunction } from "express";
import { FrequencyType, WeekDays } from "../../models/users.js";
import UserService from '../../services/users.js';

export const userDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.body;

    const userService = new UserService();
    const user = await userService.getUserById(userId);

    return res.status(200).json({
      status: 200,
      user,
    });

  } catch (err) {
    console.error("Couldn't get user details ", err);
    next(err);
  }
}

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

export const pauseDigest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.body;

    const userService = new UserService();
    await userService.pauseDigest(userId);

    return res.status(200).json({
      status: 200,
      message: "Successfully paused digest",
    });
  } catch (err) {
    console.error("Couldn't pause user digest", err);
    next(err);
  }
};

export const resumeDigest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.body;

    const userService = new UserService();
    await userService.resumeDigest(userId);

    return res.status(200).json({
      status: 200,
      message: "Successfully resumed digest",
    });
  } catch (err) {
    console.error("Couldn't resume user digest", err);
    next(err);
  }
};


export const enableSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.body;

    const userService = new UserService();
    await userService.enableSummary(userId);


    return res.status(200).json({
      status: 200,
      message: "Successfully enabled summary"
    });
  } catch (err) {
    console.error("Couldn't enable summary", err);
    next(err);
  }
}

export const disableSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.body;

    const userService = new UserService();
    await userService.disableSummary(userId);


    return res.status(200).json({
      status: 200,
      message: "Successfully disable summary"
    });
  } catch (err) {
    console.error("Couldn't disable summary", err);
    next(err);
  }
}

interface RequestWithUser extends Request {
  user: any;
}

export const setDigestFrequency = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const { _id } = req.user;
    const frequencyType: FrequencyType = req.body.frequencyType;
    const time: Array<string> = req.body.time;
    const days: Array<WeekDays> | undefined = req.body?.days;
    const timeZone: string = req.body.timeZone;

    const userService = new UserService();
    await userService.setDigestFrequency(_id, {
      frequencyType,
      time,
      days,
      timeZone
    });

    return res.status(200).json({
      status: 200,
      message: "Successfully updated users digest frequency",
    });
  } catch (err) {
    console.error("Couldn't update users digest frequency");
    next(err);
  }
};