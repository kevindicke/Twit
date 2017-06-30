// make it real-time, make it count...
const
  dotenv = require('dotenv').load({silent: true}),
  express = require('express'),
  app = express(),
  server = require('http').Server(app),
  io = require('socket.io')(server),
  Twit = require('twit')

const Twitter = new Twit({
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  access_token: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  timeout_ms: 60*1000
})

// var twitterStream = Twitter.stream('statuses/filter', {track: 'kanye'})
// twitterStream.on('tweet', (tweet)=>{
//   console.log(tweet.text);
// })

io.on('connection', (socket)=>{
  console.log('New client connection');
  socket.on('start-stream', (filterText)=>{
    console.log('Client is requesting:', filterText);
    if(socket.twitterStream) socket.twitterStream.stop()
    socket.twitterStream = Twitter.stream('statuses/filter', {track: filterText})
    socket.twitterStream.on('tweet', (tweet)=>{
      socket.emit('new-tweet', tweet)
    })
  })
  socket.on('stop-stream', ()=>{
    console.log('client want to stop stream');
    if(socket.twitterStream) socket.twitterStream.stop()
  })
})

app.use(express.static(__dirname + '/public'))

server.listen(3000, (err)=>{
  console.log(err||'Server running on port 3000');
})
