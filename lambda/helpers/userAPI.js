const request = require('request-promise');
const url = process.env.SLACKBOT_URL;

const userToken = process.env.USER_API_TOKEN || '';

module.exports = {

    GetUserDetails: (personFirstname) => {
        return new Promise((resolve, reject) => {
            request({
                url: `${url}slack-users?firstName=${personFirstname}`, //our api endpoint
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                auth: {
                    'bearer': userToken
                }
            })
                .then((response) => {
                    // Return Users Details
                    resolve(JSON.parse(response));
                })
                .catch((error) => {
                    // API ERROR
                    reject('API Error: ', error);
                });
        });
    },

    GetFuzzyUserDetails: (personFirstname) => {
        return new Promise((resolve, reject) => {
            request({
                url: `${url}slack-users-fuzzy?firstName=${personFirstname}`, //our api endpoint
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                auth: {
                    'bearer': userToken
                }
            })
                .then((response) => {
                    // Return Users Details
                    resolve(JSON.parse(response));
                })
                .catch((error) => {
                    // API ERROR
                    reject('API Error: ', error);
                });
        });
    },

    GetUserByLastNameDetails: (personFirstname, personLastname) => {
        return new Promise((resolve, reject) => {
            request({
                url: `${url}slack-users?firstName=${personFirstname}&lastName=${personLastname}`, //our api endpoint
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                auth: {
                    'bearer': userToken
                }
            })
                .then((response) => {
                    // Return Users Details
                    resolve(JSON.parse(response));
                })
                .catch((error) => {
                    // API ERROR
                    reject('API Error: ', error);
                });
        });
    }
};
