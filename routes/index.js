var express = require('express');
var router = express.Router();
var userModel = require('../models/users')
var documentModel = require('../models/documents')
var uid2 = require('uid2')
var bcrypt = require('bcrypt');

/* GET home page. */

router.get('/', function(req, res, next) {

res.render('index', { title: 'Locatio back-end test maj super pizza' });

});

router.post('/sign-up', async function (req, res) {

    var error = []
    var result = false
    var saveUser = null
    var token = null

    const data = await userModel.findOne({
        email: req.body.email
    })
    
    if(data != null){
        error.push('utilisateur déjà présent')
    }
    
    if(req.body.firstName == ''
    || req.body.lastName == ''
    || req.body.email == ''
    || req.body.password == ''
    ){
        error.push('champs vides')
    }

    if(error.length == 0){
        var hash = bcrypt.hashSync(req.body.password, 10);
        var newUser = new userModel({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: hash,
            token: uid2(32),
        })
        saveUser = await newUser.save()
        if(saveUser){
            result = true
            token = saveUser.token
        }
    }
    
    res.json({result, saveUser, error, token})
    
});

router.post('/sign-in', async function(req,res,next){

    var result = false
    var user = null
    var error = []
    var token = null
    
    if(req.body.email == ''
    || req.body.password == ''
    ){
      error.push('Champs vides')
    }
  
    if(error.length == 0){
      user = await userModel.findOne({
        email: req.body.email,
      })
      
      if(user){
        if(bcrypt.compareSync(req.body.password, user.password)){
          result = true
          token = user.token
        } else {
          result = false
          error.push('Mot de passe ou email incorrect')
        }
      } 
    }
    
  
    res.json({result, user, error, token})
  
  
  })

router.post('/property-info', function (req, res){

let surface = req.body.surface

let numberRooms = req.body.numberRooms

if(surface && numberRooms){

res.json({result: true });

}else{

res.json({result: false });

}

} )

router.get('/document', function (req, res){
  

res.json()
})

module.exports = router;


module.exports = router;
