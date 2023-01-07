const bancodedados = require("../bancodedados")
const { validarSenha } = require("./validacoes")
let identificador = 1
const { format } = require("date-fns")


const verContas = (req, res) => {

    res.json(bancodedados.contas)

}

const criarConta = (req, res) => {

    bancodedados.contas.push({
        numero: identificador.toString(),
        saldo: 0,
        usuario: req.body
    })
    identificador++
    return res.status(201).end()
}

const atualizarConta = (req, res) => {
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body
    const { numeroConta } = req.params

    if (cpf) {
        const conta = bancodedados.contas.find(conta => conta.usuario.cpf === cpf)

        if (conta) {
            return res.status(403).json({ mensagem: "O CPF informado já existe cadastrado!" })
        }

    }

    if (email) {
        const conta = bancodedados.contas.find(conta => conta.usuario.email === email)

        if (conta) {
            return res.status(403).json({ mensagem: "O email informado já existe cadastrado!" })
        }

    }

    let body = {}

    for (const key of Object.keys({ nome, cpf, data_nascimento, telefone, email, senha })) {
        if (req.body[key]) {
            body[key] = req.body[key]
        }
    }

    let conta = bancodedados.contas.find(conta => conta.numero === numeroConta)

    conta.usuario = { ...conta.usuario, ...body }

    res.end()
}

const excluirConta = (req, res) => {
    const { numeroConta } = req.params

    const conta = bancodedados.contas.find(conta => conta.numero === numeroConta)

    if (conta.saldo !== 0) {
        return res.status(403).json({ mensagem: "A conta só pode ser removida se o saldo for zero!" })
    }

    bancodedados.contas = bancodedados.contas.filter(conta => conta.numero !== numeroConta)



    res.end()
}

const depositar = (req, res) => {
    const { numero_conta, valor } = req.body

    const conta = bancodedados.contas.find(conta => Number(conta.numero) === numero_conta)

    if (!conta) {
        return res.status(404).json({ mensagem: "O número da conta invalido!" })
    }


    conta.saldo += valor

    bancodedados.depositos.push({
        data: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
        numero_conta,
        valor
    })

    return res.status(200).end()
}

const sacar = (req, res) => {
    const { numero_conta, valor, senha } = req.body

    try {
        if (!senha) {
            throw [404, "A senha e obrigatoria!"]
        }

        const conta = bancodedados.contas.find(conta => Number(conta.numero) === numero_conta)

        if (!conta) {
            throw [404, "Conta nao encontrada!"]
        }

        if (senha !== conta.usuario.senha) {
            throw [401, "Senha incorreta!"]
        }

        if (valor > conta.saldo) {
            throw [403, "Saldo insuficiente!"]
        }

        bancodedados.saques.push({
            data: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            numero_conta,
            valor
        })

        conta.saldo -= valor
        return res.status(200).end()

    } catch (erro) {
        res.status(erro[0]).json({ mensagem: erro[1] })
    }
}

const transferir = (req, res) => {
    const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body

    try {

        if (!numero_conta_origem) {
            throw [404, "Numero da conta de origem e obrigatorio!"]
        }

        if (!numero_conta_destino) {
            throw [404, "Numero da conta de destino e obrigatorio!"]
        }

        if (!valor) {
            throw [404, "Valor e obrigatorio!"]
        }

        if (!senha) {
            throw [404, "Senha e obrigatorio!"]
        }

        const origem = bancodedados.contas.find(conta => Number(conta.numero) === numero_conta_origem)
        const destino = bancodedados.contas.find(conta => Number(conta.numero) === numero_conta_destino)

        if (!origem) {
            throw [404, "Conta de origem nao encontrada!"]
        }

        if (!destino) {
            throw [404, "conta de destino nao encontrada!"]
        }

        if (senha !== origem.usuario.senha) {
            throw [401, "Senha incorreta!"]
        }

        if (origem.saldo < valor) {
            throw [400, "Saldo insuficiente!"]
        }

        origem.saldo -= valor
        destino.saldo += valor

        bancodedados.transferencias.push({
            data: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            numero_conta_origem,
            numero_conta_destino,
            valor
        })

        return res.status(200).end()


    } catch (error) {
        res.status(error[0]).json({ mensagem: error[1] })
    }
}

const saldo = (req, res) => {
    const { numero_conta } = req.query

    const conta = bancodedados.contas.find(conta => conta.numero === numero_conta)
    res.status(200).json({ saldo: conta.saldo })
}

const extrato = (req, res) => {
    const { numero_conta } = req.query

    const formatQuery = Number(numero_conta)

    const depositos = bancodedados.depositos.filter(deposito => deposito.numero_conta === formatQuery)
    const saques = bancodedados.saques.filter(saque => saque.numero_conta === formatQuery)
    const transferenciasEnviadas = bancodedados.transferencias.filter(traferencia => traferencia.numero_conta_origem === formatQuery)
    const transferenciasRecebidas = bancodedados.transferencias.filter(traferencia => traferencia.numero_conta_destino === formatQuery)

    return res.status(200).json(
        {
            depositos,
            saques,
            transferenciasEnviadas,
            transferenciasRecebidas
        }
    )

}


module.exports = {
    criarConta,
    verContas,
    atualizarConta,
    excluirConta,
    depositar,
    sacar,
    transferir,
    saldo,
    extrato
}