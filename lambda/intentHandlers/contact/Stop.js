const Alexa = require('alexa-sdk');
const Utils = require('../../utilities/utils');

const textTemplate = new Alexa.templateBuilders.BodyTemplate1Builder();
const TEXT = Alexa.utils.TextUtils;


function StopIntent() {
  const outputSpeech = `No problem. If you would like to start over, say "Start Over". Otherwise, you can say: "Quit", and I will send someone to greet you.`;
  const reprompt = Utils.getGenericHelpMessage();
  const outputText = `<font size="5">${ outputSpeech }</font>`;
  let template = textTemplate.setTitle(`Can I help you?`)
                  .setTextContent(TEXT.makeRichText(`${ outputText }`));

  this.response.speak(`${ outputSpeech }`)
      .listen(reprompt);

  if(this.attributes['DisplayPresent']) {
    template = template.build();
    this.response.renderTemplate(template);
  }

  this.emit(":responseReady");
}


module.exports = StopIntent;
