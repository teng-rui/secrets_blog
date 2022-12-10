//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
// const encryption=require("mongoose-encryption");
const md5 = require("md5")
const bcrypt = require('bcrypt');
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const e = require("express");

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(session({
    secret: 'secretText',
    resave: false,
    saveUninitialized: false
    // cookie: { secure: true }
}));
app.use(passport.initialize());
app.use(passport.session());

const saltRounds = 10;

mongoose.set('strictQuery', true);
const url = "mongodb+srv://ruiteng:TENG707298rui@cluster0.lpat5su.mongodb.net/secrets";
mongoose.connect(url, { useNewUrlParser: true });
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    secrets:Array
});
userSchema.plugin(passportLocalMongoose);

// const secret='qwerty';
// userSchema.plugin(encryption,{secret:secret,encryptedFields:["password"]});
const User = mongoose.model("User", userSchema);

// CHANGE: USE "createStrategy" INSTEAD OF "authenticate"
passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function (req, res) {
    res.render('home.ejs');
})
app.route('/submit')
.get(function(req,res){
    if (req.isAuthenticated()) {
        res.render("submit");
    }
    else {
        res.redirect("login");
    }

})
.post(function(req,res){
    let submitSecret=req.body.secret;
    User.updateOne({_id:req.user.id},{$push:{secrets:submitSecret}},function(err){
        if(err){
            console.log(err);
        }
        else {
            res.redirect('/submit');
        }
    })

});

app.route("/secret")
    .get(function (req, res) {
        if (req.isAuthenticated()) {
            res.render("secrets");
        }
        else {
            res.redirect("login");
        }
    });

app.route("/logout")
    .get(function (req, res) {
        req.logout(function (err) {
            if (!err) {
                res.redirect('/');
            }
        });

    });

app.route("/register")
    .get(function (req, res) {
        res.render('register.ejs');

    })
    .post(function (req, res) {
        let username = req.body.username;
        let password = req.body.password;
        // let password = md5(req.body.password);
        //md5 hashing

        User.register({ username: username }, password, function (err, user) {
            if (err) { console.log(err);
                res.redirect('/register');}
            else {
                passport.authenticate('local')(req,res,function(){
                    res.redirect('/secret');
                });
            }
        });
    });

app.route("/login")
    .get(function (req, res) {
        res.render('login.ejs');
    })
    .post(function (req, res) {
        let username = req.body.username;
        let password = req.body.password;
        newUser=new User({
            username:username,
            password:password
        });
        req.login(newUser,function(err){
            if(err){
                console.log(err);
                res.redirect('/login');
            }
            else{
                passport.authenticate('local')(req,res,function(){
                    res.redirect('/secret');
                });
            }
        })
        // let password = md5(req.body.password);

    });

app.listen(3000, function () {
    console.log('server started');
});


// app.route("/register")
//     .get(function (req, res) {
//         res.render('register.ejs');

//     })
//     .post(function (req, res) {
//         let username = req.body.username;
//         // let password = md5(req.body.password);
//         //md5 hashing
//         bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
//             let password = hash;
//             User.find({ username: username }, function (err, data) {
//                 if (err) {
//                     console.log(err);
//                 }
//                 else if (data.length) {
//                     console.log(data);
//                     res.send('email already registered');
//                 }
//                 else {
//                     const newUser = new User({
//                         username: username,
//                         password: password
//                     })
//                     newUser.save(function (err) {
//                         if (!err) {
//                             res.render('secrets');
//                         }
//                         else {
//                             console.log(err);
//                         }
//                     });

//                 }

//             });
//         });



//     });

// app.route("/login")
//     .get(function (req, res) {
//         res.render('login.ejs');
//     })
//     .post(function (req, res) {
//         let username = req.body.username;
//         // let password = md5(req.body.password);

//         User.findOne({ username: username }, function (err, data) {
//             if (err) {
//                 console.log(err);
//             }
//             else if (data) {

//                 bcrypt.compare(req.body.password, data.password, function (err, result) {
//                     if (result) {
//                         res.render('secrets');
//                     }
//                     else {
//                         res.send('password incorrect');
//                     }
//                 });
//             }
//             else {
//                 console.log(data);
//                 res.send('cannot find user');
//             }
//         });
//     });

// app.listen(3000, function () {
//     console.log('server started');
// });