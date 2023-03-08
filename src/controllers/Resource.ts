import { Request, Response, NextFunction } from "express";
import SubscriptionService from "../services/subscription.js";
import ResourceService from "../services/resource.js";
import { Sources } from "../utils/constants.js";

export const subscribe = (source: Sources) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, author } = req.body;

    const serviceInstance = new ResourceService(source);
    await serviceInstance.subscribe(email, author);

    const subscriptionService = new SubscriptionService();
    const subscriptions = await subscriptionService.getUserSubscriptions(email);

    return res.status(200).json({
      status: 200,
      message: "You are now subscribed to " + author,
      subscriptions,
    });
  } catch (err) {
    console.error("Couldn't subscribe to author - Resource.ts", err);
    next(err);
  }
};

export const saveAuthorsPosts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { posts, source } = req.body;

    const serviceInstance = new ResourceService(source);
    await serviceInstance.saveAuthorsPosts(posts);

    return res.status(200).json({
      status: 200,
      message: "Saved authors posts succesfully",
    });
  } catch (err) {
    next(err);
  }
}

export const updateResourceSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { resources } = req.body;
    const serviceInstance = new ResourceService(Sources.MEDIUM);
    await serviceInstance.updateResourceSummary(resources);

    return res.status(200).json({
      status: 200,
      message: "Updated resource summaries",
    });
  } catch (err) {
    next(err)
  }
}


export const getSubscriptions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    const subscriptionService = new SubscriptionService();
    const subscriptions = await subscriptionService.getUserSubscriptions(email);

    return res.status(200).json({
      subscriptions,
    });
  } catch (err) {
    console.error("Couldn't get user subscriptions", err);
    next(err);
  }
};

export const unsubscribe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, subscriptionIds } = req.body;

    const subscriptionService = new SubscriptionService();
    await subscriptionService.unsubscribe(email, subscriptionIds);

    const subscriptions = await subscriptionService.getUserSubscriptions(email);

    return res.status(200).json({
      status: 200,
      message: "Successfully unsubscribed",
      subscriptions,
    });
  } catch (err) {
    console.error("Couldn't unsubscribe", err);
    next(err);
  }
};
