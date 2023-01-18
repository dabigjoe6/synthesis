import SubscriptionService from "../services/subscription.js";

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
