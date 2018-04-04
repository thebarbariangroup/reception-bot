const Alexa = require('alexa-sdk');

const constants = require('../constants/constants');

const textTemplate = new Alexa.templateBuilders.BodyTemplate1Builder();

const makePlainText = Alexa.utils.TextUtils.makePlainText;
const makeImage = Alexa.utils.ImageUtils.makeImage;


function Restart() {
  this.attributes['RestartCount']++;
  this.attributes['employee'] = null;

  const outputSpeech = 'Ok, let\'s start over. You can say, "I am here to see..." followed by an employee\'s name.';
  const reprompt = "Please tell me who you are here to see.";
  let template = textTemplate.setTitle("Please tell me who you are here to see")
      .setTextContent(makePlainText(`${ outputSpeech }`));

  this.response.speak(`${ outputSpeech }`)
      .listen(reprompt)

  if(this.attributes['DisplayPresent']) {
    template = template.build();
    this.response.renderTemplate(template);
  }

  this.handler.state = constants.states.ONBOARDING;
  this.emit(':responseReady');
}

module.exports = Restart;
