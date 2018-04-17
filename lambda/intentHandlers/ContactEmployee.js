const Alexa = require('alexa-sdk');
const Utils = require('../utilities/utils');
const SlackBot = require('../helpers/slackAPI');
const Goodbye = require('../intentHandlers/Goodbye');
const CheckStatus = require('../helpers/CheckStatus');

function ContactEmployee() {
  const visitor = this.attributes['visitor'];
  const employee = this.attributes['employee'];
  const reason = this.attributes['visitType'];

  Utils.saveSessionToDB({
      sessionID: this.event.session.sessionId,
      visitorName: visitor.displayName,
      employeeName: employee.displayName
  });

  // we'll contact our SlackBot here
  SlackBot.PostWithOptions(employee.slackId, {
    text: `${ visitor.displayName } is waiting in reception, re: ${ reason }`,
    sessionID: this.event.session.sessionId
  })
  .then((data) => {
      console.log('POST MSG', data);
      CheckStatus.call(this);
  })
  .catch((error) => {
      console.log("API ERROR: ", error);
      this.emit(':tell', `Sorry, there was a problem on our end contacting ${ employee.displayName }.`);
  });
}

module.exports = ContactEmployee;
