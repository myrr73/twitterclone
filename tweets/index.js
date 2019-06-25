const express = require('express')
// const expressHandlebars = require ('express-handlebars')
const bodyParser = require ('body-parser')
const crypto = require('crypto')


const models = require('./models')

const app = express()
app.use(bodyParser.json())
// app.engine('handlebars', expressHandlebars({defaultLayout: 'main'}))
// app.set('view engine', 'handlebars')
app.listen(3000, () => {
  console.log('Server up and running!')
})

app.get('/', (req, res) => {
  models.User.findAll({
    attributes: [ 'name', 'username' ]
  }).then(users => {
    res.render('home', {
      users: users.map(user => user.name)
    })
    
  })
})

app.get('/:user', (req, res) => {
  models.User.findOne({
    where: { name: req.params.user }
  }).then(user => {
    if (!user) return res.status(404).send('Not found.')

    models.Tweet.findAll({
      where: { userId: user.id },
      attributes: [ 'content' ]
    }).then(tweets => {
      res.render('tweets', {
        user: user.name, 
        tweets: tweets.map(tweet => tweet.content)

      })
      
    })
  })
})

app.post('/user/:username', (req, res) => {
    models.User.findOne({
        where: {username: req.params.username}
    })
        models.Tweet.create({
            content: req.body.content
            
        }).then(user =>{
            if (!user) return res.status(404).send('User not found')

            res.json({ success: true})
            
        }).catch(error=>{
            console.log(error)
            res.status(500).send('Something went wrong.')
          })
   
        })
    


app.post('/register', (req, res) => {
  const salt = crypto.randomBytes(256).toString('hex')
  const password = crypto.pbkdf2Sync(req.body.password, salt, 10000, 256, 'sha512').toString('hex')


  models.User.create({
    name: req.body.name,
    username: req.body.username,
    password: password,
    salt: salt
  }).then(user=>{
    res.json({success: true})
  }).catch(error=>{
    console.log(error)
    res.status(500).send('Something went wrong.')
  })
})


app.delete('/user/:username', (req, res) => {
  models.User.findOne({
      where: {username: req.params.username}
  }).then(user=>{
      if (!user) return res.status(404).send('User not found')
      if (!req.headers.hasOwnProperty('authorization')) return res.status(401).send('Unauthorized.')
      if (req.headers.authorization.indexOf('Basic') === -1) return res.status(401).send('Unauthorized.')

      let credentials = req.headers.authorization.replace('Basic', '')
      credentials = new Buffer(credentials, 'base64').toString('ascii').split(':')
    
      //Validerar användarnamnet

      if(credentials[0] !== user.username) return res.status(401).send('Unauthorized.')

      //Validerar lösenordet
      if (crypto.pbkdf2Sync(credentials[1], user.salt, 10000, 256, 'sha512').toString('hex') !== user.password) {
        return res.status(401).send('Unauthorized.')
      }

      models.User.destroy({
        where: {id: user.id}

      }).then(_ => {
        res.json({success: true})
      })

  }).catch(error =>{
    console.log(error)
    res.status(500).send('Something went wrong.')
  })
})
