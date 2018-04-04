# Alexa + Slack ReceptionBot

### Table of Contents
1. [Introduction](#introduction)

2. [Slack App and backend services](#slack-app-and-backend-services)
    * [Create a Slack App](#create-a-slack-app)
    * [Set up the Backend App](#set-up-the-backend-app)  

3. [ReceptionBot Skill](#receptionbot-skill)
    * [Create an Alexa Developer Account](#create-an-alexa-developer-account)
    * [Create an Alexa Skill](#create-an-alexa-skill)
    * [Create a Lambda function](#create-a-lambda-function)
    * [Install and Configure the AWS CLI](#install-and-configure-the-aws-cli)
    * [Setting up Local Lambda Development](#setting-up-local-lambda-development)
    * [Update the Lambda With Your Local Changes](#update-the-lambda-with-your-local-changes)
    * [Testing the skill](#testing-the-skill)
    * [Creating separate skills for Dev and QA](#creating-separate-skills-for-dev-and-qa)
4. [Slack Responses App](#slack-response-app)
    * [Slack Responses management](#slack-responses-management)
    * [DynamoDB](#dynamodb)
    * [IAM](#iam)
    * [Slack Responses Lambda](#slack-responses-lambda)
5. [Contributing to this repo](#contributing-to-this-repo)
6. [Resources](#resources)

# Introduction
reception-bot is the main repo for an Alexa-based reception that connects to Slack. There are five different components to allow Alexa to connect to Slack for two way communication. This repo is the starting point and will outline the primary setup of Slack, the Alexa Skill and necessary AWS services. There are two other repos for the backend which connects the Alexa Skill to your Slack users and allows user management.

The basic use case we developed for is enabling a visitor to your company to contact an employee via Alexa and Slack. Once the visitor finds the employee they are meeting, Alexa will send the employee a message with the visitor's name and reason for visit. The employee will be able to respond with one of three pre-determined responses, which Alexa will then relay to the visitor. If the employee does not respond within 30 seconds Alexa will interrupt to see if the visitor would like to continue, restart, exit or needs help.

# Slack App and backend services

## Create a Slack App
1. Log into <https://api.slack.com/apps>
2. Click **Create New App**. Enter an app name and select the workspace associated with the app
3. Add a **Bot User** by clicking the **Bot Users** item in the menu, change the name as needed and click **Save Changes**, you can optionally set **Always Show My Bot as Online** to **On**.
4. **Activate App to Workspace**. Click on **Install App** on left hand menu and then click **Install App to Workspace** and then click **Authorize**
5. In **OAuth & Permissions** menu you should now see tokens for **OAuth Access Token** and **Bot User OAuth Access Token**. You will need these later.

## Set up the Backend App
Clone or download <https://github.com/thebarbariangroup/reception-slackbot-be> and <https://github.com/thebarbariangroup/reception-slackbot-fe>. Further details on how to build and set up the apps are within the READMEs of the respective repos.

# ReceptionBot Skill

## Create an Alexa Developer Account
Create an account at <https://developer.amazon.com/alexa>

## Create an Alexa Skill
### Once signed in to your developer account:
1. In the main nav, go to **Alexa Skill Kit**, then **Start a Skill**.
2. In the Alexa Developer Console, click **Create Skill**.
3. Then enter a name for your skill and click **Next**.
4. Select the \"Custom Model\" and click **Create Skill**. You will be taken to the Skill Builder interface.

### In the Skill Builder interface:
1. Click \"**JSON Editor**\" in the left panel under Interaction Model.
2. Paste in the contents of this repo's `baseInteractionModel.json`, *update the invocation name*, then click \"**Save Model**\", then
\"**Build Model**\". This will add the base data needed to run the skill, including intents, utterances, slots, and slot values.
    * Replace our placeholder invocation name with one of your choosing or the Build will error & fail
    * We call ours [\"Barb\"](https://static0.srcdn.com/wp-content/uploads/2016/08/Stranger-Things-Barb.jpg)
3. Click \"**Interfaces**\" in the left panel below the \"Interaction Model\" tab, then toggle on the \"Display Interface\"
4. Customize the model for your purposes
    * Add to the \"EmployeeFirstNames\" slot values array
      * It is not necessary to add an object (w/ value prop) for every unique first name in your directory, but it can help Alexa better understand the conversation.
      * *However*, for names that are less common, foreign/\"non-traditional\" to the U.S., have a special/unique pronunciation, often mispronounced, nicknames, or are associated with nicknames, it is highly recommended that you add alternate pronunciations as `synonyms` in the slot's synonyms array. This allows Alexa to associate the pronunciation with the name value such that, when Alexa then matches the synonym during the visitor dialog, our skill will correctly display the desired value for the name.
      * Examples:
        * `"name": {
            "value": "Will",
            "synonyms": [ "William", "Bill", "Billy"]
          }`
        * `"name": {
            "value": "Kyu",
            "synonyms": [ "Q", "Cue", "Kai you", "Key oo" ]
          }`
5. Build Model by clicking the **Build Model** button in the checklist
6. After the model builds successfully, click on **Endpoint**
    * Select **AWS Lambda ARN**
    * Grab the Skill ID as an \"AWS Lambda ARN\" - you will need this to create your Lambda function.

## Create a Lambda Function
1. [Create an AWS account](https://aws.amazon.com/console/ "AWS Console") and add a new Lambda Function via the AWS Developer Console
    * Click the region drop-down \(in the upper-right corner of the console\) and select the appropriate region for your Alexa skill\(s\).
      * Only 4 regions support Alexa Skills: Asia Pacific (Tokyo), EU (Ireland), US East (N. Virginia), or US West (Oregon)
2. Name your function however you want
3. Select \"Node.js 6.10\" runtime
4. Defining a Role for the Lambda
    * For **Role** (under Lambda function handler and role), select **Create new role from template(s)**.
    * Enter the Role Name.
    * From the Policy templates list, select \"Simple Microservice permissions\".
5. Click \"**Create Function**\"
6.  Add an \"**Alexa Skills Kit**\" trigger to the Lambda
    * In \"**Configure Triggers**\", paste the Skill ID of your Alexa Skill that you copied from the Skill Builder.
7. Add Environmental Variables. Create these new keys:
    * `SLACK_API_TOKEN` - paste in the OAuth Access Token from your Slack app.
    * `SLACK_BOT_TOKEN` - paste in the Bot User OAuth Access Token from your Slack app.
    * `USER_API_TOKEN` - paste in the code generated in the backend application you set up earlier.
    * `APP_ID` - paste in the Alexa Skill ID.
    * `SERVER_URL` - the URL where you are hosting the `reception-slackbot-be`
    * `FALLBACK_ID` - paste in the Slack ID for whichever user or channel you would like to set up as a \"fallback\", when the desired employee is unavailable.
    * `COMPANY_NAME` - your company name
8. Under **Basic Settings** change the timeout to 1 minute.
9. **Save** changes and copy the ARN which is located at the top right of the console. For reference: the code should start with `arn:aws:lambda:[selected-region]` and end with the name of your Lambda function
10. Return to your Alexa Skill in the Skill Builder.
11. Paste your lambda ARN code into the Default Region field and click **Save Endpoints**

## Install and Configure the AWS CLI
1. Follow these installation instructions: <https://docs.aws.amazon.com/cli/latest/userguide/installing.html>
2. Follow these configuration insturctions: <https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html>
3. Optional: install `cwtail` so you can view the Amazon AWS CloudWatch Logs from the command line. This comes in handy when debugging the skill. <https://www.npmjs.com/package/cwtail>

## Setting up Local Lambda Development
Pull down this repo, navigate into the `lambda/` folder, and run `npm install`. Make sure that you are using the same Node version being used for your Lambda's runtime.

## Update the Lambda with Your Local Changes
1. In `publish_lambda.sh`, replace `[yourLambdaFunctionName]` and `[yourProfileName]` with the name of your Lambda function name and your AWS profile name, respectively (if applicable).
2. Whenever you are ready to push your changes to your Lambda, run the `bash publish_lambda.sh` in the project root.

## Testing the skill
You can test your skill by using an actual Alexa View device, or by using the testing utility in the Skill Builder located under the \"**Test**\" tab.

## Creating Dev (& QA) and Production \"Environments\"
Depending on your workflow, you may need the ability to develop separately in parallel with QA, or simply have testing and production codebases.
You will need to create a separate skill (with unique invocation names) for each branch. These separate skills will then leverage the different branches/"aliases" of your lambda function.
1. In a new tab, navigate to the [Alexa Developer console](https://developer.amazon.com/alexa) and create a new skill
    * If you intend to use the same skills on any single Alexa compatible device, the invocation name(s) need to be unique.
2. Follow [these instructions](https://docs.aws.amazon.com/lambda/latest/dg/versioning-aliases.html) for creating Lambda aliases
    * **IMPORTANT:** *Before you publish a new version of your function*, update the lambda's environment variable `APP_ID` with the new Alexa Skill ID and **save**.
    * Assign the alias to the new version
    * **Don't forget to set the APP_ID env variable back on your `$LATEST` version**
    * Each alias now has a unique, qualified ARN
3. In the lambda \"Configuration\" interface, you will need to add the \"**Alexa Skills Kit**\" trigger to your lambda alias
    * Add the new Alexa Skill ID to the \"**Alexa Skills Kit**\" trigger configuration on the new lambda alias

**NOTE:** Amazon does not currently support custom environment variables by *alias*, only by *version*. :(

# Slack Responses App
## Slack Responses management
Since the default session management used by Alexa is per device we needed to find a way to track a session and the responses. Our solution is to record the sessionID created and the response in DynamoDB and check against the existing of the value. If the session has no response we continue contacting the user, if a response is found we alert the visitor to the response and end the session.
In order to finish the conversation loop you will need to setup another lambda function, API Gateway and DynamoDB to track if a user has responded and get the response.

## DynamoDB
Log into your AWS Console and Click on **DynamoDB**.
1. Click \"**Create a Table**\"
2. Name the table \"slackResponses\" and use `sessionID` as the Primary key.
3. Click \"**Create**\"

##IAM
From the AWS console select IAM
1. Click on \"**Roles**\" on the left
2. Click \"**Create Role**\"
3. Select Lambda and click \"**Next: Permissions**\"
4. Search for \"AWSLambdaFullAccess\" in the filter
5. Check the box next to \"AWSLambdaFullAccess\" and click \"**Next: Review**\"
6. Name the role and click \"**Create Role**\"

## Slack Responses Lambda
Log into your AWS Console and select Lambda
1. Name your function however you want, we chose \"reception_slack_response\"
2. Select \"Node.js 6.10\" runtime
3. Keep Role as \"Choose Existing Role\" and then select the role created above
4. Click \"**Create function**\"
5. Add \"API Gateway\" as a trigger and then click \"**Save**\"


## API Gateway
Return to the Services page of your AWS Console and open API Gateway
1. Click on \"**+Create API**\"
2. Enter \"slack_responses\" as the API name, use \"Proxy for Lambda\" as the description and leave all other values at default
3. Click \"**Create API**\"
4. In the page that opens click the \"**Actions**\"  dropdown and select \"Create Resource\"
5. In the new page enter \"reception_slack_response\" as the Resource Name and click \"**Create**\"
6. Click on the \"Actions\" dropdown again and select \"Create Method\"
7. A row with a select field will appear, click on the select field and choose ANY and then click the checkmark icon that appears
8. In the new page that appears keep the Integration Type as-is, check \"Use Lambda Proxy integration\" and enter the name of the Lambda created in above.

### Deploy
1. Click \"**Actions**\" and select \"Deploy API\"
2. In the pop up modal, select the Deployment Stage select field and choose \"[New Stage]\"
3. Enter whatever you want in the Stage name, \"prod\" or \"stage\" are common
4. Copy the \"Invoke URL\" on the new page

## Slack App Interactive Components
Return to your slack app
1. Go to \"Interactive Components\"
2. Enter the Invoke URL you copied from API Gateway and paste into Request URL and add \"/<name of the response lambda>\"
3. Click \"**Save changes**\"



# Contributing to this repo

# Resources
