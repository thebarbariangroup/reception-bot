const Alexa = require('alexa-sdk');
const Utils = require('../utilities/utils');

const textTemplate = new Alexa.templateBuilders.BodyTemplate1Builder();
const makePlainText = Alexa.utils.TextUtils.makePlainText;

function CheckStatus () {
    let employee = this.attributes['employee'];
    let displayPresent = this.event.context.System.device.supportedInterfaces.Display;

    const requestId = this.event.request.requestId;
    const token = this.event.context.System.apiAccessToken;
    const endpoint = this.event.context.System.apiEndpoint;
    const ds = new Alexa.services.DirectiveService();

    function buildProgressiveResponse(reqId, endpoint, token) {
      const promiseArr = [];
      const genSpeech = generateProgressiveSpeech(6);
      let speech = genSpeech.next();
      let idx = 0;

      while(!speech.done) {
        let response = Utils.createProgressiveResponse(requestId, speech.value);
        const newProm = Utils.delayPromise((idx * 10000))
          .then((retVal) => {
            ds.enqueue(response, endpoint, token)
          });
        idx++;
        promiseArr.push(newProm);
        speech = genSpeech.next();
      }
      return promiseArr;
    }

    function* generateProgressiveSpeech(iterations) {
      let idx = iterations;
      yield `I have contacted ${ employee.displayName } to let them know you are here. Please wait as it may take ${ employee.displayName } a moment to respond.`
      while (idx) {
          idx--;
          yield `<speak><s>${employee.displayName} should be responding momentarily${ Array(idx).join('.') }</s></speak>`
      }
      return;
    }

    const progressiveResponse = buildProgressiveResponse(requestId, endpoint, token);
    const employeeResponse = Utils.pollForEmployeeRes.call(this, 40);

    Promise.all([progressiveResponse, employeeResponse])
      .then((responses) => {
          const [progRes,employeeRes] = responses;
          // If employee responds (within timeframe)
          let outputSpeech;
          let reprompt;
          let template;

          switch (employeeRes) {
              case 'I\'m on my way':
                  outputSpeech = `${employee.displayName} is on their way.`;
                  reprompt = 'Please wait here and have a nice day.';

                  this.response.speak(`${ outputSpeech } ${ reprompt }`)
                  break;
              case 'Give me 5 minutes':
                  outputSpeech = `${employee.displayName} will be with you in 5 minutes.`;
                  reprompt = 'Please wait here and have a nice day.';

                  this.response.speak(`${ outputSpeech } ${ reprompt }`)
                  break;
              case 'Sorry, I can\'t make it':
                  outputSpeech = `${employee.displayName} is unavailable.`;
                  reprompt = `Say "Start Over" to try someone else. Or say "Stop".`;
                  this.response.speak(`${ outputSpeech } ${ reprompt }`)
                      .listen(reprompt)
                  break;
          }

          if(this.attributes['DisplayPresent']) {
            template = textTemplate.setTitle(`"${ employeeRes }"`)
                .setTextContent(makePlainText(`${outputSpeech} ${ reprompt }`))
                .build();

            this.response.renderTemplate(template);
          }

          this.emit(':responseReady');
      })
      .catch((err) => {
        // If employee does not respond in time:
        const outputSpeech = `${employee.displayName} never responded. Say "Contact" again if you would like me to send ${ employee.displayName } another message. Otherwise, you can say "Start Over", or "Quit".`
        const reprompt = `Say "Contact" again, "Start Over", or "Quit".`;
        let template = textTemplate.setTitle(`Try someone else?`)
            .setTextContent(makePlainText(`${ outputSpeech }`))

        this.response.speak(`${ outputSpeech }`)
            .listen(reprompt)

        if(this.attributes['DisplayPresent']) {
          template = template.build();
          this.response.renderTemplate(template);
        }

        this.emit(':responseReady');
      });
}

module.exports = CheckStatus;
