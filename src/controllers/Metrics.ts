import { Request, Response, NextFunction } from 'express';
import MetricsService from '../services/metrics.js';

export const numberOfUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const metricsService = new MetricsService();
    const numberOfUsers = await metricsService.getNumberOfUsers();

    return res.status(200).json({
      status: 200,
      numberOfUsers,
    });

  } catch (err) {
    console.error("Couldn't get total number of users: ", err);
    next(err);
  }
}

export const numberOfEmailsSent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { range } = req.body;
    const metricsService = new MetricsService();
    const { totalDelivered, totalOpened } = await metricsService.getEmailMetrics(range);

    return res.status(200).json({
      status: 200,
      totalDelivered,
      totalOpened
    });

  } catch (err) {
    console.error("Couldn't get total number of emails sent: ", err);
    next(err);
  }
}


export const numberOfUsersWithSummaries = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const metricsService = new MetricsService();
    const usersWithSummariesEnabled = await metricsService.getNumberOfUsersWithSummariesEnabled();

    return res.status(200).json({
      status: 200,
      usersWithSummariesEnabled
    });

  } catch (err) {
    console.error("Couldn't get total number of emails sent: ", err);
    next(err);
  }
}

export const numberOfPausedDigests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const metricsService = new MetricsService();
    const usersWithPausedDigest = await metricsService.getNumberOfUsersWithPausedDigest();

    return res.status(200).json({
      status: 200,
      usersWithPausedDigest
    });

  } catch (err) {
    console.error("Couldn't get total number of emails sent: ", err);
    next(err);
  }
}

export const numberOfSubscriptions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const metricsService = new MetricsService();
    const numberOfSubscriptions = await metricsService.getNumberOfSubscriptions();

    return res.status(200).json({
      status: 200,
      numberOfSubscriptions
    });

  } catch (err) {
    console.error("Couldn't get total number of emails sent: ", err);
    next(err);
  }
}

export const averageNumberOfSubscriptions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const metricsService = new MetricsService();
    const averageNumberOfSubscriptions = await metricsService.getAverageNumberOfSubscriptions();

    return res.status(200).json({
      status: 200,
      averageNumberOfSubscriptions
    });

  } catch (err) {
    console.error("Couldn't get total number of emails sent: ", err);
    next(err);
  }
}

export const topSubscriptions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const metricsService = new MetricsService();
    const topSubscriptions = await metricsService.getTopSubscriptions();

    return res.status(200).json({
      status: 200,
      topSubscriptions
    });

  } catch (err) {
    console.error("Couldn't get total number of emails sent: ", err);
    next(err);
  }
}