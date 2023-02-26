# awesome-github-srv

This is the backend (related repositories: [frontend](https://github.com/ajeecai/awesome-github-ui), [chatgpt proxy](https://github.com/ajeecai/chatgpt-io)) of a cloud hosted service which provides interesting insights of GitHub resource:

- Current number of repositories under different language categories.
- Repository star trending of each language.
- Newsletters sent to the topic subscribers weekly.
- Some funny anecdote about open source code in GitHub.
- An experiment talking with chatgpt about GitHub (or something else).

Service running on a free aws account with limited quota: https://asgithub.com

## motivation

see [here](https://asgithub.com/about)

## technology

aws serverless (lambda, IAM, s3, dynamoDb, SES, SNS, CloudWatch, etc.) + bigquery

## Todo

- Due to free account for aws and google, not sure if the quota will run up for high volume of visits.
- githubarchive in bigquery is not updated frequently, so the number of repositories looks unchanged.
