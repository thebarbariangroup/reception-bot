const Alexa = require('alexa-sdk');

const textTemplate = new Alexa.templateBuilders.BodyTemplate1Builder();
const TEXT = Alexa.utils.TextUtils;

function Goodbye() {
    this.response.speak(`Goodbye.`);

    if(this.attributes['DisplayPresent']) {
      const primary = `<font size="6">Goodbye!</font>`
      const secondary = `<font size="1">...Parting is such sweet sorrow...</font>`;
      const template = textTemplate.setTextContent(TEXT.makeRichText(primary), TEXT.makeRichText(secondary)).build();
      
      this.response.renderTemplate(template);
    }
    
    this.emit(':responseReady');
}

module.exports = Goodbye;