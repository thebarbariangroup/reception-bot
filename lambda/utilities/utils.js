'use strict';
const Alexa = require('alexa-sdk');

const constants = require('../constants/constants');
const docClient = constants.docClient;
const makePlainText = Alexa.utils.TextUtils.makePlainText;
const makeImage = Alexa.utils.ImageUtils.makeImage;
const userAPI = require('../helpers/userAPI');
const textTemplate = new Alexa.templateBuilders.BodyTemplate1Builder();

String.prototype.toProperCase = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

const saveSessionToDB = (data) => {
    const params = {
        TableName: 'slackResponses',
        Item: {
            sessionID: {
                S: data.sessionID
            },
            visitorName: {
                S: data.visitorName
            },
            employeeName: {
                S: data.employeeName
            }
        }
    };

    return docClient.putItem(params, function(err, data) {
        if (err) {
            console.log(`DocClient Error: ${err}`);
        } else {
            return data;
        }
    });
};

const getSessionFromDB = (sessionId) => {
    const params = {
        TableName: 'slackResponses',
        Key: {
            sessionID: {
                S: sessionId
            }
        },
        AttributesToGet: [
            "slackResponse"
        ],
    };
    return docClient.getItem(params).promise()
      .then(function(data) {
        return data;
      })
      .catch(function(err) {
        console.log('failed GET from docClient:', err);
        return err;
      });

};

function pollForEmployeeRes(pollCount = 30) {
  return new Promise((res, rej) => {
    const event = this.event.session.sessionId;
    const TIMEOUT = 1000;

    const pollDbForRes = (count) => {
      getSessionFromDB(event)
        .then((data) => {
          let responded = data.Item.hasOwnProperty('slackResponse');

          if(responded) {
            return res(data.Item.slackResponse.S);
          }
          else {
            if(count !== 0) {
              setTimeout(() => {
                if (count > 0) return pollDbForRes.call(this, (count-1));
              }, TIMEOUT);
            }
            else {
              console.log('No response');
              return rej(`${ this.attributes['personFirstName'] } never responded`);
            }
          }
        })
    }

    return pollDbForRes.call(this, pollCount);
  });
}

const getRandom = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
};

const getGenericHelpMessage = () => {
    const sentences = [
      "I\'m here to see Cathy.",
      "I\'m here to see Paul for a meeting",
      "My name is Tom and I\'m here to see Caitlin for coffee."];
    return `You can say - ${ sentences[getRandom(0, sentences.length - 1)] }`;
};

/*
  Takes First and, optionally, Last name strings
    -Capitalizes both inputs
  Returns single concatenated String
*/
const displayName = (first = '', last = '') => {
  // make the name "proper" case
  // last name optional param
  return `${ first.toProperCase() }${ (!!last.length) ? ` ${ last.toProperCase() }` : '' }`;
};


/*
RETURNS: [{ value: '[name]' }]
*/
const findNameBySynonym = (resolutions = {}, synonym) => {
  if(!resolutions.hasOwnProperty('resolutionsPerAuthority')) {
    return [];
  }

  return resolutions.resolutionsPerAuthority.filter((rez) => {
    return rez.status.code === "ER_SUCCESS_MATCH";
  })
  .map((matched) => {
    return matched.values.reduce((final, val) => {
        final.value = val.value.name;
        return final;
      }, {})
  });
}

const checkSlotSynonyms = (slot) => {
    const slotSynonym = findNameBySynonym(slot.resolutions, slot.value);
    /*
      IF one (and only one) synonym is found
      (should always be the case until Alexa resolution fxnality is updated/changed...)
    */
    return (slotSynonym.length == 1)
                    ? slotSynonym[0].value
                    : slot.value;
}

function setStaticSessionAttributes() {
  this.attributes['RestartCount'] = 0;
  this.attributes['ReceptionContacted'] = false;
  this.attributes['reception'] = constants.CONTACT_FALLBACK;
  this.attributes['DisplayPresent'] = this.event.context.System.device.supportedInterfaces.Display;
}

const delayPromise = (time, v) => {
  return new Promise(function(resolve) {
      setTimeout(resolve.bind(null, v), time)
  });
}

const createProgressiveResponse = (reqId, text) => new Alexa.directives.VoicePlayerSpeakDirective(reqId, text);

const mergeDeep = (target, ...sources) => {
  if (!sources.length) return target;
  const source = sources.shift();

  if (__isObject(target) && __isObject(source)) {
    for (const key in source) {
      if (__isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);

  function __isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
  }
}

module.exports = {
  saveSessionToDB,
  getSessionFromDB,
  pollForEmployeeRes,
  getRandom,
  getGenericHelpMessage,
  displayName,
  findNameBySynonym,
  setStaticSessionAttributes,
  checkSlotSynonyms,
  delayPromise,
  createProgressiveResponse,
  mergeDeep
};
