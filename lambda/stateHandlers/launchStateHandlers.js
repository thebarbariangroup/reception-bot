const Alexa = require('alexa-sdk');
const Utils = require('../utilities/utils');
const constants = require('../constants/constants');

const Goodbye = require('../intentHandlers/Goodbye');
const ContactReception = require('../helpers/ContactReception');

const textTemplate = new Alexa.templateBuilders.BodyTemplate1Builder();
const singleImageTemplate = new Alexa.templateBuilders.BodyTemplate2Builder();
const makePlainText = Alexa.utils.TextUtils.makePlainText;
const makeImage = Alexa.utils.ImageUtils.makeImage;

const LaunchStateHandlers = {
    "LaunchRequest": function() {
        Utils.setStaticSessionAttributes.call(this);

        const outputSpeech = constants.WELCOME_MESSAGE;
        const reprompt = Utils.getGenericHelpMessage();
        const outputText = `${ outputSpeech }`;
        let template = textTemplate.setTitle(`Welcome!`)
                        .setTextContent(makePlainText(`${ outputSpeech }`));

        this.response.speak(`${ outputSpeech }`)
            .listen(reprompt);

        if(this.attributes['DisplayPresent']) {
          template = template.build();
          this.response.renderTemplate(template);
        }

        this.emit(":responseReady");
    },
    "VisitIntent": function() {
        Utils.setStaticSessionAttributes.call(this);
        this.handler.state = constants.states.ONBOARDING;
        this.emitWithState("VisitIntent");
    },
    // DEFAULTS
    'SessionEndedRequest': function () {
        ContactReception.call(this);
    },
    'AMAZON.StopIntent' : function () {
        if(!this.attributes.hasOwnProperty('DisplayPresent')) {
          Utils.setGlobalAttributes.call(this)
        }

        const outputSpeech = `Okay, but if you are here to find an employee, I can help you reach them directly. Simply say: "I am here to see...", followed by an employee's name. Otherwise, you can say: "Quit", and I will send someone to greet you.`;
        const reprompt = Utils.getGenericHelpMessage();
        const outputText = `${ outputSpeech }`;
        let template = textTemplate.setTitle(`Maybe I can still help?`)
                        .setTextContent(makePlainText(`${ outputSpeech }`));

        this.response.speak(`${ outputSpeech }`)
            .listen(reprompt);

        if(this.attributes['DisplayPresent']) {
          template = template.build();
          this.response.renderTemplate(template);
        }

        this.emit(":responseReady");
    },
    'AMAZON.HelpIntent' : function () {
        this.emitWithState('LaunchRequest');
    },
    'AMAZON.CancelIntent': Goodbye,
    'Unhandled': function () {
        this.emitWithState("LaunchRequest");
    }
};


module.exports = LaunchStateHandlers;
