'use strict';
const Alexa = require('alexa-sdk');

const launchStateHandlers   = require('./stateHandlers/launchStateHandlers');
const onboardingStateHandlers = require('./stateHandlers/onboardingStateHandlers');
const contactStateHandlers = require('./stateHandlers/contactStateHandlers');

// Constants
const constants = require('./constants/constants');

exports.handler = function(event, context, callback) {
    const alexa = Alexa.handler(event, context);
    alexa.appId = constants.appId;
    alexa.registerHandlers(launchStateHandlers, onboardingStateHandlers, contactStateHandlers);
    alexa.execute();
};
