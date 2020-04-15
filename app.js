const inicioDebug= require('debug')('app:inicio');
const express = require('express');
const Joi = require('joi');
const morgan = require('morgan');
const config = require('config');
const app = express();
const usuarios = [
  { id: 1, nombre: 'paco' },
  { id: 2, nombre: 'tomas' },
  { id: 3, nombre: 'asdf' },
];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

console.log('Aplicacion ' + config.get('nombre'));

if (app.get('env') === 'development') {
  app.use(morgan('tiny'));
  console.log('Morgan Habilitado');
  inicioDebug("Morgan esta habilidatod")
}

app.use(function (req, res, next) {
  console.log('Autenticando');
  next();
});
app.get('/', (req, res) => {
  res.send('Hola mundo desde express');
});

app.get('/api/usuarios', (req, res) => {
  res.send(usuarios);
});

app.get('/api/usuarios/:id', (req, res) => {
  let usuario = existeUsuario(req.params.id);
  if (!usuario) res.status(404).send('El usuario no fue encontrado');
  res.send(usuario);
});

app.post('/api/usuarios', (req, res) => {
  /* let body=req.body;
  console.log(body.nombre);
  res.json({
    body
  }) */
  const schema = Joi.object({
    nombre: Joi.string().min(3).required(),
  });
  const { error, value } = validarUsuario(req.body.nombre);
  if (!error) {
    const usuario = {
      id: usuarios.length + 1,
      nombre: value.nombre,
    };
    usuarios.push(usuario);
    res.send(usuario);
  } else {
    const mensaje = error.details[0].message;
    res.status(400).send(mensaje);
  }
});

app.put('/api/usuarios/:id', (req, res) => {
  let usuario = existeUsuario(req.params.id);
  if (!usuario) {
    res.status(404).send('El usuario no fue encontrado');
    return;
  }

  const { error, value } = validarUsuario(req.body.nombre);
  if (error) {
    const mensaje = error.details[0].message;
    res.status(400).send(mensaje);
    return;
  }

  usuario.nombre = value.nombre;
  res.send(usuario);
});

app.delete('/api/usuarios/:id', (req, res) => {
  let usuario = existeUsuario(req.params.id);
  if (!usuario) {
    req.status(404).send('El usuario no fue encontrado');
    return;
  }

  const index = usuarios.indexOf(usuario);
  usuarios.splice(index, 1);
  res.send(usuarios);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Escuchando en el puerto ${port}...`);
});

const existeUsuario = (id) => {
  return usuarios.find((u) => u.id === parseInt(id));
};

const validarUsuario = (nombre) => {
  const schema = Joi.object({
    nombre: Joi.string().min(3).required(),
  });
  return schema.validate({ nombre: nombre });
};
