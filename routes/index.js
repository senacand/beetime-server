var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Session = mongoose.model('Session');
var Survey = mongoose.model('Survey');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send("Hello world");
});

router.post('/login', function(req, res, next){
  const { email, password } = req.body;
  if(email==null||password==null){
    res.status(400).json({
      error: 'Bad request'
    });
  }
  else {
    User.authenticate(email, password, function(err, result){
      if(err){
        res.status(401).json({
          error: 'Invalid login'
        });
        return;
      }
      Session.create({
        user: result._id,
      }, function(err, result){
        if(err) {
          console.log('Error: ' + err);
          res.status(500).json({
            error: 'An internal server error occurred. Please try again later.'
          });
          return;
        }
        res.cookie('userSession', result._id, { maxAge: 3600000, path: '/', httpOnly: true});
        res.json({
          sessionId: result._id,
        });
      });
    });
  }
});

router.post('/register', function(req, res, next){
  const { email, password, fullname } = req.body;
  if(email==null||password==null||fullname==null){
    res.status(400).json({
      error: 'Bad request'
    });
  }
  else {
    User.create({email, password, fullname}, function(err, user){
      if(err){
        res.status(409).json({
          error: 'E-mail already in use'
        });
        return;
      }
      res.json(user);
    });
  }
});

router.get('/user', function(req, res, next){
  if(req.user){
    res.json(req.user);
  }
  else {
    res.json({

    })
  }
});

router.post('/survey', function(req, res, next){
  const {title, description} = req.body;
  if(!title||!description){
    res.status(400).json({
      error: 'Fulfill the required data',
    })
  }
  else if(req.user){
    Survey.create({
      title,
      description,
      user: req.user['_id'],
    }, function(err, result){
      if(err){
        console.log('Error: ' + err);
        res.status(500).json({
          error: 'An internal server error occurred. Please try again later.'
        });
      }
      else {
        res.json(result);
      }
    });
  }
  else {
    res.status(401).json({
      error: 'Need to be logged in to use this feature'
    });
  }
});

module.exports = router;
