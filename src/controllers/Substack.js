import SubstackService from "../services/substack.js";
import SubscriptionService from "../services/subscription.js";

export const subscribe = async (req, res, next) => {
  try {
    //TODO: Get email from looged in user
    const { email, author } = req.body;

    const substackService = new SubstackService();
    await substackService.subscribe(email, author);

    const subscriptionService = new SubscriptionService();
    const subscriptions = await subscriptionService.getUserSubscriptions(email);

    return res.status(200).json({
      message: "You are now subscribed to " + author,
      subscriptions,
    });
  } catch (err) {
    console.error("Couldn't subscribe to author - Substack.js", err);
    next(err);
  }
};
