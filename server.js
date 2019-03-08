var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');
var Message = require('./models/chat');
var db = require('./models/db');
var Events = require('./models/events');

var chatrooms = ['monkaS','room2'];
var usernames = {};

//chat route configuration
router.get('/', (req, res)=>{
  res.status(200).json({message: 'successful connection'});
});

router.get('/messages', (req, res)=>{
  Message.find({}, (err, messages)=>{
    res.find(messages);
  })
});

router.route('/messages/:user').get((req, res)=>{
  var user = req.params.user
  Message.find({name:user}, (err, messages)=>{
    res.send(messages);
  })
});
router.get('/event', (req, res)=>{
  Events.find({}, (err, events)=>{
    res.find(events);
  })
});



mongoose.Promise = global.Promise;
mongoose.connect(db.conStr, { useNewUrlParser: true }).then(
  () => {console.log('Database is now connected')
  var events = new Events({room: `${socket.room}`, eventType: `Database is now connected,`, time: `${new Date($.now())}`})
  events.save()},
  err => { console.log('Can not connect to the database '+ err)
  var events = new Events({room: `${socket.room}`, eventType: `Can not connect to the database,`, time: `${new Date($.now())}`})
  events.save();
  });


var server = http.listen(3000, () => {
  var events = new Events({room: `${socket.room}`, eventType: `server is running on port ${server.address().port}`, time: `${new Date($.now())}`})
  events.save();
});


app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))

// app.get('/messages', (req, res) => {
//   Message.find({},(err, messages)=> {
//     res.send(messages);
//   })
// })


// app.get('/messages/:user', (req, res) => {
//   var user = req.params.user
//   Message.find({name: user},(err, messages)=> {
//     res.send(messages);
//   })
// })


// app.post('/messages', async (req, res) => {
//   try{
//     var message = new Message(req.body);

//     var savedMessage = await message.save()
//       console.log('saved');
//       events.save(`Messaged saved to DB, Time: ${new Date($.now())}`);

//     var censored = await Message.findOne({message:'badword'});
//       if(censored)
//         await Message.remove({_id: censored.id})
//       else
//         io.emit('message', req.body);
//       res.sendStatus(200);
//   }
//   catch (error){
//     res.sendStatus(500);
//     return console.log('error',error);
//   }
//   finally{
//     console.log('Message Posted')
//     events.save(`Messaged posted to DOM, Time: ${new Date($.now())}`);
//   }

// })




io.sockets.on('connection', (socket) =>{
  //when the client emits adduser this listens and executes
  socket.on('addUser', function(socket){
    //store the username in the socket session for this client
    socket.name = name;
    //sotre the room name in the socket sesion for this client
    socket.chatroom = 'monkaS';
    //add ths clients username to the global list
    usernames[name] = name;
    //send client to room1 
    socket.join('monkaS');
    //echo to client that they have connected
    socket.emit('updatechat', 'SERVER', 'Aye monkaS');
    //echo to room1 that a person has connected to theri room
    socket.broadcast.io('monkaS').emit('updatechat', 'SERVER', name + 'has joined the room');
    socket.emit('updaterooms', chatrooms, 'monkaS' );
    //save to db

    //var events = new events({room: socket.chatroom, event:'connected'});
    var events = new Events({room: socket.chatroom, eventType:'connected', time: `${new Date($.now())}`});
    events.save();
  });

  //when the client emits sendchat this listens and executes
  socket.on('sendChat', function(data){
    //we tell the client to execute updatechat with 2 parameters
    io.sockets.in(socket.room).emit('updatechat', socket.name, data);
    //save to db
    var message = new Message({name: socket.name, message: data, room: socket.room});
    message.save();
   var events = new Events({room: socket.room, eventType:`a message is posted`, time: `${new Date($.now())}`});
   events.save();
  });

  socket.on('switchRoom', function(newroom){
    socket.leave(socket.room);
    socket.join(newroom);
    socket.emit('updatechat', 'SERVER', 'you have connected to'+ newroom)
    //send msg to old room
    socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.name + 'has left the chatroom');
    //save to db
    var events = new Events({room: socket.room, eventType: `left ${socket.room}`, time: `${new Date($.now())}`});
    events.save();
    //update socket session room title
    socket.chatroom = newroom;
    socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.name+'has connected to the chatroom');
    socket.emit('updaterooms', chatrooms, newroom);
    //save to db
    var events = new Events({room: socket.room, eventType:`joined ${socket.room}`, time: `${new Date($.now())}`});
    events.save();

  });
//when the user disconnects
  socket.on('disconnect', function(){
    //remove the username from  global usernames list
    delete usernames[socket.name];
    //update list of users in chat, client-side
    io.sockets.emit('updateusers', usernames);
    //echo globally that this client has left
    socket.broadcast.emit('updatechat', 'SERVER', socket.name + 'has disconnected');
    socket.leave(socket.room);
    //save to db
    var events = new Events({room: socket.room, eventType:`disconnected`, Time: `${new Date($.now())}`});
    events.save();

  });
  //events.save(`a user connected, Time: ${new Date($.now())}`);
});
