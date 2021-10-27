# Nodejs-eshop-backend

# Run

### Install

```
npm install
```

### Start API

```
npm start
```

# Routes

### Products

```
GET      /eshop/products
GET      /eshop/products/:id
POST     /eshop/products
PUT      /eshop/products/:id
DELETE   /eshop/products/:id
PUT gallery-images : /eshop/products/gallery-images/:id
GET featured products: /eshop/products/get/featured/:count
GET products count: /eshop/products/get/count
```

### Orders

```
GET      /eshop/orders
GET      /eshop/orders/:id
POST     /eshop/orders
PUT      /eshop/orders/:id
DELETE   /eshop/orders/:id
GET orders count: /eshop/orders/get/count
```

### Users

```
GET      /eshop/users
GET      /eshop/users/:id
POST     /eshop/users
PUT      /eshop/users/:id
DELETE   /eshop/users/:id
GET users count: /eshop/users/get/count
```

#### Register new user

```
POST     /eshop/users/register
```

#### Login user

To login the user and get the auth token you can use:

```
POST     /eshop/users/login
```
