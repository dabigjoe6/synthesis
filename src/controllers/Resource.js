import MediumService from "../services/medium.js";
import SubstackService from "../services/substack.js";
import RSSService from "../services/rss.js";
import SubscriptionService from "../services/subscription.js";
import { sources } from "../utils/constants.js";

const getServiceInstance = (source) => {
  switch (source) {
    case sources.MEDIUM:
      return new MediumService();
    case sources.SUBSTACK:
      return new SubstackService();
    case sources.RSS:
      return new RSSService();
    default:
      throw new Error("Service not recognised - Resource.js");
  }
};

export const subscribe = (source) => async (req, res, next) => {
  try {
    const { email, author } = req.body;

    const serviceInstance = getServiceInstance(source);
    await serviceInstance.subscribe(email, author);

    const subscriptionService = new SubscriptionService();
    const subscriptions = await subscriptionService.getUserSubscriptions(email);

    return res.status(200).json({
      status: 200,
      message: "You are now subscribed to " + author,
      subscriptions,
    });
  } catch (err) {
    console.error("Couldn't subscribe to author - Resource.js", err);
    next(err);
  }
};


export const getSubscriptions = async (req, res, next) => {
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

export const unsubscribe = async (req, res, next) => {
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
