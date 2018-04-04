const UserAPI = require('../helpers/userAPI');

const constants = require('../constants/constants');
const utils = require('../utilities/utils');

const Alexa = require('alexa-sdk');
const textTemplate = new Alexa.templateBuilders.BodyTemplate1Builder();
const singleImageTemplate = new Alexa.templateBuilders.BodyTemplate2Builder();
const hListTemplate = new Alexa.templateBuilders.ListTemplate2Builder();
const listItem = new Alexa.templateBuilders.ListItemBuilder();

const makePlainText = Alexa.utils.TextUtils.makePlainText;
const makeImage = Alexa.utils.ImageUtils.makeImage;

function FindEmployee() {
  // Capture the necessary values
  const blackBg   = 'http://www.solidbackgrounds.com/images/2560x1440/2560x1440-black-solid-color-background.jpg'
  const employee  = this.attributes['employee'];
  const visitor   = this.attributes['visitor'];
  const receptionists = this.attributes['receptionists'];

  // Initialize scoped vars
  let outputSpeech;
  let outputText;
  let reprompt;
  let template;
  let pattern = /^((http|https|ftp):\/\/)/;

  UserAPI.GetFuzzyUserDetails(employee.firstName)
    .then((employeeDetails) => {
      // Single employee found
      if (typeof employeeDetails === 'object') {

        if (employeeDetails.directMatches.length === 1) {

            employeeDetails = employeeDetails.directMatches[0];
            employee.slackId = employeeDetails.slackId;
            employee.email   = employeeDetails.email;

            // Set speech vars
            // Acknowledge single employee found
            outputSpeech  = `I found ${ employee.displayName }. Say "Contact" and I will let them know you are here.`;
            outputText = `You can say: "Contact", as well as "Start Over" or "Stop".`
            reprompt   = 'You can say "Contact", as well as "Start Over", or "Stop".';

            // Set template vars
            let imageURL  = pattern.test(employeeDetails.imageURI) ? employeeDetails.imageURI : `http:${employeeDetails.imageURI}`;
            template      = singleImageTemplate.setTitle(`I found ${ employee.displayName }`)
                            .setBackgroundImage(makeImage(blackBg))
                            .setImage(makeImage(imageURL))
                            .setTextContent(makePlainText(`${ outputText }`));

            // Update next state
            this.handler.state = constants.states.CONTACT;
        }
        // Multiple employees with same first name found
        else if (employeeDetails.directMatches.length > 1) {
          outputSpeech  = `There are more than one "${ employee.firstName }" at ${ constants.COMPANY_NAME }. Tap to choose the employee you are here to see.`;
          reprompt      = 'You can either tap an employee, or say "Start Over" or "Stop".';

          let list = [];

          for (let i = 0; i < employeeDetails.directMatches.length; i++) {
            let imageURL = pattern.test(employeeDetails.directMatches[i].imageURI) ? employeeDetails.directMatches[i].imageURI : `http:${employeeDetails.directMatches[i].imageURI}`;
            list.push(createEmployeeListItem(imageURL, employeeDetails.directMatches[i]));
          }

          template  = hListTemplate.setTitle('Who are you visiting today?')
                        .setBackgroundImage(makeImage(blackBg))
                        .setListItems(list);
        }
        // No employees w/ exact name found, but multiple "near" matches found
        else if (employeeDetails.directMatches.length === 0 && employeeDetails.nearMatches.length > 0) {

          outputSpeech  = `We did not find "${ employee.firstName }" at ${ constants.COMPANY_NAME }, but here are the closest matches. Please tap to choose the employee you are here to see.`;
          reprompt      = 'You can either tap an employee, or say "Start Over" or "Stop".';

          let list = [];

          for (let i = 0; i < employeeDetails.nearMatches.length; i++) {
            let imageURL = pattern.test(employeeDetails.nearMatches[i].imageURI)
                            ? employeeDetails.nearMatches[i].imageURI
                            : `http:${employeeDetails.nearMatches[i].imageURI}`;

            list.push(createEmployeeListItem(imageURL, employeeDetails.nearMatches[i]));
          }

          template  = hListTemplate.setTitle('Does anyone look familiar?')
                        .setBackgroundImage(makeImage(blackBg))
                        .setListItems(list);

        } //ENDif Multiple
        //
        else {
          outputSpeech  = `We did not find "${ employee.firstName }." To try contacting someone else, say "Start Over".`;
          outputText = `We did not find "${ employee.firstName }." To try contacting someone else, say "Start Over".`;
          reprompt      = 'You can say "Start Over".'
          template      = textTemplate.setTitle('Try someone else?')
                          .setTextContent(makePlainText(`${ outputText }`));

          //contact receptionist
          //utils.contactReceptionist.call(this, visitor, receptionists);
        }

      } // ENDif Found
      // IF !Found
      else {
        outputSpeech  = `There was a problem on my end finding "${ employee.firstName }". To try again, say "Start Over".`;
        reprompt      = 'You can say "Start Over."'
        template      = textTemplate.setTitle('Try again?')
                        .setTextContent(makePlainText(`${ outputSpeech }`));
      } // ENDif !Found

      // Build Alexa response from speech vars
      this.response.speak(`${ outputSpeech }`)
          .listen(reprompt);

      if(this.attributes['DisplayPresent']) {
        template = template.build();
        this.response.renderTemplate(template);
      }

      this.emit(':responseReady');
    })
    .catch((error) => {
      console.log('Error in FindEmployee', error)
      return error;
    })
}

function createEmployeeListItem(imageURL, employeeDetails) {
  return {
      "token" : `${ employeeDetails.slackId },${ employeeDetails.firstName } ${ employeeDetails.lastName }`,
      "employeeImg": imageURL,
      "image": {
          "sources": [
              {
                  "url": imageURL
              }
          ],
          "contentDescription": employeeDetails.firstName
      },
      "textContent" : {
          "primaryText":
              {
                  "text": `${ employeeDetails.firstName } ${ employeeDetails.lastName }`,
                  "type": "PlainText"
              }
      }
  }
}


module.exports = FindEmployee;
