const Alexa = require('alexa-sdk');
const Utils = require('../utilities/utils');
const constants = require('../constants/constants');
const SlackBot = require('../helpers/slackAPI');

const VisitIntent = require('../intentHandlers/Visit');
const ElementSelected = require('../intentHandlers/onboarding/elementSelected');
const Restart = require('../intentHandlers/Restart');
const StopIntent = require('../intentHandlers/onboarding/Stop');
const HelpIntent = require('../intentHandlers/onboarding/Help');
const Goodbye = require('../intentHandlers/Goodbye');

const ContactReception = require('../helpers/ContactReception');
const FindEmployee = require('../helpers/FindEmployee');


const textTemplate = new Alexa.templateBuilders.BodyTemplate1Builder();
const makePlainText = Alexa.utils.TextUtils.makePlainText;
const makeImage = Alexa.utils.ImageUtils.makeImage;


let resolvedEmployeeValue = null;
let resolvedVisitTypeValue = null;

const employeeStateHandlers = Alexa.CreateStateHandler(constants.states.ONBOARDING, {
    'VisitIntent': VisitIntent,
    'ElementSelected': ElementSelected,
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
        const outputSpeech = constants.ERROR_MESSAGE;
        const reprompt = constants.ERROR_MESSAGE;
        this.emit(':ask', outputSpeech, reprompt);
    }
});

module.exports = employeeStateHandlers;
