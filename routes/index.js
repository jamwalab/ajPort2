var express = require('express');
var router = express.Router();

let mongoose = require('mongoose');
let passport = require('passport');

// enable jwt
let jwt = require('jsonwebtoken');
let DB = require('../config/db');

// create the User Model instance
let userModel = require('../models/user');
let User = userModel.User; // alias

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Home', displayName: req.user ? req.user.username : ''});
});

/* GET home page. */
router.get('/home', function(req, res, next) {
  res.render('index', { title: 'Home', displayName: req.user ? req.user.username : ''});
});

/* GET About Us page. */
router.get('/about', function(req, res, next) {
  res.render('index', { title: 'About', displayName: req.user ? req.user.username : ''});
});

/* GET Products page. */
router.get('/projects', function(req, res, next) {
  res.render('index', { title: 'Projects', displayName: req.user ? req.user.username : ''});
});

/* GET Services page. */
router.get('/services', function(req, res, next) {
  res.render('index', { title: 'Services', displayName: req.user ? req.user.username : ''});
});

/* GET Contact Us page. */
router.get('/contact', function(req, res, next) {
  res.render('index', { title: 'Contact', displayName: req.user ? req.user.username : ''});
});

router.get('/login', function(req, res, next) {
  if(!req.user) {
    res.render('index', { title: 'Login', displayName: req.user ? req.user.username : ''});
  }  
  else
  {
      return res.redirect('/');
  }
});

router.get('/register', function(req, res, next) {
  if(!req.user) {
    res.render('index', { title: 'Register', displayName: req.user ? req.user.username : ''});
  }
  else
  {
      return res.redirect('/');
  }
});

router.post('/login', function(req, res, next) {
  console.log(req.body.username, req.body.password)
  passport.authenticate('local',
  (err, user, info) => {
      // server err?
      if(err)
      {
          return next(err);
      }
      // is there a user login error?
      if(!user)
      {
          req.flash('loginMessage', 'Authentication Error');
          return res.redirect('/login');
      }
      console.log(user);
      req.login(user, (err) => {
          // server error?
          if(err)
          {
              return next(err);
          }

          const payload = 
          {
              id: user._id,
              username: user.username,
              email: user.email
          }

          const authToken = jwt.sign(payload, DB.Secret, {
              expiresIn: 604800 // 1 week
          });

          return res.redirect('/');
      });
  })(req, res, next);
});

router.post('/register', function(req, res, next) {
    // instantiate a user object
  let newUser = new User({
      username: req.body.username,
      email: req.body.email,
  });

  User.register(newUser, req.body.password, (err) => {
      console.log(err);
      if(err)
      {
          console.log("Error: Inserting New User");
          if(err.name == "UserExistsError")
          {
              req.flash(
                  'registerMessage',
                  'Registration Error: User Already Exists!'
              );
              console.log('Error: User Already Exists!')
          }
          return res.render('auth/register',
          {
              title: 'Register',
              messages: req.flash('registerMessage'),
              displayName: req.user ? req.user.username : ''
          });
      }
      else
      {
          // if no error exists, then registration is successful

          // redirect the user and authenticate them

          /* TODO - Getting Ready to convert to API
          res.json({success: true, msg: 'User Registered Successfully!'});
          */

          return passport.authenticate('local')(req, res, () => {
              res.redirect('/')
          });
      }
  });
});

router.get('/logout', function(req, res, next) {
  req.session.destroy();
  //req.logout();
  res.redirect('/');
});


module.exports = router;