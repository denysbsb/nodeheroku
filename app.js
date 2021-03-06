const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const crypto = require('crypto');
const APP_SECRET = '6d26ed1cc4f8fed7cabe06d6e982100e';
var rp = require('request-promise');
var access_token = 'DQVJ2eWpIdy15Ylc0bmpJWFV0alhzX2lWOW9vaWRfVDhZAclZAYdUJTN2hxREFabDVrU1JlTk9FZATNzbk1uVjBhZADlLQkFjNHNZAZAS1rVVhKZAEFHY0RESW5OOW5QN0R1Mk5rNEdBUGQ1Y210ZADlYRV9XYUdNLUV5NU4yNk1NYmNlSDkzdTVwSTVmQ0g0eERJWnhXMmxjSTVKeUJXc3pva2lhYWF0M2tmajhxQTNqNlpyTjQ2cGN0ZAkpFWXhZAaGN2NE1kMERQUVBIU3A5S3NQT1dtZAgZDZD';
// var proxyMaquina = 'http://stefanini:gamouse@10.1.140.76:8080';


const { Client } = require('pg');

const pg = require('pg');

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

/// WEBHOOK MONITORAMENTO GRUPO teste

//Valida webhook  MONITORAMENTO GRUPO

app.get('/monitoramento/webhook', function(request, response) {
    console.log('GET monitoramento grupo ---', request.query['hub.mode']);
    if (request.query['hub.mode'] === 'subscribe') {
        console.log('Deu successo ---');
        response.status(200).send(request.query['hub.challenge']);
    } else {
        console.error('Failed validation. Make sure the validation tokens match.');
        response.sendStatus(403);
    }
})

  app.post('/monitoramento/webhook', function (req, res) {
    console.log('****req.body');
    //res.sendStatus(200);
    // var data = req.body;

    // console.log('**req.body', data);

    // data.entry.forEach(function(entry){
    //     console.log('--foreach.entry', entry);
    //     let group_id = entry.id;
    //     entry.changes.forEach(function(change){
    //       console.log('User Change',group_id,change);
    //     });
    // });
  });

app.get('/criatable', function(req, res){
    client.connect();

    client.query('create table thanks (create_date date, permalink_url text, recipient text, recipient_manager text, sender text, message text);', (err, res) => {
        console.log('Criar tabela', res);
    });

});

app.get('/vertabela', function(req, res){
    client.connect();

    client.query(` SELECT *, (select COUNT(*) from thanks WHERE create_date > now() - INTERVAL '1 week') as contador FROM thanks WHERE create_date > now() - INTERVAL '1 week';`, (err, res) => {
        console.log('Seleciona tabela res', res);
        console.log('Seleciona tabela resrows', res.rows);
    });

});

app.get('/vertabela2', function(req, res){
    client.connect();

    client.query('SELECT * FROM thanks WHERE create_date > now();', (err, res) => {
        if(err){
            console.log(err);
        } else {
            console.log('Seleciona tabela res', res);
            console.log('Seleciona tabela resrows', res.rows);
        }
    });

});

app.get('/iseredados', function(req, res){
    client.connect();

    client.query("INSERT INTO people (id,name) VALUES (2, 'rael');", (err, res) => {
        console.log('insere dados denys tabela', res);
    });
});

//Valida do meu webhook
app.get('/thanks/webhook', function(request, response) {
    console.log('GET thanks webhook ---', request.query['hub.mode']);
    if (request.query['hub.mode'] === 'subscribe') {
        response.status(200).send(request.query['hub.challenge']);
    } else {
        console.error('Failed validation. Make sure the validation tokens match.');
        response.sendStatus(403);
    }
})

app.get('/banco', function(req, res){
    client.connect();
    console.log('111client--', client);
    client.query('SELECT * FROM stefanini;', (err, res) => {
        console.log('Ola create');
    });
});

