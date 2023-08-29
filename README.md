# Synthesis

https://app.swaggerhub.com/apis/dabigjoe6/Synthesis/1.0.0

Receive daily email digest of the links to the most important and forgotten articles from your favourite authors on Medium, Substack, RSS, and other sources.

Coming soon: Twitter, Newsletters

## Motivation

As I explored the Netflixtechblog on Medium, I was captivated by the wealth of knowledge and insights contained within its pages. I imagined a curated daily digest of all the articles, inclusive of the latest and greatest from this community of tech experts. This led to the birth of Synthesis, a personalized newsletter providing a convenient means to keep up with the previous and latest resources or articles from your favorite authors.

## Architecture

![Synthesis - Overview](https://user-images.githubusercontent.com/20970329/218279048-324427b5-2342-4d63-b3c5-9412b99e89cc.png)

## Web Client
https://github.com/dabigjoe6/synthesis-client

## Lambda functions
https://github.com/dabigjoe6/synthesis-functions

## Prerequisite

- Setup rabbitmq
- Setup nodejs

## Development

```
npm i
npm run dev
```

### .env template

```
MONGO_URI=__MONGO_URI__
DB_PASSWORD=XXXXXXXXXXXXXXXXXXXX
SENDGRID_API_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NO_OF_POSTS_SENT_TO_USERS=1
NODE_ENV=development
CLIENT_BASE_URL=http://localhost:3000
SYNC_HOURS=4
FROM=your_email@email.com
JWT_SECRET=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
GOOGLE_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
GOOGLE_CLIENT_SECRET=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
OPENAI_API_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
SQS_QUEUE=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```
