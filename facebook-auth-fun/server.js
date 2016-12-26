var express = require('express');
var passport = require ('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var expressSession = require('express-session');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/users');
var User = require("./UserModel");

var app = express();

app.use(expressSession({ secret: 'mySecretKey'}));

app.use(passport.initialize());
app.use(passport.session());

// app.set('view-engine', 'ejs');  //TO UNDERSTAND WTF

passport.use(new FacebookStrategy({
    clientID: '199920290413262',
    clientSecret: '66bcf8f62bb6b3aacf582d432fca92e2',
    callbackURL: "http://localhost:8000/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'photos', 'email']
  },
  function(accessToken, refreshToken, profile, done) {
    console.log("accessToken:");
    console.log(accessToken);

    console.log("refreshToken:");
    console.log(refreshToken);

    console.log("profile:");
    console.log(profile);



    // return done(null, profile);

    User.findOne({ 'userId': profile.id }, function (err, user) {
        // In case of any error return
        if (err) {
          console.log('Error in SignUp: ' + err);
          return done(err);
        }

        // already exists
        if (user) {
          console.log('User already exists');
          return done(null, profile);
        } else {
          // if there is no user with that matches
          // create the user
          var newUser = new User();

          // set the user's local credentials
          newUser.userId = profile.id;
          // newUser.password = password;    // Note: Should create a hash out of this plain password!

          // save the user
          newUser.save(function (err) {
            if (err) {
              console.log('Error in Saving user: ' + err);
              throw err;
            }

            console.log('User Registration successful');
            return done(null, profile);
          });
        }
      });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

app.get('/', function(req,res) {
	res.sendFile(__dirname + '/index.html');
});

app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect : '/profile',
    failureRedirect : '/facebookCanceled'
  }));

app.get('/profile', function(req,res){
	console.log(req.user);
	res.render('profile.ejs', {
		user: req.user
	});
});

app.get('/logout', function(req,res){
  req.logout();
  res.redirect('/');
});

app.listen(8000);