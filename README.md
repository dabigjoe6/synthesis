# morning-brew

https://app.swaggerhub.com/apis/dabigjoe6/Morningbrew/1.0.0

Receive daily email digest of the links to the most important and forgotten articles from your favourite authors on Medium, Twitter, newsletters, and other sources.

## Motivation
On a weekend, I clicked on several links to articles on the Netflixtechblog on Medium, and the more I read, the more I found articles that I was really interested in reading, some of which were from as far back as 2015. Then I began to wonder what it would be like to receive a daily digest of every one of these articles along with any new ones from Netflictechblog. Because of this, I made Morningbrew.

## Architecture
![Morningbrew - Overview](https://user-images.githubusercontent.com/20970329/196035399-cced71fb-1b7e-4139-a15b-5c23c671a4a7.png)


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
SENDGRID_API_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NO_OF_POSTS_SENT_TO_USERS=1
RABBITMQ_URL=amqp://localhost
```
