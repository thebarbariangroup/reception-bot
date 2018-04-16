const request = require('request-promise');


module.exports = {
  PostWithOptions: (id, message) => {
      const token = process.env.SLACK_API_TOKEN || '';

      return new Promise((resolve, reject) => {
          request.post('https://slack.com/api/chat.postMessage', {
              form: {
                  token: token,
                  channel: id,
                  "as_user": false,
                  "attachments": JSON.stringify([{
                      "text": message.text,
                      "fallback": message.text,
                      "color": "#3AA3E3",
                      "attachment_type": "default",
                      "callback_id": message.sessionID, //store sessionid here
                      "actions": [
                          {
                              "name": "response",
                              "text": "I'm on my way",
                              "type": "button",
                              "value": "I'm on my way"
                          },
                          {
                              "name": "response",
                              "text": "Give me 5 minutes",
                              "type": "button",
                              "value": "Give me 5 minutes"
                          },
                          {
                              "name": "response",
                              "text": "Sorry, I can't make it",
                              "style": "danger",
                              "type": "button",
                              "value": "Sorry, I can't make it",
                              "confirm": {
                                  "title": "Are you sure?",
                                  "text": "Should we tell the visitor you are unavailable",
                                  "ok_text": "Yes",
                                  "dismiss_text": "No"
                              }
                          }
                      ]
                  }])
              }
          })
          .then((response) => {
              // Return Users Details
              resolve(JSON.parse(response));
          })
          .catch((error) => {
              // API ERROR
              console.log('error response: ', error);
              reject('API Error: ', error);
          });
      });
  },
  PostMessage: (id, message) => {
    const token = process.env.SLACK_API_TOKEN || '';

    return new Promise((resolve, reject) => {
        request.post('https://slack.com/api/chat.postMessage', {
            form: {
                "token": token,
                "channel": id,
                "as_user": false,
                "text": message.text,
                "attachments": JSON.stringify([{
                    "text": "Click only if you will go receive them.",
                    "fallback": "Please go greet them",
                    "color": "#3AA3E3",
                    "attachment_type": "default",
                    "callback_id": message.sessionID,
                    "actions": [
                        {
                            "name": "greet",
                            "text": "Greet",
                            "type": "button",
                            "value": "fallback"
                        }
                    ]
                }])
            }
        })
        .then((response) => {
            // Return Users Details
            resolve(JSON.parse(response));
        })
        .catch((error) => {
            // API ERROR
            console.log('error response: ', error);
            reject('API Error: ', error);
        });
    });
  }
}
