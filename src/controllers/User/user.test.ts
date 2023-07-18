import { describe, expect, it, jest } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { userDetails, markSeenResources, pauseDigest, resumeDigest, enableSummary, disableSummary, setDigestFrequency } from '.';
import UserService from '../../services/users.js';

jest.mock('../../services/users.js');
const mockedUserService = UserService as jest.Mocked<typeof UserService>;

const mockUserId = 'userId';
const mockUser = {
  _id: 'userId',
  name: 'John Doe',
  email: 'johndoe@example.com',
  subscriptions: [],
  seenResources: []
};

const mockSeenResources = ['resource1', 'resource2'];

let req: Request;
let res: Response;
let next: NextFunction;

beforeEach(() => {
  req = {
    body: {
      userId: mockUserId,
      seenResources: mockSeenResources,
    },
  } as Request;
  res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as any;
  next = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('User', () => {
  describe('userDetails', () => {
    it('should get user details and return 200', async () => {
      const getUserByIdMock = jest.spyOn(UserService.prototype, 'getUserById').mockResolvedValue(mockUser);

      await userDetails(req, res, next);

      expect(getUserByIdMock).toHaveBeenCalledWith(mockUserId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 200,
        user: mockUser,
      });
    });

    it('should call the next function with the error if an error occurs', async () => {
      const getUserByIdMock = jest.spyOn(UserService.prototype, 'getUserById').mockRejectedValue(new Error('Some error'));

      await userDetails(req, res, next);

      expect(getUserByIdMock).toHaveBeenCalledWith(mockUserId);
      expect(next).toHaveBeenCalledWith(new Error('Some error'));
    });
  });

  describe('markSeenResources', () => {
    it('should mark the seen resources for the given userId and return 200', async () => {
      const markSeenResourcesMock = jest.spyOn(UserService.prototype, 'markSeenResources');

      console.log("MOckSeenResources", mockSeenResources);

      await markSeenResources(req, res, next);

      expect(markSeenResourcesMock).toHaveBeenCalledWith(mockUserId, mockSeenResources);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 200,
        message: 'Successfully mark resources as seen',
      });
    });

    it('should call the next function with the error if an error occurs', async () => {
      const markSeenResourcesMock = jest.spyOn(UserService.prototype, 'markSeenResources').mockRejectedValue(new Error('Some error'));

      await markSeenResources(req, res, next);

      expect(markSeenResourcesMock).toHaveBeenCalledWith(mockUserId, mockSeenResources);
      expect(next).toHaveBeenCalledWith(new Error('Some error'));
    });
  });

  describe('pauseDigest', () => {
    it('should pause the digest for the given userId and return 200', async () => {
      const pauseDigestMock = jest.spyOn(UserService.prototype, 'pauseDigest');

      await pauseDigest(req, res, next);

      expect(pauseDigestMock).toHaveBeenCalledWith(mockUserId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 200,
        message: 'Successfully paused digest',
      });
    });

    it('should call the next function with the error if an error occurs', async () => {
      const pauseDigestMock = jest.spyOn(UserService.prototype, 'pauseDigest').mockRejectedValue(new Error('Some error'));

      await pauseDigest(req, res, next);

      expect(pauseDigestMock).toHaveBeenCalledWith(mockUserId);
      expect(next).toHaveBeenCalledWith(new Error('Some error'));
    });
  });

  describe('resumeDigest', () => {
    it('should resume the digest for the given userId and return 200', async () => {
      const resumeDigestMock = jest.spyOn(UserService.prototype, 'resumeDigest');

      await resumeDigest(req, res, next);

      expect(resumeDigestMock).toHaveBeenCalledWith(mockUserId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 200,
        message: 'Successfully resumed digest',
      });
    });

    it('should call the next function with the error if an error occurs', async () => {
      const resumeDigestMock = jest.spyOn(UserService.prototype, 'resumeDigest').mockRejectedValue(new Error('Some error'));

      await resumeDigest(req, res, next);

      expect(resumeDigestMock).toHaveBeenCalledWith(mockUserId);
      expect(next).toHaveBeenCalledWith(new Error('Some error'));
    });
  });

  describe('enableSummary', () => {
    it('should enable the summary for the given userId and return 200', async () => {
      const enableSummaryMock = jest.spyOn(UserService.prototype, 'enableSummary');

      await enableSummary(req, res, next);

      expect(enableSummaryMock).toHaveBeenCalledWith(mockUserId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 200,
        message: 'Successfully enabled summary',
      });
    });

    it('should call the next function with the error if an error occurs', async () => {
      const enableSummaryMock = jest.spyOn(UserService.prototype, 'enableSummary').mockRejectedValue(new Error('Some error'));

      await enableSummary(req, res, next);

      expect(enableSummaryMock).toHaveBeenCalledWith(mockUserId);
      expect(next).toHaveBeenCalledWith(new Error('Some error'));
    });
  });

  describe('disableSummary', () => {
    it('should disable the summary for the given userId and return 200', async () => {
      const disableSummaryMock = jest.spyOn(UserService.prototype, 'disableSummary');

      await disableSummary(req, res, next);

      expect(disableSummaryMock).toHaveBeenCalledWith(mockUserId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 200,
        message: 'Successfully disable summary',
      });
    });

    it('should call the next function with the error if an error occurs', async () => {
      const disableSummaryMock = jest.spyOn(UserService.prototype, 'disableSummary').mockRejectedValue(new Error('Some error'));

      await disableSummary(req, res, next);

      expect(disableSummaryMock).toHaveBeenCalledWith(mockUserId);
      expect(next).toHaveBeenCalledWith(new Error('Some error'));
    });
  });

  describe('setDigestFrequency', () => {
    let mockUserId: string;
    let mockRequest: any;
    let mockResponse: any;
    let mockNext: NextFunction;

    beforeEach(() => {
      mockUserId = 'userId';
      mockRequest = {
        user: { _id: mockUserId },
        body: {
          frequencyType: 'daily',
          time: ['09:00'],
          days: ['monday', 'wednesday'],
          timeZone: 'UTC',
        },
      };
      mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      mockNext = jest.fn();
    })


    it('should set the digest frequency for the user and return 200', async () => {

      const setDigestFrequencyMock = jest.spyOn(UserService.prototype, 'setDigestFrequency')

      await setDigestFrequency(mockRequest, mockResponse, mockNext);

      expect(setDigestFrequencyMock).toHaveBeenCalledWith(mockUserId, {
        frequencyType: 'daily',
        time: ['09:00'],
        days: ['monday', 'wednesday'],
        timeZone: 'UTC',
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 200,
        message: 'Successfully updated users digest frequency',
      });
    });

    it('should call the next function with the error if an error occurs', async () => {
      const setDigestFrequencyMock = jest.spyOn(UserService.prototype, 'setDigestFrequency').mockRejectedValue(new Error('Some error'));

      await setDigestFrequency(mockRequest, mockResponse, mockNext);

      expect(setDigestFrequencyMock).toHaveBeenCalledWith(mockUserId, {
        frequencyType: 'daily',
        time: ['09:00'],
        days: ['monday', 'wednesday'],
        timeZone: 'UTC',
      });
      expect(mockNext).toHaveBeenCalledWith(new Error('Some error'));
    });
  });
})

