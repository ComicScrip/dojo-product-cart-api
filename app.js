const express = require('express');
const uniqid = require('uniqid');
const cors = require('cors');

const productList = [
  { id: 1, name: 'produit 1', price: 50, quantity: 1 },
  { id: 2, name: 'produit 2', price: 75, quantity: 2 },
  { id: 3, name: 'produit 3', price: 20, quantity: 5 },
];

const app = express();

app.use(express.json());
app.use(cors());

app.get('/products', (request, response) => {
  response.send(productList);
});

app.post('/products', (request, response) => {
  const { name, price } = request.body;
  const newProduct = { name, price, quantity: 1, id: uniqid() };
  productList.push(newProduct);
  response.send(newProduct);
});

app.listen(5000, () => console.log('server listening on port 5000'));
