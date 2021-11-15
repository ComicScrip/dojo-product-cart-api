const express = require('express');
const connection = require('./db');

const serverPort = process.env.PORT || 3000;
const app = express();

connection.connect((err) => {
  if (err) {
    console.error('error connecting to db');
  } else {
    console.log('connected to db');
  }
});

app.listen(serverPort);

/*
app.get('/products', (request, response) => {
  response.send(productList);
});

app.post('/products', (request, response) => {
  const { name, price } = request.body;
  const newProduct = { name, price, quantity: 1, id: uniqid() };
  productList.push(newProduct);
  response.send(newProduct);
});
*/
