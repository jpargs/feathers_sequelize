const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const socketio = require('@feathersjs/socketio');
const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = new Sequelize('postgres://paoloarguelles@localhost:5432/feathers_sequelize')
// A messages service that allows to create new
// and return all existing messages

const Message = sequelize.define('Message', {
  // Model attributes are defined here
  username: DataTypes.STRING,
  content: DataTypes.TEXT
}, {
  // Other model options go here
});


class MessageService {

  async find () {
    const messages = await Message.findAll();
    // Just return all our messages
    return messages;
  }

  async create (data) {
    // The new message is the data merged with a unique identifier
    // using the messages length since it changes whenever we add one

    const message = await Message.create({
      content: data.text,
      username: data.username
    });

    return message;
  }
}

// Creates an ExpressJS compatible Feathers application
const app = express(feathers());

// Parse HTTP JSON bodies
app.use(express.json());
// Parse URL-encoded params
app.use(express.urlencoded({ extended: true }));
// Host static files from the current folder
app.use(express.static(__dirname));
// Add REST API support
app.configure(express.rest());
// Configure Socket.io real-time APIs
app.configure(socketio());
// Register an in-memory messages service
app.use('/messages', new MessageService());
// Register a nicer error handler than the default Express one
app.use(express.errorHandler());

// Add any new real-time connection to the `everybody` channel
app.on('connection', connection =>
  app.channel('everybody').join(connection)
);
// Publish all events to the `everybody` channel
app.publish(data => app.channel('everybody'));

// Start the server
app.listen(3030).on('listening', () =>
  console.log('Feathers server listening on localhost:3030')
);

// For good measure let's create a message
// So our API doesn't look so empty
app.service('messages').create({
  text: 'Hello world from the server',
  username: 'paul'
});
