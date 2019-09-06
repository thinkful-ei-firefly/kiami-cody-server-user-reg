const express = require('express')
const UsersService = require('./users-service')

const usersRouter = express.Router()
const jsonBodyParser = express.json()

usersRouter.route('/').post(jsonBodyParser, (req, res, next) => {
  const { full_name, nickname, user_name, password } = req.body

  for (const field of ['full_name', 'user_name', 'password']) {
    if (!req.body[field]) {
      return res.status(400).json({
        error: `Missing '${field}' in request body`
      })
    }
  }

  const passError = UsersService.validatePassword(password)
  if (passError) {
    return res.status(400).json({ error: passError })
  }

  UsersService.hasUserWithUserName(
    req.app.get('db'),
    user_name
  )
  .then(hasUserWithUserName => {
    if (hasUserWithUserName){
      return res.status(400).json({ error: 'Username already taken'})
    }
    return UsersService.hashPass(password)
    .then(hashedPass => {
      const newUser = {
      user_name,
      password: hashedPass,
      full_name,
      nickname,
      date_created: 'now()'
      }

      return UsersService.insertUser(
        req.app.get('db'),
        newUser
      )
      .then(user => {
        res
          .status(201)
          .json(UsersService.serializeUser(user))
      })
    })
  })
  .catch(next)
})

module.exports = usersRouter
