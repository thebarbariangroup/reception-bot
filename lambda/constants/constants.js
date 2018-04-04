const AWS = require('aws-sdk');
const DB = new AWS.DynamoDB({region: 'us-east-1', apiVersion: '2012-08-10'});

const constants = Object.freeze({
    appId: process.env.APP_ID, // DEV vs PROD

    // DynamoDB Table Name
    // *This would allow you to save a retrieve user sessions
    // dynamoDBTableName : 'barbUsers',

    // Skill States
    states : {
        LAUNCH            : '_LAUNCH',
        ONBOARDING        : '_ONBOARDING',
        CONTACT           : '_CONTACT'
    },

    docClient: DB,

    CONTACT_FALLBACK: {
      id: process.env.FALLBACK_ID,
      name: "reception"
    },

    COMPANY_NAME: process.env.COMPANY_NAME,
    WELCOME_MESSAGE: 'I can help you contact an employee. You can say, "I am here to see..." followed by an employee\'s name, and I will contact them directly to let them know you are here.',
    SHUTDOWN_MESSAGE: `Thank you for using ${ this.COMPANY_NAME }, let me know if there is anything else I can do for you`,
    HELP_MESSAGE: "I can help you.",
    HELP_REPROMPT: "What can I help you with?",
    STOP_MESSAGE: "Goodbye!",
    ERROR_MESSAGE: "Sorry, I didn't get that."

});

module.exports = constants;
