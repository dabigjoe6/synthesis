import UserModel from "../models/users.js";
import sendUserFeedPublisher from "../utils/publishers/sendFeedPublisher.js";

export default class EmailService {
  constructor() {
    this.UserModel = UserModel;
  }

  sendUserFeed = async (userId, feed) => {
    try {
      sendUserFeedPublisher(userId, feed);
    } catch (err) {
      throw "Couldn't queue user feed: " + err;
    }
  };
}
