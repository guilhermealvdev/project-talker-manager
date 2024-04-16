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


