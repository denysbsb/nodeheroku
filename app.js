const express = require('express')
const app = express()

app.get('/', function(req, res) {
res.send('Hello World!');
})

app.get('/thanks/webhook/', function(request, response) {
    console.log('GET thanks webhook ---', request);
    res.send('GET thanks boot');
})

app.post('/thanks/webhook/', function(request, response) {
    console.log('POST thanks webhook ---', request);
    res.send('POST thanks boot');
})

var porta = process.env.PORT || 8080;
app.listen(porta, () => console.log('Example app listening on port 3000!'))
