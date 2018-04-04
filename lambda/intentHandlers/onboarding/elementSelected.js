const Alexa = require('alexa-sdk');

const constants = require('../../constants/constants');

const singleImageTemplate = new Alexa.templateBuilders.BodyTemplate2Builder();
const makePlainText = Alexa.utils.TextUtils.makePlainText;
const makeImage = Alexa.utils.ImageUtils.makeImage;

function ElementSelected() {
    this.attributes['DisplayPresent'] = this.event.context.System.device.supportedInterfaces.Display;
    // Capture passed in vars
    const selectedToken = this.event.request.token;
    const [ slackId, employeeName ] = selectedToken.split(',');
    const [ firstName, lastName ] = employeeName.split(' ');
    const displayName = employeeName;
    const slackImgURL = `http://reception-bot.wearebarbarian.com:8080/assets/user_images/${ slackId }.jpeg`
    const employee = { firstName, lastName, displayName, slackId, slackImgURL }

    this.handler.state = constants.states.CONTACT;

    let outputSpeech = `Say "Contact" and I'll contact ${ this.attributes['employee'].displayName }.`;
    let outputText = `Say "Contact" and I'll contact ${ this.attributes['employee'].displayName }.`;
    let reprompt = 'Say "Contact", "Start Over", or "Stop"';

    let template = singleImageTemplate.setTitle(`${ this.attributes['employee'].displayName }`)
                    .setBackButtonBehavior('HIDDEN')
                    .setBackgroundImage(makeImage('http://www.solidbackgrounds.com/images/2560x1440/2560x1440-black-solid-color-background.jpg'))
                    .setImage(makeImage(slackImgURL))
                    .setTextContent(makePlainText(`${outputText}`));

    this.response.speak(`${outputSpeech}`)
        .listen(reprompt);

    if(this.attributes['DisplayPresent']) {
        template = template.build();
        this.response.renderTemplate(template);
    }

    this.emit(':responseReady');
  }

  module.exports = ElementSelected;
