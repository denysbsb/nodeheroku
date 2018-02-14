const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const crypto = require('crypto');

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

app.post('/thanks/webhook', function(request, response) {
    console.log('POST thanks request.body ---', request.body);
    if(request.body && request.body.entry) {
        console.log('request.body.entry req ---', request.body.entry);
    }
    response.sendStatus(200);
})

var porta = process.env.PORT || 8080;
app.listen(porta, () => console.log('Example app listening on port 3000!'))
