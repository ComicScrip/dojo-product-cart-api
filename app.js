const express = require('express');
const Joi = require('joi');
const connection = require('./db');

const serverPort = process.env.PORT || 3000;
const app = express();
const productsRouter = express.Router();

app.use(express.json());
app.use('/products', productsRouter);

connection.connect((err) => {
  if (err) {
    console.error('error connecting to db');
  } else {
    console.log('connected to db');
  }
});

productsRouter.get('/', (req, res) => {
  const { max_price } = req.query;
  let sql = 'SELECT * FROM products';
  const valuesToEscape = [];
  if (max_price) {
    sql += ' WHERE price <= ?';
    valuesToEscape.push(max_price);
  }

  connection
    .promise()
    .query(sql, valuesToEscape)
    .then(([products]) => {
      res.send(products);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error retrieving products from db.');
    });
});

productsRouter.get('/:id', (req, res) => {
  const { id } = req.params;
  connection
    .promise()
    .query('SELECT * FROM products WHERE id = ?', [id])
    .then(([results]) => {
      if (results.length) {
        res.send(results[0]);
      } else {
        res.sendStatus(404);
      }
    });
});

productsRouter.post('/', (req, res) => {
  const { name, price } = req.body;

  const { error: validationErrors } = Joi.object({
    name: Joi.string().max(255).required(),
    price: Joi.number().min(0).required(),
  }).validate({ name, price }, { abortEarly: false });

  if (validationErrors) {
    res.status(422).send(validationErrors.details);
  } else {
    connection
      .promise()
      .query('INSERT INTO products (name, price) VALUES (?, ?)', [name, price])
      .then(([result]) => {
        res.status(201).send({ id: result.insertId, name, price });
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('could not insert a new product');
      });
  }
});

app.patch('/products/:id', (req, res) => {
  let validationErrors = null;
  let existingProduct = null;
  connection
    .promise()
    .query('SELECT * FROM products WHERE id = ?', [req.params.id])
    .then(([results]) => {
      [existingProduct] = results;
      if (!existingProduct)
        return Promise.reject(new Error('RECORD_NOT_FOUND'));
      validationErrors = Joi.object({
        name: Joi.string().max(255),
        price: Joi.number().min(0),
      }).validate(req.body, { abortEarly: false }).error;
      if (validationErrors) return Promise.reject(new Error('INVALID_DATA'));
      return connection
        .promise()
        .query('UPDATE products SET ? WHERE id = ?', [req.body, req.params.id]);
    })
    .then(() => {
      res.json({ ...existingProduct, ...req.body });
    })
    .catch((err) => {
      console.error(err);
      if (err.message === 'RECORD_NOT_FOUND') return res.sendStatus(404);
      if (err.message === 'INVALID_DATA')
        return res.status(422).json({ errors: validationErrors.details });
      return res.sendStatus(500);
    });
});

app.listen(serverPort);
