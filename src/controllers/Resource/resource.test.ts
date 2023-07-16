import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { subscribe, saveAuthorsPosts, updateResources, syncAuthorsResources, getSubscriptions, unsubscribe } from '.';

import ResourceService from '../../services/resource.js';
import SubscriptionService from '../../services/subscription.js';
import { Sources } from '../../utils/constants';

jest.mock('../../services/resource.js');
jest.mock('../../services/subscription.js');

const mockEmail = 'test@example.com';
const mockAuthor = 'https://john-does-blog';
const mockSubscriptions = ['Author 1', 'Author 2'];
const mockSubscriptionIds = ['subscriptionId1', 'subscriptionId2'];
const mockPosts = [
  { title: 'Post 1', author: 'Author 1' },
  { title: 'Post 2', author: 'Author 2' },
];
const mockAuthorId = 'author123';
const mockResources = [
  { id: 1, title: 'Resource 1' },
  { id: 2, title: 'Resource 2' },
];

let req: Request;
let res: Response;
let next: NextFunction;

afterEach(() => {
  jest.restoreAllMocks();
});

beforeEach(() => {
  res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as any;
  next = jest.fn();
});

describe("Resource", () => {
  describe('subscribe', () => {
    beforeEach(() => {
      req = {
        body: {
          email: mockEmail,
          author: mockAuthor,
        },
      } as Request;
    });
    it('should subscribe to the author and return 200 with subscriptions', async () => {
      const subscribeMock = jest.spyOn(ResourceService.prototype, 'subscribe');
      const getUserSubscriptionsMock = jest.spyOn(SubscriptionService.prototype, 'getUserSubscriptions').mockResolvedValue(mockSubscriptions);

      const middleware = subscribe(Sources.MEDIUM);
      await middleware(req, res, next);

      expect(subscribeMock).toHaveBeenCalledWith(mockEmail, mockAuthor);
      expect(getUserSubscriptionsMock).toHaveBeenCalledWith(mockEmail);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 200,
        message: 'You are now subscribed to ' + mockAuthor,
        subscriptions: mockSubscriptions,
      });
    });
    it('should call the next function with the error if an error occurs', async () => {
      const subscribeMock = jest.spyOn(ResourceService.prototype, 'subscribe').mockRejectedValue(new Error('Some error'));

      const middleware = subscribe(Sources.MEDIUM);
      await middleware(req, res, next);

      expect(subscribeMock).toHaveBeenCalledWith(mockEmail, mockAuthor);
      expect(next).toHaveBeenCalledWith(new Error('Some error'));
    });
  });

  describe('saveAuthorsPosts', () => {
    beforeEach(() => {
      req = {
        body: {
          posts: mockPosts,
          source: 'source',
        },
      } as Request;
    });

    it('should save the authors posts and return 200', async () => {
      const saveAuthorsPostsMock = jest.spyOn(ResourceService.prototype, 'saveAuthorsPosts');

      const middleware = saveAuthorsPosts;
      await middleware(req, res, next);

      expect(saveAuthorsPostsMock).toHaveBeenCalledWith(mockPosts);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 200,
        message: 'Saved authors posts successfully',
      });
    });

    it('should call the next function with the error if an error occurs', async () => {
      const saveAuthorsPostsMock = jest.spyOn(ResourceService.prototype, 'saveAuthorsPosts').mockRejectedValue(new Error('Some error'));

      const middleware = saveAuthorsPosts;
      await middleware(req, res, next);

      expect(saveAuthorsPostsMock).toHaveBeenCalledWith(mockPosts);
      expect(next).toHaveBeenCalledWith(new Error('Some error'));
    });
  });

  describe('updateResources', () => {
    beforeEach(() => {
      req = {
        body: {
          resources: mockResources,
        },
      } as Request;
    });

    it('should update the resource summaries and return 200', async () => {
      const updateResourcesMock = jest.spyOn(ResourceService.prototype, 'updateResources');

      await updateResources(req, res, next);

      expect(updateResourcesMock).toHaveBeenCalledWith(mockResources);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 200,
        message: 'Updated resource summaries',
      });
    });

    it('should call the next function with the error if an error occurs', async () => {
      const updateResourcesMock = jest.spyOn(ResourceService.prototype, 'updateResources').mockRejectedValue(new Error('Some error'));

      await updateResources(req, res, next);

      expect(updateResourcesMock).toHaveBeenCalledWith(mockResources);
      expect(next).toHaveBeenCalledWith(new Error('Some error'));
    });
  });

  describe('syncAuthorsResources', () => {
    beforeEach(() => {
      req = {
        body: {
          posts: mockPosts,
          authorId: mockAuthorId,
        },
      } as Request;
    });

    it('should sync the authors resources and return 200', async () => {
      const saveAuthorsPostsMock = jest.spyOn(ResourceService.prototype, 'saveAuthorsPosts');

      await syncAuthorsResources(req, res, next);

      expect(saveAuthorsPostsMock).toHaveBeenCalledWith(mockPosts, mockAuthorId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 200,
        message: 'Synced resources',
      });
    });

    it('should call the next function with the error if an error occurs', async () => {
      const saveAuthorsPostsMock = jest.spyOn(ResourceService.prototype, 'saveAuthorsPosts').mockRejectedValue(new Error('Some error'));

      await syncAuthorsResources(req, res, next);

      expect(saveAuthorsPostsMock).toHaveBeenCalledWith(mockPosts, mockAuthorId);
      expect(next).toHaveBeenCalledWith(new Error('Some error'));
    });
  });

  describe('getSubscriptions', () => {
    beforeEach(() => {
      req = {
        body: {
          email: mockEmail,
        },
      } as Request;
    });

    it('should get user subscriptions and return 200', async () => {
      const getUserSubscriptionsMock = jest.spyOn(SubscriptionService.prototype, 'getUserSubscriptions').mockResolvedValue(mockSubscriptions);

      await getSubscriptions(req, res, next);

      expect(getUserSubscriptionsMock).toHaveBeenCalledWith(mockEmail);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        subscriptions: mockSubscriptions,
      });
    });

    it('should call the next function with the error if an error occurs', async () => {
      const getUserSubscriptionsMock = jest.spyOn(SubscriptionService.prototype, 'getUserSubscriptions').mockRejectedValue(new Error('Some error'));

      await getSubscriptions(req, res, next);

      expect(getUserSubscriptionsMock).toHaveBeenCalledWith(mockEmail);
      expect(next).toHaveBeenCalledWith(new Error('Some error'));
    });
  });

  describe('unsubscribe', () => {
    beforeEach(() => {
      req = {
        body: {
          email: mockEmail,
          subscriptionIds: mockSubscriptionIds,
        },
      } as Request;
    });

    it('should unsubscribe from the given subscriptionIds and return 200 with updated subscriptions', async () => {
      const unsubscribeMock = jest.spyOn(SubscriptionService.prototype, 'unsubscribe');
      const getUserSubscriptionsMock = jest.spyOn(SubscriptionService.prototype, 'getUserSubscriptions').mockResolvedValue(mockSubscriptions);

      await unsubscribe(req, res, next);

      expect(unsubscribeMock).toHaveBeenCalledWith(mockEmail, mockSubscriptionIds);
      expect(getUserSubscriptionsMock).toHaveBeenCalledWith(mockEmail);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 200,
        message: 'Successfully unsubscribed',
        subscriptions: mockSubscriptions,
      });
    });

    it('should call the next function with the error if an error occurs', async () => {
      const unsubscribeMock = jest.spyOn(SubscriptionService.prototype, 'unsubscribe').mockRejectedValue(new Error('Some error'));

      await unsubscribe(req, res, next);

      expect(unsubscribeMock).toHaveBeenCalledWith(mockEmail, mockSubscriptionIds);
      expect(next).toHaveBeenCalledWith(new Error('Some error'));
    });
  });
})
