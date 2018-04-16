'use strict';
const Alexa = require('alexa-sdk');

const constants = require('../constants/constants');
const Utils = require('../utilities/utils');
const FindEmployee = require('../helpers/FindEmployee');

const makePlainText = Alexa.utils.TextUtils.makePlainText;
const makeImage = Alexa.utils.ImageUtils.makeImage;

// let resolvedEmployeeFirst;
// let resolvedEmployeeLast;

function DeliveryIntent() {
  const intentObj = this.event.request.intent;
  const { employeeFirst, employeeLast, deliveryType } = intentObj.slots;
  // IF the Delivery confirmationStatus is not "CONFIRMED"
  if(intentObj.confirmationStatus !== 'CONFIRMED') {
    // IF the Delivery confirmationStatus is NOT "DENIED"
    //  - Delivery is neither "CONFIRMED" nor "DENIED"
    if(intentObj.confirmationStatus !== 'DENIED') {
      if (this.event.request.dialogState === "STARTED") {
        // Set any defaults here
        this.emit(":delegate", intentObj);
      }
      // IF dialog is IN_PROGRESS, delegate
      else if(this.event.request.dialogState !== "COMPLETED") {
        this.emit(":delegate");
      }
      else {
        confirmIntentWithCard.call(this, intentObj)
      }
    }
    // IF the Delivery confirmationStatus is "DENIED"
    else {
      // IF the employeeFirst name is NOT 'CONFIRMED'
      if (intentObj.slots.employeeFirst.confirmationStatus !== 'CONFIRMED') {
          // IF the employeeFirst name is NOT "DENIED"
          //  - employeeFirst name is neither "CONFIRMED" nor "DENIED"
          if (intentObj.slots.employeeFirst.confirmationStatus !== 'DENIED') {
              // THEN Confirm employeeFirst slot value
              const updatedIntent = intentObj;
              const resolvedEmployeeFirst = Utils.checkSlotSynonyms(employeeFirst);
              const slotToConfirm = 'employeeFirst';
              const outputSpeech = `His or her first name is ${ resolvedEmployeeFirst }?`;
              const reprompt = outputSpeech;
              const cardTitle = `Please confirm...`;
              const cardContent = outputSpeech;
              updatedIntent.slots[slotToConfirm].value = resolvedEmployeeFirst;
              this.emit(':confirmSlotWithCard', slotToConfirm, outputSpeech, reprompt, cardTitle, cardContent, updatedIntent);
          }
          // employeeFirst name IS "DENIED"
          else {
              // User denies the confirmation of slot value
              const updatedIntent = intentObj;
              const slotToElicit = 'employeeFirst';
              const outputSpeech = `Who are you here to see?`;
              const reprompt = outputSpeech;
              const cardTitle = `My apologies`;
              const cardContent = outputSpeech;
              updatedIntent.slots[slotToElicit].value = "";
              this.emit(':elicitSlotWithCard', slotToElicit, outputSpeech, reprompt, cardTitle, cardContent, updatedIntent);
          }
      }
      else if (intentObj.slots.employeeLast.confirmationStatus !== 'CONFIRMED') {
          // IF the employeeLast name is NOT "DENIED"
          //  - employeeLast name is neither "CONFIRMED" nor "DENIED"
          if (intentObj.slots.employeeLast.confirmationStatus !== 'DENIED') {
              // THEN Confirm employeeLast slot value
              const updatedIntent = intentObj;
              const resolvedEmployeeLast = Utils.checkSlotSynonyms(employeeLast);
              const slotToConfirm = 'employeeLast';
              const outputSpeech = `His or her last name is ${ resolvedEmployeeLast }?`;
              const reprompt = outputSpeech;
              const cardTitle = `Please confirm...`;
              const cardContent = outputSpeech;
              updatedIntent.slots[slotToConfirm].value = resolvedEmployeeLast;
              this.emit(':confirmSlotWithCard', slotToConfirm, outputSpeech, reprompt, cardTitle, cardContent, updatedIntent);
          }
          // employeeFirst name IS "DENIED"
          else {
              // User denies the confirmation of slot value
              const updatedIntent = intentObj;
              const slotToElicit = 'employeeLast';
              const outputSpeech = `What is his or her last name?`;
              const reprompt = outputSpeech;
              const cardTitle = `My apologies`;
              const cardContent = outputSpeech;
              updatedIntent.slots[slotToElicit].value = "";
              this.emit(':elicitSlotWithCard', slotToElicit, outputSpeech, reprompt, cardTitle, cardContent, updatedIntent);
          }
      }
    }
  }
  // IF entire intentObj is "CONFIRMED"
  else {
    handleIntentConfirmed.call(this, intentObj);
  }
}

function confirmIntentWithCard(intentObj) {
  const updatedIntent = intentObj;
  const { employeeFirst, employeeLast, deliveryType } = intentObj.slots;
  const resolvedEmployeeFirst = Utils.checkSlotSynonyms(employeeFirst)
  const resolvedEmployeeLast = Utils.checkSlotSynonyms(employeeLast)

  const outputSpeech = `So, you have a ${ deliveryType.value } for ${ resolvedEmployeeFirst } ${ resolvedEmployeeLast }?`;
  const reprompt = `Is this correct?`;
  const cardTitle = `Please confirm the contact summary:`;
  const cardContent = `${ outputSpeech } ${ reprompt }`;
  updatedIntent.slots.employeeFirst.value = resolvedEmployeeFirst;
  updatedIntent.slots.employeeLast.value = resolvedEmployeeLast;

  this.emit(':confirmIntentWithCard', outputSpeech, reprompt, cardTitle, cardContent, updatedIntent);
}

function handleIntentConfirmed(intentObj) {
  const formatted = _formatForAttributes(intentObj);
  // UPDATE ATTRIBUTES
  this.attributes = Utils.mergeDeep(this.attributes, formatted);
  FindEmployee.call(this);
}

function _formatForAttributes({ intentName, confirmationStatus, slots }) {
  const _confirmed = confirmationStatus === "CONFIRMED";

  const eFirst = _confirmed || slots.employeeFirst.confirmationStatus === "CONFIRMED" ? slots.employeeFirst.value : "";
  const eLast = _confirmed || slots.employeeLast.confirmationStatus === "CONFIRMED" ? slots.employeeLast.value : "";
  const eDisplay = Utils.displayName(eFirst, eLast);

  const vFirst = "";
  const vLast = "";
  const vDisplay = "Someone"

  const employee = { firstName: eFirst, lastName: eLast, displayName: eDisplay };
  const visitor = { firstName: vFirst, lastName: vLast, displayName: vDisplay };
  const visitType = "delivery"

  return {
    employee,
    visitor,
    visitType
  }
}

module.exports = DeliveryIntent;
