const express = require('express')
const app = express()
var alert = require('alert-node');

app.get('/thanks/webhook/', function(req, res) {
var nome = 0;
console.log('Teste DENYS');
res.send('Hello World!'+ nome+1);
})

var porta = process.env.PORT || 8080;
app.listen(porta, () => console.log('Example app listening on port 3000!'))
