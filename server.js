var express = require('express');
var bodyParser = require('body-parser')
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');
var Message = require('./models/chat');
var db = require('./models/db');





//mongoose.Promise = global.Promise;
mongoose.connect(db.conStr, { useNewUrlParser: true }).then(
  () => {console.log('Database is now connected') },
  err => { console.log('Can not connect to the database '+ err)}
);

var server = http.listen(3000, () => {
  console.log('server is running on port', server.address().port);
});


app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))

app.get('/messages', (req, res) => {
  Message.find({},(err, messages)=> {
    res.send(messages);
  })
})


app.get('/messages/:user', (req, res) => {
  var user = req.params.user
  Message.find({name: user},(err, messages)=> {
    res.send(messages);
  })
})


app.post('/messages', async (req, res) => {
  try{
    var message = new Message(req.body);

    var savedMessage = await message.save()
      console.log('saved');

    var censored = await Message.findOne({message:'badword'});
      if(censored)
        await Message.remove({_id: censored.id})
      else
        io.emit('message', req.body);
      res.sendStatus(200);
  }
  catch (error){
    res.sendStatus(500);
    return console.log('error',error);
  }
  finally{
    console.log('Message Posted')
  }

})






io.sockets.on('connection', (socket) =>{
  console.log('a user is connected')
  
  var connectEvent=new Elog({type:'CONNECTION', socket:socket.id, room:'Lobby'})

  connectEvent.save((err)=>{

    if (err) throw err;

    console.log('\n-------Store Event in Database-------\nSocket: '+connectEvent.socket+'\nWith type: '+connectEvent.type+"\nHas been connected @: "+ connectEvent.connect +'\nIn the: '+connectEvent.room+'\nSaved to database at: '+ connectEvent.connect)



  if (err) throw err;

  }) 



  //stores new socket

  var newSock=new Sockio({socket_id:socket.id, createdBy:newUser.username})

  newSock.save((err)=>{

    if (err) throw err;

    console.log('\n==========STORE SOCKET IN DATABASE==========\nSocket: '+newSock.socket_id+"\nCreated by: "+ newSock.createdBy+"\nSaved to database at: "+ newSock.connectTime)

  })

  //store event

  var newUserEvent=new Elog({type:'NEW USER',name:newUser.username, socket:socket.id, room:'Main Room'})

  newUserEvent.save((err)=>{

    if (err) throw err;

    console.log('\n==========STORE EVENT IN DATABASE==========\nEvent Type: '+newUserEvent.type+'\nCreated by: ' + newUserEvent.name + '\nFor Socket: '+newUserEvent.socket+'\nIn the: '+newUserEvent.room+'\nSaved to database at: '+ newUserEvent.connect)

  })

  //creates a txt file of the event

  fs.appendFile('./eventLog.txt', newUserEvent.socket+" has been created @ "+ newUserEvent.connect +" and created by "+ newUserEvent.name +' in the '+newUserEvent.room+"\n", {'flags': 'a'},(err)=>{

    if (err) throw err;

    })

  socket.room = 'Main room';

// add the users's username to the global list

// send user to Main room

  socket.join('Main room');

// echo to user they've connected

// echo to Main room that another user has connected to their room

  socket.emit('updatechat', 'CHAT BOT NINJA SAYS', 'you have connected to Main room');

  socket.broadcast.to('Main room').emit('updatechat', 'CHAT BOT NINJA SAYS', socket.nickname + ' has connected to this room');

  socket.emit('updaterooms', rooms, 'Main room');
})