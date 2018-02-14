const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const crypto = require('crypto');
const APP_SECRET = '6d26ed1cc4f8fed7cabe06d6e982100e';
var rp = require('request-promise');
var access_token = 'DQVJ2eWpIdy15Ylc0bmpJWFV0alhzX2lWOW9vaWRfVDhZAclZAYdUJTN2hxREFabDVrU1JlTk9FZATNzbk1uVjBhZADlLQkFjNHNZAZAS1rVVhKZAEFHY0RESW5OOW5QN0R1Mk5rNEdBUGQ1Y210ZADlYRV9XYUdNLUV5NU4yNk1NYmNlSDkzdTVwSTVmQ0g0eERJWnhXMmxjSTVKeUJXc3pva2lhYWF0M2tmajhxQTNqNlpyTjQ2cGN0ZAkpFWXhZAaGN2NE1kMERQUVBIU3A5S3NQT1dtZAgZDZD';
// var proxyMaquina = 'http://stefanini:gamouse@10.1.140.76:8080';


const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
});



app.use(bodyParser.json({ verify: verifyRequestSignature }));

function verifyRequestSignature(req, res, buf) {
    var signature = req.headers['x-hub-signature'];

    if (!signature) {
		// For testing, let's log an error. In production, you should throw an error.
        console.error('Couldn\'t validate the signature.');
    } else {
        var elements = signature.split('=');
        var signatureHash = elements[1];

        var expectedHash = crypto.createHmac('sha1', APP_SECRET)
			.update(buf)
			.digest('hex');

        if (signatureHash != expectedHash) {
            throw new Error('Couldn\'t validate the request signature.');
        }
    }
}

app.get('/', function(req, res) {
res.send('Hello World!');
})

//Valida do meu webhook
app.get('/thanks/webhook', function(request, response) {
    console.log('GET thanks webhook ---', request.query['hub.mode']);
    if(request.query['hub.mode'] === 'subscribe'){
        response.status(200).send(request.query['hub.challenge']);
    } else {
        console.error('Failed validation. Make sure the validation tokens match.');
        response.sendStatus(403);
    }
})

app.get('/banco', function(req, res){
    client.connect();
    console.log('111client--', client);
    client.query('CREATE DATABASE stefanini;', (err, res) => {
        console.log('Ola create');
    });
});

app.post('/thanks/webhook', function(request, response) {
    if(request.body && request.body.entry) {
        request.body.entry.forEach(function(entry) {
            entry.changes.forEach(function(change) {
                if(change.field === 'mention') {
                    let mention_id = (change.value.item === 'comment') ?
                        change.value.comment_id : change.value.post_id;

                    var GRAPH_URL_LIKES = 'https://graph.facebook.com' + '/' + mention_id + '/likes'
                    
                    rp({
                        url: GRAPH_URL_LIKES,
                        method: 'POST',
                        // proxy: proxyMaquina,
                        headers: {
                            Authorization: 'Bearer ' + access_token
                        },
                        json: true
                        })
                    .then(function (res) {
                        console.log('Like', mention_id);
                    })
                    .catch(function (err) {
                        console.log('err', err);
                    });

                    let message = change.value.message,
                    message_tags = change.value.message_tags,
                    sender = change.value.sender_id,
                    permalink_url = change.value.permalink_url,
                    recipients = [],
                    managers = [],
                    query_inserts = [];

                }
            });
        });
    }
    response.sendStatus(200);
})

var porta = process.env.PORT || 8080;
app.listen(porta, () => console.log('Example app listening on port 3000!'))
