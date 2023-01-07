const express = require('express')
const rotas = require('./roteador')
const app = express()

app.use(express.json())
app.use(rotas)


app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
})