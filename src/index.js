const express = require('express');

const app = express();
app.use(express.json());

const HTTP_OK_STATUS = 200;
const PORT = process.env.PORT || '3001';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.listen(PORT, () => {
  console.log('Online');
});

// Acima não foi alterado - Projeto feito a partir daqui

const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const filePath = path.resolve('src', 'talker.json');

// Funçao criada pra importar os dados do talker.json (igual da aula)
const readTalkerFile = async () => {
  const data = await fs.readFile(filePath, 'utf-8'); // Pegamos o arq aqui
  console.log(data); // Aqui vemos o arquivo JSON
  const talkerData = JSON.parse(data); // convertemos pro formato de obj javascript aqui
  console.log('###################### Alv ######################');
  console.log(talkerData); // Aqui vemos o obj JS
  return talkerData;
};

readTalkerFile();

app.get('/talker', async (req, res) => {
  const talkerData = await readTalkerFile();
  res.status(200).json(talkerData);
});

app.get('/talker/:id', async (req, res) => {
  const talkerData = await readTalkerFile();
  const { id } = req.params; // Pegar o valor do id da rota (só passou desestruturando!?)
  console.log(id);
  const foundTalker = talkerData.find((talker) => talker.id === parseInt(id, 10)); // Buscamos pelo mesmo id, 'parteInt' é pq o id é uma string, assim transformamos em number
  if (foundTalker) {
    res.status(200).json(foundTalker);
  } else {
    res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
  }
});

// Validacao pro Req 4
const validarLogin = (req, res, next) => {
  const { email, password } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    return res.status(400).json({ message: 'O campo "email" é obrigatório' });
  }
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'O "email" deve ter o formato "email@email.com"' });
  }
  if (!password) {
    return res.status(400).json({ message: 'O campo "password" é obrigatório' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'O "password" deve ter pelo menos 6 caracteres' });
  }
  next(); // Não é chamado pois tem um return caso algum if seja true
};

app.post('/login', validarLogin, (req, res) => {
  const token = crypto.randomBytes(8).toString('hex');
  res.status(200).json({ token });
});

// Validadores do Req 5

// VALIDAR TOKEN
const validarToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: 'Token não encontrado' });
  }
  if (token.length !== 16) {
    return res.status(401).json({ message: 'Token inválido' });
  }
  next();
};

// VALIDAR NAME
const validarName = (req, res, next) => {
  const nameValido = req.body.name;
  if (!nameValido) {
    return res.status(400).json({ message: 'O campo "name" é obrigatório' });
  }
  if (nameValido.length < 3) {
    return res.status(400).json({ message: 'O "name" deve ter pelo menos 3 caracteres' });
  }
  next();
};

// VALIDAR AGE
const validarAge = (req, res, next) => {
  const idadeValida = req.body.age;
  if (!idadeValida) {
    return res.status(400).json({ message: 'O campo "age" é obrigatório' });
  }
  if (!Number.isInteger(idadeValida) || idadeValida < 18) {
    return res.status(400).json({ message:
      'O campo "age" deve ser um número inteiro igual ou maior que 18' });
  }
  next();
};

// VALIDAR TALK
const validarTalk = (req, res, next) => {
  const talkValida = req.body.talk;
  if (!talkValida) {
    return res.status(400).json({ message: 'O campo "talk" é obrigatório' });
  }
  next();
};

// VALIDAR WATCHEDAT
const validarWatch = (req, res, next) => {
  const watchedAlv = req.body.talk.watchedAt;
  const watchedAtRegex = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!watchedAlv) {
    return res.status(400).json({ message: 'O campo "watchedAt" é obrigatório' });
  }
  if (!watchedAtRegex.test(watchedAlv)) {
    return res.status(400).json({ message: 'O campo "watchedAt" deve ter o formato "dd/mm/aaaa"' });
  }
  next();
};

// VALIDAR RATE
const validarRate = (req, res, next) => {
  const rateAlv = req.body.talk.rate;
  if (rateAlv === undefined) {
    return res.status(400).json({ message: 'O campo "rate" é obrigatório' });
  }
  if (!Number.isInteger(rateAlv) || rateAlv < 1 || rateAlv > 5) {
    return res.status(400).json({ message: 
      'O campo "rate" deve ser um número inteiro entre 1 e 5' });
  }
  next();
};

app.post('/talker',
  validarToken,
  validarName,
  validarAge,
  validarTalk,
  validarWatch,
  validarRate,
  async (req, res) => {
    const data = await readTalkerFile(); // recebemos o atual
    const pessoaNova = req.body;

    const addPessoaNova = {
      id: data.length + 1,
      name: pessoaNova.name,
      age: pessoaNova.age,
      talk: pessoaNova.talk,
    };

    data.push(addPessoaNova);
    await fs.writeFile(filePath, JSON.stringify(data));
    return res.status(201).json(addPessoaNova);
  });

// Requisitos 6 E 7 Realizados com ajuda GPT
// Req 6

app.put('/talker/:id',
  validarToken,
  validarName,
  validarAge,
  validarTalk,
  validarWatch,
  validarRate,
  async (req, res) => {
    const talkerId = parseInt(req.params.id, 10); // Obtém o id da rota como um número inteiro
    const data = await readTalkerFile(); // Lê os dados do arquivo JSON
    // Encontra a pessoa palestrante com base no id da rota
    const foundTalkerIndex = data.findIndex((talker) => talker.id === talkerId);
    // Se não encontrar a pessoa palestrante, retorna 404
    if (foundTalkerIndex === -1) {
      return res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
    }
    // Atualiza os dados da pessoa palestrante com base no corpo da requisição
    data[foundTalkerIndex] = {
      id: data[foundTalkerIndex].id,
      name: req.body.name,
      age: req.body.age,
      talk: req.body.talk,
    };
    await fs.writeFile(filePath, JSON.stringify(data)); // Escreve os dados atualizados no arquivo JSON
    return res.status(200).json(data[foundTalkerIndex]); // Retorna a pessoa palestrante editada
  });

// Req 7

app.delete('/talker/:id',
  validarToken,
  async (req, res) => {
    const talkerId = parseInt(req.params.id, 10); // Obtém o id da rota como um número inteiro
    const data = await readTalkerFile(); // Lê os dados do arquivo JSON
    // Encontra a pessoa palestrante com base no id da rota
    const foundTalkerIndex = data.findIndex((talker) => talker.id === talkerId);
    // Se não encontrar a pessoa palestrante, retorna 404
    if (foundTalkerIndex === -1) {
      return res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
    }
    // Remove a pessoa palestrante do array de dados
    data.splice(foundTalkerIndex, 1);
    // Escreve os dados atualizados no arquivo JSON
    await fs.writeFile(filePath, JSON.stringify(data));
    // Retorna o status 204 sem conteúdo na resposta
    return res.status(204).send();
  });
