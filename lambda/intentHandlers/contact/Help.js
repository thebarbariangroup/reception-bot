const Alexa = require('alexa-sdk');
const Utils = require('../../utilities/utils');

const textTemplate = new Alexa.templateBuilders.BodyTemplate1Builder();
const TEXT = Alexa.utils.TextUtils;


function HelpIntent() {
  const employee = this.attributes['employee'];
  const outputSpeech = `You can say: "Contact", in order to contact ${ employee.displayName }; say: "Start Over", if you would like to try to contact a different employee; Or say: "Quit", and I will send someone to greet you.`;
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
