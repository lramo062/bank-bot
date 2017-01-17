/* jshint esversion: 6  */

const request = require('request');
const host = 'https://tartan.plaid.com';

function add_account() {

    // request body
    let body = {
        json: {
            'client_id': '5878475cbdc6a46f20f16d99',
            'secret': '2b178ac46404af33079379a034fd11',
            'username': '',
            'password': '',
            'type': ''
        }
    };

    request.post(host + '/connect', body, (err, res, body) => {
        if(!err)
            console.log(body.access_token);
    });
};

function get_transactions() {

    // request body
    let body = {
        json: {
            'client_id':'5878475cbdc6a46f20f16d99',
            'secret': '2b178ac46404af33079379a034fd11',
            'access_token': 'b93f21e762c3bc46ff0df0426d1b33e89b564872bbf94babf96800c0a8fdbff7fe2ef1da80bb273f5790f0bbd054f9e24a0ca9c11e6e79b996406950b8fb336476733272a20a356b4c90f63006a81e85'
        }
    };

    request.post(host + '/connect/get', body, (err, res, body) => {
        if(!err)
            console.log(body);
    });
};

function balance() {

    // request body
    let body = {
        json: {
            'client_id': '5878475cbdc6a46f20f16d99',
            'secret': '2b178ac46404af33079379a034fd11',
            'access_token': 'b93f21e762c3bc46ff0df0426d1b33e89b564872bbf94babf96800c0a8fdbff7fe2ef1da80bb273f5790f0bbd054f9e24a0ca9c11e6e79b996406950b8fb336476733272a20a356b4c90f63006a81e85'
        }
    };

    request.post(host + '/balance', body, (err, res, body) => {
        if(!err)
            console.log(body);
    });
};
