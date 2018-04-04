'use strict';
const Alexa = require('alexa-sdk');

const constants = require('../constants/constants');
const Utils = require('../utilities/utils');
const FindEmployee = require('../helpers/FindEmployee');

const makePlainText = Alexa.utils.TextUtils.makePlainText;
const makeImage = Alexa.utils.ImageUtils.makeImage;

let resolvedEmployeeValue;
let resolvedVisitTypeValue;
let resolvedVisitorValue;

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
              resolvedEmployeeValue = Utils.checkSlotSynonyms(employeeFirst);
              const slotToConfirm = 'employeeFirst';
              const outputSpeech = `Are you here to see ${ resolvedEmployeeValue }?`;
              const reprompt = outputSpeech;
              const cardTitle = `Please confirm...`;
              const cardContent = outputSpeech;
              this.emit(':confirmSlotWithCard', slotToConfirm, outputSpeech, reprompt, cardTitle, cardContent);
          }
          // employeeFirst name IS "DENIED"
          else {
              // User denies the confirmation of slot value
              const slotToElicit = 'employeeFirst';
              const outputSpeech = `Who are you here to see?`;
              const reprompt = outputSpeech;
              const cardTitle = `My apologies`;
              const cardContent = outputSpeech;
              this.emit(':elicitSlotWithCard', slotToElicit, outputSpeech, reprompt, cardTitle, cardContent);
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
              const outputSpeech = `The reason for your visit is: ${ intentObj.slots.visitType.value }?`;
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
  setGlobalAttributes.call(this, resolvedEmployeeValue, resolvedVisitTypeValue, intentObj);
  FindEmployee.call(this);
}

function confirmIntentWithCard(intentObj) {
  const { visitorFirst, employeeFirst, visitType } = intentObj.slots;
  const outputSpeech = `So, your name is ${ visitorFirst.value.toProperCase() } and you\'re here to see ${ employeeFirst.value } for a ${ visitType.value }?`;
  const reprompt = `Is this correct?`;
  const cardTitle = `Please confirm the contact summary:`;
  const cardContent = `${ outputSpeech } ${ reprompt }`;
  this.emit(':confirmIntentWithCard', outputSpeech, reprompt, cardTitle, cardContent, intentObj);
}

function setGlobalAttributes(resolvedEmployee, resolvedVisitType, intentObj) {
    const visitorFirst = intentObj.slots.visitorFirst.value;
    const employeeFirst = resolvedEmployee || intentObj.slots.employeeFirst.value;
    const visitType = resolvedVisitType || intentObj.slots.visitType.value;
    this.attributes['visitor'] = {
        firstName: visitorFirst,
        displayName: Utils.displayName(visitorFirst)
    }
    this.attributes['employee'] = {
        firstName: employeeFirst,
        displayName: Utils.displayName(employeeFirst)
    }
    this.attributes['visitType'] = visitType;
}

function carryOverPreviouslySetSlots(intentObj) {
  const { visitor, visitType } = this.attributes;
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
