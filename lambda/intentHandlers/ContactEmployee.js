const Alexa = require('alexa-sdk');
const Utils = require('../utilities/utils');
const SlackBot = require('../helpers/slackAPI');
const Goodbye = require('../intentHandlers/Goodbye');
const CheckStatus = require('../helpers/CheckStatus');

function ContactEmployee() {
  const slots     = this.event.request.intent.slots;
  const visitType = (this.attributes.hasOwnProperty('visitType'))
                      ? this.attributes['visitType']
                      : slots.visitType.value;
  const employee  = (this.attributes.hasOwnProperty('employee'))
                      ? this.attributes['employee']
                      : slots.employeeFirst.value;
  const visitor   = (this.attributes.hasOwnProperty('visitor'))
                      ? this.attributes['visitor']
                      : slots.visitorFirst.value;


  Utils.saveSessionToDB({
      sessionID: this.event.session.sessionId,
      visitorName: visitor.displayName,
      employeeName: employee.displayName
  });

  // we'll contact our SlackBot here
  SlackBot.PostWithOptions(employee.slackId, {
    text:`${visitor.displayName} is in reception, re: ${visitType}`,
    sessionID: this.event.session.sessionId
  })
  .then((data) => {
      CheckStatus.call(this);
  })
  .catch((error) => {
      console.log("API ERROR: ", error);
      this.emit(':tell', `Sorry, there was a problem on our end contacting ${employee.displayName}.`);
  });
}

module.exports = ContactEmployee;
