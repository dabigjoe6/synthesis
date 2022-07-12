import MediumService from "../services/medium.js";

export const subscribe = async (req, res, next) => {
  try {
    //TODO: Get email from looged in user
    const { email, author } = req.body;

    const mediumService = new MediumService();
    await mediumService.subscribe(email, author);

    return res.status(200).json({
      message: "You are now subscribed to " + author
    });

  } catch (err) {
    console.error("Couldn't subscribe to author - Medium.js", err);
    next(err);
  }
};
