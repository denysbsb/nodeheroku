const express = require('express')
const app = express()

app.get('/thanks/webhook/', (req, res) =>
 alert('hello word');
res.send('Hello World!')
)

var porta = process.env.PORT || 8080;
app.listen(porta, () => console.log('Example app listening on port 3000!'))
