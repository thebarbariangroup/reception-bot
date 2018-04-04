const Utils = require('../utilities/utils');
const SlackBot = require('../helpers/slackAPI');
const constants = require('../constants/constants');
const Goodbye = require('../intentHandlers/Goodbye');


function ContactReception(callbackIntent = 'Unhandled') {
  const visitor = (this.attributes["visitor"]) ? Utils.displayName(this.attributes["visitor"].firstName) : "Someone";
  SlackBot.PostMessage(constants.CONTACT_FALLBACK.id, {
    text: `${ visitor } is waiting in reception.`,
    sessionID: this.event.session.sessionId
  })
  .then((response) => {
    this.attributes['ReceptionContacted'] = true;
    this.emitWithState(callbackIntent);
    return true;
  })
  .catch((error) => {
    console.log(`There was an error: ${ error }`);
    return error;
  });
}


module.exports = ContactReception;
