const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});
const qs = require('qs');


exports.handler = function(event, context, callback) {

    const body = qs.parse(event.body);
    const payload = JSON.parse(body.payload);

    const sessionID = payload.callback_id;
    const response = payload.actions[0].value;
    const user = payload.user.name;

    const params = {
        TableName: 'slackResponses',
        Key: {
            "sessionID": sessionID
        },
        UpdateExpression: "set slackResponse = :slackResponse",
        ExpressionAttributeValues:{
            ":slackResponse": response
        },
        ReturnValues:"UPDATED_NEW"
    };

    docClient.update(params, function(err, data) {
        if (err) {
            callback(err, null);
        } else {
            // this is what will send a message back to slack - the body will appear as text
            callback(null, {"statusCode": 200, "body": `Thank you for responding, ${ user }`});
        }
    });

};
