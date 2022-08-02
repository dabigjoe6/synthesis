import EmailService from '../services/emails.js';

export const sendEmails = (req, res, next) => {
  try {
    const { usersFeed } = req.body;

    const emailService = new EmailService();
    
    Object.keys(usersFeed).forEach((userId) => {
      emailService.sendUserFeed(userId, usersFeed[userId]);
    });

    return res.status(200).json({
      message: "User feeds sent out"
    });
    
  } catch (err) {
    console.error('Something went wrong, could not send uesr feed', err);
    next(err);
  }
}