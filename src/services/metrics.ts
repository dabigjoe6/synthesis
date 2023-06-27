import mongoose from "mongoose";
import moment from "moment";
import client from "@sendgrid/client";
import UserModel, { UserI } from '../models/users.js';
import AuthorModel, { AuthorI } from '../models/authors.js';

enum Range {
  "week" = "week",
  "month" = "month",
  "three_month" = "three_months"
}

export default class MetricsService {
  UserModel: mongoose.Model<UserI>;
  AuthorModel: mongoose.Model<AuthorI>;

  constructor() {
    this.UserModel = UserModel;
    this.AuthorModel = AuthorModel;
  }

  getNumberOfUsers = async () => {
    try {
      return (await this.UserModel.countDocuments());
    } catch (err) {
      console.error("Could not get total number of users: ", err);
      throw err;
    }
  }

  getEmailMetrics = async (range: Range) => {
    try {
      const { startDate, endDate } = this.getStartAndEndDates(range);

      const queryParams = {
        "start_date": startDate,
        "end_date": endDate,
        "aggregated_by": "week"
      };

      const request = {
        url: `/v3/stats`,
        method: 'GET' as const,
        qs: queryParams
      };

      if (process.env.SENDGRID_API_KEY) {
        client.setApiKey(process.env.SENDGRID_API_KEY);
      } else {
        throw Error("No SENDGRID_API_KEY found")
      }

      const [response] = await client.request(request)

      let totalDelivered = 0;
      let totalOpened = 0;
      const responseBody = (response.body) as Array<{ date: string; stats: Array<{ metrics: { delivered: number; unique_opens: number } }>; }>

      responseBody.forEach(item => {
        totalDelivered += item.stats[0].metrics.delivered;
        totalOpened += item.stats[0].metrics.unique_opens;
      })

      return { totalDelivered, totalOpened }

    } catch (err) {
      console.error("Could not get total number of emails: ", err);
      throw err;
    }
  }

  getNumberOfUsersWithSummariesEnabled = async () => {
    try {
      return (await this.UserModel.countDocuments({ 'settings.isSummaryEnabled': true }));
    } catch (err) {
      console.error("Could not get total number of users with summary enabled: ", err);
      throw err;
    }
  }

  getNumberOfUsersWithPausedDigest = async () => {
    try {
      return (await this.UserModel.countDocuments({ 'settings.isDigestPaused': true }));
    } catch (err) {
      console.error("Could not get total number of users with paused digest: ", err);
      throw err;
    }
  }

  getNumberOfSubscriptions = async () => {
    try {
      const aggregateResult = await this.UserModel.aggregate([
        {
          $project: {
            totalSubscriptions: { $size: '$subscriptions' },
          },
        },
        {
          $group: {
            _id: null,
            totalSubscriptions: { $sum: '$totalSubscriptions' },
          },
        },
      ]);

      return aggregateResult[0]?.totalSubscriptions || 0;
    } catch (err) {
      console.error("Could not get total number of subscriptions", err);
      throw err;
    }
  }

  getAverageNumberOfSubscriptions = async () => {
    try {
      const aggregateResult = await this.UserModel.aggregate([
        {
          $group: {
            _id: null,
            averageSubscriptions: { $avg: { $size: '$subscriptions' } },
          },
        },
      ]);

      return aggregateResult[0]?.averageSubscriptions || 0;
    } catch (err) {
      console.error("Could not get average number of subscriptions", err);
      throw err;
    }
  }

  getTopSubscriptions = async () => {
    try {
      const aggregateResult = await this.UserModel.aggregate([
        { $unwind: '$subscriptions' },
        {
          $group: {
            _id: '$subscriptions',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 3 },
      ]);

      const topSubscriptionIds = aggregateResult.map(
        (result) => result._id.toString()
      );

      return (await this.AuthorModel.find({ _id: { $in: topSubscriptionIds } })).map(author => ({ url: author.url, name: author.name }))
    } catch (err) {
      console.error("Could not get top subscriptions", err);
      throw err;
    }
  }

  private getStartAndEndDates = (range: Range) => {
    const today = moment().startOf('day');
    let startDate, endDate;

    if (range === 'week') {
      startDate = today.clone().subtract(1, 'week').startOf('isoWeek');
      endDate = today.clone().subtract(1, 'week').endOf('isoWeek');
    } else if (range === 'month') {
      startDate = today.clone().subtract(1, 'month').startOf('month');
      endDate = today.clone().subtract(1, 'month').endOf('month');
    } else if (range === 'three_months') {
      startDate = today.clone().subtract(3, 'months').startOf('month');
      endDate = today.clone().subtract(1, 'month').endOf('month');
    }

    if (startDate && endDate) {
      return {
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
      };
    } else {
      throw Error("Could not get startDate or endDate")
    }
  }
}