function getTotal(recipient){

    console.log('CALL GET TOTAL()');
    client.connect();

    var resultado = [];

    client.query(`SELECT COUNT(*) FROM thanks WHERE recipient = '` + 100024289753034 + `'`, (err, result) => {
        console.log('result TOTAL--', result);
        console.log('results.rows TOTAL', result.rows[0].count);
        resultado.push(result.rows[0].count);
    });

    return resultado;
    
}

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
                        console.log(44444);
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

                    message_tags.forEach(function(message_tag) {
                        // Ignore page / group mentions
                        if(message_tag.type !== 'user') return;
                        // Add the recipient to a list, for later retrieving their manager
                        recipients.push(message_tag.id);
                    });

                    var GRAPH_URL_MANAGERS = 'https://graph.facebook.com' + '/';
                    var request = require('request');
 
                    request({
                        url: GRAPH_URL_MANAGERS,
                        // proxy: proxyMaquina,
                        qs: {
                            ids: recipients.join(','),
                            fields: 'managers'
                        },
                        headers: {
                            Authorization: 'Bearer ' + access_token
                        },
                        json: true
                        }, function (err, res, body) {
                            console.log(6666);

                            recipients.forEach(function(recipient) {
                                let manager = '';
                                if(body && body[recipient]) {
                                    if(body[recipient].managers && body[recipient].managers.data[0]){
                                        manager = body[recipient].managers.data[0].id;
                                        managers[recipient] = manager;
                                        manager = body[recipient].managers.data[0].id;
                                        managers[recipient] = manager;
                                        query_inserts.push(`(now(),'${permalink_url}','${recipient}','${manager}','${sender}','${message}')`);
                                    } else {
                                        query_inserts.push(`(now(),'${permalink_url}','${recipient}','undefined','${sender}','${message}')`);
                                    }
                                }
                            });
                            
                            var interval = '1 week';
                            var intervalo_pt = '1 semana';
                             let query = 'INSERT INTO thanks VALUES '
                            + query_inserts.join(',');                            

                            client.connect();

                            client.query(query, (err, result) => {
                                console.log('result insert', result);
                            });

                            client.connect();

                            var totalizadorData = [];
                            client.query(`SELECT * FROM thanks`, (err, result) => {
                                result.rows.forEach(data=>{
                                    totalizadorData.push(data)
                                })
                            });

                            client.query(`SELECT * FROM thanks WHERE create_date > now() - INTERVAL '1 week';`, (err, result) => {
                                
                                if (err) {
                                } else if (result) {
                                    var summary = 'Agradecimento recebido!!\n';
                                    // iterate through result rows, count number of thanks sent
                                    var sender_thanks_sent = 0;
                                    result.rows.forEach(function(row) {
                                        if(row.sender == sender) sender_thanks_sent++;
                                    });
                                    // summary += `@[${sender}] has sent ${sender_thanks_sent} thanks in the last ${intervalo_pt}\n`;
                                    
                                    // Iterate through recipients, count number of thanks received
                               
                                    recipients.forEach(function(recipient) {
                                        let recipient_thanks_received = 0;
                                        result.rows.forEach(function(row) {
                                            if(row.recipient == recipient) recipient_thanks_received++;
                                        });
                                        if(managers[recipient]) {

                                            var totalizado = totalizadorData.filter(function(data) {
                                                return  data.recipient === recipient;
                                            });
                                            var total = totalizado.length;

                                            var agradecimento = recipient_thanks_received;

                                            if(agradecimento < 2){
                                                agradecimento = agradecimento + ' agradecimento';
                                            } else {
                                                agradecimento = agradecimento + ' agradecimentos';
                                            }

                                            var agradecimentoTotal = total;

                                            if (total < 2) {
                                                agradecimentoTotal = agradecimentoTotal + ' agradecimento';
                                            } else {
                                                agradecimentoTotal = agradecimentoTotal + ' agradecimentos';
                                            }

                                            summary += `@[${recipient}] recebeu ${agradecimento} na última ${intervalo_pt} com o total de ${agradecimentoTotal}. Olha só @[${managers[recipient]}].\n`;
                                        } else {
                                            var totalizado = totalizadorData.filter(function(data) {
                                                return  data.recipient === recipient;
                                            });
                                            var total = totalizado.length;
                                            var agradecimento = recipient_thanks_received;

                                            if(agradecimento < 2){
                                                agradecimento = agradecimento + ' agradecimento';
                                            } else {
                                                agradecimento = agradecimento + ' agradecimentos';
                                            }

                                            var agradecimentoTotal = total;

                                            if (total < 2) {
                                                agradecimentoTotal = agradecimentoTotal + ' agradecimento';
                                            } else {
                                                agradecimentoTotal = agradecimentoTotal + ' agradecimentos';
                                            }


                                            summary += `@[${recipient}] recebeu ${agradecimento} na última ${intervalo_pt} com o total de ${agradecimentoTotal}. Não possui gerente especificado.\n`;
                                        }
                                    });

                                    var GRAPH_URL_MESSAGES = 'https://graph.facebook.com' + '/' + mention_id + '/comments';
                                    var request = require('request');
                                    
                                    request({
                                        url: GRAPH_URL_MESSAGES,
                                        // proxy: proxyMaquina,
                                        method: 'POST',
                                        qs: {
                                            message: summary
                                        },
                                        headers: {
                                            Authorization: 'Bearer ' + access_token
                                        },
                                        json: true
                                        }, function (err, res, body) {
                                            console.log('Comment reply', mention_id);
                                    });
                                }
                                response.sendStatus(200);
                            });
                    });
                }
            });
        });
    }
});


var porta = process.env.PORT || 8080;
app.listen(porta, () => console.log('Example app listening on port 3000!'))
