# Express Guides

- [Express Guides](#express-guides)
  - [Authentication](#authentication)
    - [1. Set Token in `local storage` and send it to server in header](#1-set-token-in-local-storage-and-send-it-to-server-in-header)
    - [2. Set Token in `cookie` and send it to server](#2-set-token-in-cookie-and-send-it-to-server)
    - [3. Set Token in `session` into server](#3-set-token-in-session-into-server)
  - [File Uploads](#file-uploads)
  - [Cache Design Patterns](#cache-design-patterns)
  - [Kafka Distribution System](#kafka-distribution-system)
  - [Elasticsearch](#elasticsearch)
  - [RabbitMQ](#rabbitmq)


## Authentication

command

```bash
npm init -y
npm i cors express mysql2 jsonwebtoken cookie-parser express-session bcrypt
```

### 1. Set Token in `local storage` and send it to server in header

รับ token จาก server แล้วเก็บ token ไว้ใน local storage แล้วมีการส่งไปที่ server ผ่าน header โดยใช้ fetch api

จุดสังเกต จะมีการส่ง token หลังจาก login ผ่าน `response`

```js
res.json({ message: 'Login successfully', token })
```

ส่วน client จะเก็บ token ที่ได้ไว้ใน local storage 

```js
localStorage.setItem('token', response.data.token);
```

เมื่อ request api ผ่าน Promise fn เช่น `axios` มีการส่ง token ผ่าน header ไปด้วย

```js
axios.get('http://localhost:3000/api/user', {
  headers: {
    Authorization: `Bearer ${token}`
  }
})
```

### 2. Set Token in `cookie` and send it to server

ในกรณีที่มีการเก็บ token ไว้ใน cookie แล้วส่งไปที่ server ผ่าน header โดยใช้ fetch api

จุดสังเกต จะมีการส่ง cookie ที่ภายในมี token หลังจาก login ผ่าน `response`

```js
res.cookie('token', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'none'
}).json({ message: 'Login successfully' });
```

ส่วน client จะเก็บ token ที่ได้ไว้ใน cookie โดยอัตโนมัติ

เมื่อ request api ผ่าน Promise fn เช่น `axios` มีการส่ง `withCredentials: true` แทนการส่ง token ผ่าน header

```js
axios.get('http://localhost:3000/api/user', {
  withCredentials: true
})
```

### 3. Set Token in `session` into server

ในกรณีนี้ server มีการเก็บ token ไว้ใน `session` ซึ่งเป็นการเก็บข้อมูลไว้ใน server โดยตรง

จุดสังเกต จะมีการส่ง `session` ที่ภายในมี token หลังจาก login ผ่าน `response`

```js
req.session.token = token;
res.json({ message: 'Login successfully' });
```

ส่วน client จะไม่ต้องทำอะไรเพิ่มเติม ตอนส่ง request api ผ่าน Promise fn เช่น `axios` ไม่ต้องส่ง token ไปด้วย
มีการส่ง `withCredentials: true` แค่อย่างเดียว เหมือนกับกรณีที่เก็บ token ไว้ใน `cookie`

```js
axios.get('http://localhost:3000/api/user', {
  withCredentials: true
})
```

วิธีการนี้ จะเป็นการพึ่งพาการเก็บข้อมูลไว้ใน server โดยตรง และไม่ต้องเก็บข้อมูลไว้ที่ client และไม่ต้องส่งข้อมูลไปที่ server ทุกครั้งที่ request api

## File Uploads

## Cache Design Patterns

## Kafka Distribution System

## Elasticsearch

## RabbitMQ