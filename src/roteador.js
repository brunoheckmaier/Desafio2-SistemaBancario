const express = require('express')

const { criarConta, verContas, atualizarConta, excluirConta, depositar, sacar, transferir, saldo, extrato } = require('./controladores/rotas')
const { validarSenha, validarConta, validarNumeroConta, validarDadosTransacao, validarNumeroESenha } = require('./controladores/validacoes')

const rotas = express.Router()


rotas.get('/contas', validarSenha, verContas)
rotas.post('/contas', validarConta, criarConta)
rotas.put('/contas/:numeroConta/usuario', validarNumeroConta, atualizarConta)
rotas.delete('/contas/:numeroConta', validarNumeroConta, excluirConta)
rotas.post('/transcoes/depositar', validarDadosTransacao, depositar)
rotas.post('/transacoes/sacar', validarDadosTransacao, sacar)
rotas.post('/transacoes/transferir', transferir)
rotas.get('/contas/saldo', validarNumeroESenha, saldo)
rotas.get('/contas/extrato', validarNumeroESenha, extrato)


module.exports = rotas