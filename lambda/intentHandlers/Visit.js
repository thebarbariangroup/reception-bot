'use strict';
const Alexa = require('alexa-sdk');

const constants = require('../constants/constants');
const Utils = require('../utilities/utils');
const FindEmployee = require('../helpers/FindEmployee');

const makePlainText = Alexa.utils.TextUtils.makePlainText;
const makeImage = Alexa.utils.ImageUtils.makeImage;

function VisitIntent() {
  const intentObj = this.event.request.intent;

  const { visitorFirst, employeeFirst, visitType } = intentObj.slots;

  // IF the VisitIntent confirmationStatus is not "CONFIRMED"
  if(intentObj.confirmationStatus !== 'CONFIRMED') {
    // IF the VisitIntent confirmationStatus is NOT "DENIED"
    //  - VisitIntent is neither "CONFIRMED" nor "DENIED"
    if(intentObj.confirmationStatus !== 'DENIED') {
      if (this.event.request.dialogState === "STARTED") {
        // Set any defaults here
        if (this.attributes['RestartCount'] > 0 && this.attributes['visitor']) {
          carryOverPreviouslySetSlots.call(this, intentObj);
        }
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
    // IF the VisitIntent confirmationStatus IS "DENIED"
    else {
      // IF the visitorFirst name is not "CONFIRMED"...
      if (intentObj.slots.visitorFirst.confirmationStatus !== 'CONFIRMED') {
          // IF the visitorFirst name is NOT "DENIED"
          //  - visitorFirst name is neither "CONFIRMED" nor "DENIED"
          if (intentObj.slots.visitorFirst.confirmationStatus !== 'DENIED') {
              // THEN Confirm visitorFirst slot value
              const slotToConfirm = 'visitorFirst';
              const outputSpeech = `Is your name ${ visitorFirst.value }?`;
              const reprompt = outputSpeech;
              const cardTitle = `Please confirm...`;
              const cardContent = outputSpeech;
              this.emit(':confirmSlotWithCard', slotToConfirm, outputSpeech, reprompt, cardTitle, cardContent);
          }
          // VISITOR firstName IS "DENIED"
          else {
              // Re-solicit VISITOR firstName value
              const slotToElicit = 'visitorFirst';
              const outputSpeech = `What is your name?`;
              const reprompt = outputSpeech;
              const cardTitle = `My apologies`;
              const cardContent = outputSpeech;
              this.emit(':elicitSlotWithCard', slotToElicit, outputSpeech, reprompt, cardTitle, cardContent);
          }
      }
      // IF the employeeFirst name is NOT 'CONFIRMED'
      else if (intentObj.slots.employeeFirst.confirmationStatus !== 'CONFIRMED') {
          // IF the employeeFirst name is NOT "DENIED"
          //  - employeeFirst name is neither "CONFIRMED" nor "DENIED"
          if (intentObj.slots.employeeFirst.confirmationStatus !== 'DENIED') {
              // THEN Confirm employeeFirst slot value
              const updatedIntent = intentObj;
              const resolvedEmployeeFirst = Utils.checkSlotSynonyms(employeeFirst);
              const slotToConfirm = 'employeeFirst';
              const outputSpeech = `Are you here to see ${ resolvedEmployeeFirst }?`;
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
      // IF the visitType is NOT 'CONFIRMED'
      else if (intentObj.slots.visitType.confirmationStatus !== 'CONFIRMED') {
          // IF the visitType is NOT "DENIED"
          //  - visitType is neither "CONFIRMED" nor "DENIED"
          if (intentObj.slots.visitType.confirmationStatus !== 'DENIED') {
              // THEN Confirm visitType slot value
              // resolvedVisitTypeValue = Utils.checkSlotSynonyms(intentObj.slots.visitType);
              const slotToConfirm = 'visitType';
              const outputSpeech = `The reason for your visit is: ${ visitType.value }?`;
              const reprompt = outputSpeech;
              const cardTitle = `Please confirm...`;
              const cardContent = outputSpeech;
              this.emit(':confirmSlotWithCard', slotToConfirm, outputSpeech, reprompt, cardTitle, cardContent);
          } else {
              // Users denies the confirmation of slot value
              const slotToElicit = 'visitType';
              const outputSpeech = `What is the reason for your visit?`;
              const reprompt = outputSpeech;
              const cardTitle = `My apologies`;
              const cardContent = outputSpeech;
              this.emit(':elicitSlotWithCard', slotToElicit, outputSpeech, reprompt, cardTitle, cardContent);
          }
      }
      // IF every individual slot IS "CONFIRMED"
      else {
        confirmIntentWithCard.call(this, intentObj)
      }
    }
  }
  // IF entire intentObj is "CONFIRMED"
  else {
    handleIntentConfirmed.call(this, intentObj);
  }
}

function handleIntentConfirmed(intentObj) {
  const formatted = _formatForAttributes(intentObj);
  this.attributes = Utils.mergeDeep(this.attributes, formatted);
  FindEmployee.call(this);
}

function confirmIntentWithCard(intentObj) {
  const updatedIntent = intentObj;
  const { employeeFirst, employeeLast, visitorFirst, visitorLast, visitType } = intentObj.slots;
  const resolvedEmployeeFirst = Utils.checkSlotSynonyms(employeeFirst);
  const resolvedEmployeeLast = Utils.checkSlotSynonyms(employeeLast);
  
  const outputSpeech = `So, your name is ${ visitorFirst.value.toProperCase() } and you\'re here to see ${ resolvedEmployeeFirst } for a ${ visitType.value }?`;
  const reprompt = `Is this correct?`;
  const cardTitle = `Please confirm the contact summary:`;
  const cardContent = `${ outputSpeech } ${ reprompt }`;
  updatedIntent.slots.employeeFirst.value = resolvedEmployeeFirst;
  updatedIntent.slots.employeeLast.value = resolvedEmployeeLast;
  
  this.emit(':confirmIntentWithCard', outputSpeech, reprompt, cardTitle, cardContent, updatedIntent);
}

function _formatForAttributes({ intentName, confirmationStatus, slots }) {
    const _confirmed = confirmationStatus;
    
    const eFirst = _confirmed || slots.employeeFirst.confirmationStatus === "CONFIRMED" ? slots.employeeFirst.value : "";
    const eLast = _confirmed || slots.employeeLast.confirmationStatus === "CONFIRMED" ? slots.employeeLast.value : "";
    const eDisplay = Utils.displayName(eFirst, eLast);
    
    const vFirst = _confirmed || slots.visitorFirst.confirmationStatus === "CONFIRMED" ? slots.visitorFirst.value : "";
    const vLast = _confirmed || slots.visitorLast.confirmationStatus === "CONFIRMED" ? slots.visitorLast.value : "";
    const vDisplay = Utils.displayName(vFirst, vLast);
    
    const employee = { firstName: eFirst, lastName: eLast, displayName: eDisplay };
    const visitor = { firstName: vFirst, lastName: vLast, displayName: vDisplay };
    const visitType = _confirmed || slots.visitType.confirmationStatus === "CONFIRMED" ? slots.visitType.value : "Unknown";
    
    return {
      employee,
      visitor,
      visitType
    }
}

function carryOverPreviouslySetSlots(intentObj) {
  const { visitor, visitType } = this.attributes;
  console.log("CARRYOVER", visitor, visitType);
  if( !!visitor.firstName ) {
    // Set visitorFirst slot value to value previously set in this session, and confirmation status to "CONFIRMED"
    intentObj.slots.visitorFirst.value = visitor.firstName;
  }

  if( !!visitType ) {
    // Set visitType slot value to value previously set in this session, and confirmation status to "CONFIRMED"
    intentObj.slots.visitType.value = visitType;
  }
}

module.exports = VisitIntent;
