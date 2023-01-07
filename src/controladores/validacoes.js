const bancodedados = require("../bancodedados")


const validarSenha = (req, res, next) => {

    const { senha_banco } = req.query

    if (senha_banco != bancodedados.banco.senha) {
        return res.status(401).json({ mensagem: "A senha do banco informada é inválida!" })
    }

    next()

}

const validarConta = (req, res, next) => {
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body

    const body = { nome, cpf, data_nascimento, telefone, email, senha }

    for (const key of Object.keys(body)) {
        if (!body[key] || body[key] == '') {
            return res.status(400).json({ mensagem: `Campo "${key}" é OBRIGATORIO!` })
        }
    }

    const conta = bancodedados.contas.find(conta => conta.usuario.cpf === cpf || conta.usuario.email === email)
    console.log(conta);
    if (conta) {
        return res.status(403).json({ mensagem: "Já existe uma conta com o cpf ou e-mail informado!" })
    }

    req.body = body

    next()
}

const validarNumeroConta = (req, res, next) => {
    const { numeroConta } = req.params

    const conta = bancodedados.contas.find(conta => conta.numero === numeroConta)

    if (!conta) {
        return res.status(404).end()
    }

    next()
}

const validarDadosTransacao = (req, res, next) => {
    const { numero_conta, valor } = req.body

    if (!numero_conta) {
        return res.status(404).json({ mensagem: "O número da conta e o valor são obrigatórios!" })

    }

    if (!valor) {
        return res.status(404).json({ mensagem: "O número da conta e o valor são obrigatórios!" })
    }

    if (valor <= 0) {
        return res.status(400).json({ mensagem: "Valor Invalido!" })
    }

    next()
}

const validarNumeroESenha = (req, res, next) => {
    const { numero_conta, senha } = req.query

    try {
        if (!numero_conta) {
            throw [404, "Numero da conta e obrigatorio!"]
        }

        if (!senha) {
            throw [404, "Senha e obrigatorio!"]
        }

        const conta = bancodedados.contas.find(conta => conta.numero === numero_conta)

        if (!conta) {
            throw [404, "Conta nao encontrada!"]
        }

        if (senha !== conta.usuario.senha) {
            throw [401, "Senha incorreta!"]
        }

        next()

    } catch (error) {
        res.status(error[0]).json({ mensagem: error[1] })
    }
}

module.exports = {
    validarSenha,
    validarConta,
    validarNumeroConta,
    validarDadosTransacao,
    validarNumeroESenha
}