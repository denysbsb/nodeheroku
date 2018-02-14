const express = require('express')
const app = express()

app.get('/', function(req, res) {
res.send('Hello World!');
})

app.get('/thanks/boot', function(req,res){
res.send('thanks boot');
})

var porta = process.env.PORT || 8080;
app.listen(porta, () => console.log('Example app listening on port 3000!'))
