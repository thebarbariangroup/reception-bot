const Alexa = require('alexa-sdk');
const Utils = require('../../utilities/utils');

const textTemplate = new Alexa.templateBuilders.BodyTemplate1Builder();
const TEXT = Alexa.utils.TextUtils;


function HelpIntent() {
  const outputSpeech = `If you are trying to reach an employee, I can help you contact them directly. Just say: "I am here to see...", followed by an employee's name. Otherwise, you can say: "Quit", and I will send someone to greet you.`;
  const reprompt = Utils.getGenericHelpMessage();
  const outputText = `<font size="5">${ outputSpeech }</font>`;
  let template = textTemplate.setTitle(`Help:`)
                  .setTextContent(TEXT.makeRichText(`${ outputText }`));

  this.response.speak(`${ outputSpeech }`)
      .listen(reprompt);

  if(this.attributes['DisplayPresent']) {
    template = template.build();
    this.response.renderTemplate(template);
  }

  this.emit(":responseReady");
}

module.exports = HelpIntent;
