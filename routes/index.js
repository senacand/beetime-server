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

//Creating new user
router.post('/user', function(req, res, next){
  const { email, password, fullname } = req.body;
  if(!email||!password||!fullname){
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

//Getting current user
router.get('/user', function(req, res, next){
  if(req.user){
    res.json(req.user);
  }
  else {
    res.json({

    }) //empty
  }
});

//Finding survey
router.get('/survey/:id', function(req, res, next){
  const { id } = req.params;
  console.log('ID: ' + id);
  Survey.findOne({_id: mongoose.Types.ObjectId(id)}, function(err, result){
    if(err){
        console.log(err);
        res.status(500).json({
          "error": "An internal server error occured. Please try again later."
        });
    }
    else if(!result){
      res.status(404).send();
    }
    else {
      if(!req.body.includeAnswers)
        delete result['answers'];
      res.json(result);
    }
  });
});

//Answering survey
router.post('/survey/:post', function(req, res, next){
  const { schedule, name, program, nim } = req.body;
  console.log(req.body);

  if(!schedule||!name||!program||!nim) {
    return res.status(400).json({error: "Bad request"});
  }


  //Making sure the schedule array only contains the right data
  var fixedSchedule = [];
  for(let i=0; i<6; i++){
    var fixedDaily = [];
    for(let j=0; j<7; j++){
      if(schedule[i][j])
        fixedDaily.push(1);
      else
        fixedDaily.push(0);
    }
    fixedSchedule.push(fixedDaily);
  }

  var surveyAnswer = {
    nim,
    name,
    program,
    schedule: fixedSchedule,
  }

  Survey.update({_id:req.params.post}, {$push: {answers: surveyAnswer}}, function(err, result){
    if(err){
      console.log('Error: ' + err);
      return res.status(500).json(
        {error: 'An internal server error occured. Please try again later.'}
      );
    }
    else if(result){
      return res.status(200).json({
        'success': 'success'
      });
    }
    else {
      return res.status(404);
    }
  });
});

//Getting user's survey
router.get('/survey', function(req, res, next){
  if(req.user){
    Survey.find({user: req.user['_id']}, null, {sort: '-createdAt'}, function(err, result){
      if(err){
        console.log(err);
        res.status(500).json({
          "error": "An internal server error occured. Please try again later."
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

//Creating new survey
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
