const Alexa = require('alexa-sdk');
const constants = require('../constants/constants');
const docClient = require('../constants/constants').docClient;
const Utils = require('../utilities/utils');
const SlackBot = require('../helpers/slackAPI');
const ContactReception = require('../helpers/ContactReception');

const ContactEmployee = require('../intentHandlers/ContactEmployee');

const CheckStatus = require('../helpers/CheckStatus');
const Restart = require('../intentHandlers/Restart');
const StopIntent = require('../intentHandlers/contact/Stop');
const HelpIntent = require('../intentHandlers/contact/Help');
const Goodbye = require('../intentHandlers/Goodbye');


const contactStateHandlers = Alexa.CreateStateHandler(constants.states.CONTACT, {
  "ContactEmployee": ContactEmployee,
  // "CheckStatus" : CheckStatus,
  'Restart': Restart,
  // DEFAULTS
  'SessionEndedRequest': function () {
      (!this.attributes['ReceptionContacted'])
        ? ContactReception.call(this)
        : this.emitWithState('AMAZON.CancelIntent');
  },
  'AMAZON.StopIntent' : StopIntent,
  'AMAZON.HelpIntent' : HelpIntent,
  'AMAZON.CancelIntent' : Goodbye,
  'Unhandled': function () {
      this.emitWithState('AMAZON.HelpIntent');
  }
});

module.exports = contactStateHandlers;
