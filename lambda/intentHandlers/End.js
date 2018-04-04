const Alexa = require('alexa-sdk');

const constants = require('../constants/constants');

const textTemplate = new Alexa.templateBuilders.BodyTemplate1Builder();

const makePlainText = Alexa.utils.TextUtils.makePlainText;
const makeImage = Alexa.utils.ImageUtils.makeImage;


function End() {
  const outputSpeech = 'Okay, feel free to wait here in reception and I will try to send someone shortly.';
  const reprompt = 'Have a nice day!';
  const template = textTemplate.setTitle("Thank you")
      .setTextContent(makePlainText(`${ outputSpeech } ${ reprompt }`))
      .build();
  
  this.response.speak(`${ outputSpeech }. ${ reprompt }`)
      .renderTemplate(template);
  
  this.emit(':responseReady');
}

module.exports = End;