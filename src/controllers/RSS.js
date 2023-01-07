import RSSService from "../services/rss.js";
import SubscriptionService from "../services/subscription.js";

export const subscribe = async (req, res, next) => {
  try {
    //TODO: Get email from looged in user
    const { email, author } = req.body;

    const rssService = new RSSService();
    await rssService.subscribe(email, author);

    const subscriptionService = new SubscriptionService();
    const subscriptions = await subscriptionService.getUserSubscriptions(email);

    return res.status(200).json({
      status: 200,
      message: "You are now subscribed to " + author,
      subscriptions,
    });
  } catch (err) {
    console.error("Couldn't subscribe to author - RSS.js", err);
    next(err);
  }
};
