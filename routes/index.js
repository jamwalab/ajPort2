var express = require('express');
var router = express.Router();

let mongoose = require('mongoose');
let passport = require('passport');

// enable jwt
let jwt = require('jsonwebtoken');
let DB = require('../config/db');

// create the User Model instance
let userModel = require('../models/user');
const busContact = require('../models/contact');
let User = userModel.User; // alias
//const busContact = contactModel.contactModel;

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

router.get('/bContact', function(req, res, next) {
  if(!req.user) {
    res.redirect('/login');
  }
  else {
    busContact.find((err, contactInfo) => {
      if (err) {
        return console.error(err);
      }
      else {
        res.render('index', {
          title: 'Business Contact',
          displayName: req.user ? req.user.username : '',
          contacts: contactInfo
        })
      }
    })
  }
  
});

router.get('/updateContact/:id', function(req, res, next) {
  if(!req.user) {
    res.redirect('/login');
  }
  else {
    let contactId = req.params.id;
    busContact.findById(contactId, (err, contactInfo) => {
      res.render('index', { 
        title: 'Update Contact', 
        displayName: req.user ? req.user.username : '',
        contacts: contactInfo
      });
    })
    
  }
  
});

router.post('/updateContact/:id', function(req, res, next) {
  if(!req.user) {
    res.redirect('/login');
  }
  else {
    let contactId = req.params.id;
    let editContact = {
      "name": req.body.name,
      "contact": req.body.contact,
      "email": req.body.email,
      "user": req.user.username
    };
    busContact.updateOne({_id: contactId}, editContact, (err) => {
      if (err) {
        console.log(err);
        res.end(err);
      }
      else{
        res.redirect("/bContact")
      }
    })
  }
})

router.get('/delete/:id', (req, res, next) => {
  let contactId = req.params.id;
  busContact.remove({_id: contactId}, (err) => {
    if (err) {
      console.log(err);
      res.end(err);
    }
    else{
      res.redirect("/bContact")
    }
  })
})

router.get('/addContact', function(req, res, next) {
  if(!req.user) {
    res.redirect('/login');
  }
  else {
    res.render('index', { 
      title: 'Add Contact', 
      displayName: req.user ? req.user.username : '',
      contacts: ""
    });
  }
  
});

router.post('/addContact', function(req, res, next) {
  if(!req.user) {
    res.redirect('/login');
  }
  else {
    let newContact = busContact({
      "name": req.body.name,
      "contact": req.body.contact,
      "email": req.body.email,
      "user": req.user.username
    });
    busContact.create(newContact, (err, contact) => {
      if (err) {
        console.log(err);
        res.end(err);
      }
      else{
        res.redirect("/bContact")
      }
    })
  }

})

module.exports = router;