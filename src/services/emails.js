import UserModel from '../models/users';
import sendUserFeedPublisher from '../utils/publishers/sendFeedPublisher';

export default class EmailService {
  constructor() {
    this.UserModel = UserModel;
  }

  sendUserFeed = async (userId, feed) => {
    try {
      sendUserFeedPublisher(userId, feed)
    } catch (err) {
      throw "Couldn't queue user feed: " + err;
    }
  }
}