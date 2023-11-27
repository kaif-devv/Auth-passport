var express = require('express');
var router = express.Router();
const userModel = require("./userModel");
const { default: mongoose } = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/pspt');
const passport = require("passport");
const localStrategy = require("passport-local").Strategy
const bcrypt = require("bcrypt");

/* GET home page. */
router.get('/', function (req, res) {
  res.render('index', { title: "Express" });
});

router.get('/register', function (req, res) {
  res.render('register');
});
router.get('/page',isLoggedIn, function (req, res) {
  res.render('page');
});

router.post('/register', async function (req, res, next) {
  try {
    const { name, username, password } = req.body;
const hashedPassword = await bcrypt.hash(password , 10);
     await userModel.create({
      name: name,
      username: username,
      password: hashedPassword
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
  res.redirect('/login')
});

passport.use(
  new localStrategy(
    async (username, password, done) => {
      try {
        const user = await userModel.findOne({ username: username });
        const match =await bcrypt.compare(password , user.password);
        if (!user || username !== user.username) return done(null, false, { message: "Incorrect Username" });
        if (!password || !match) return done(null, false, { message: "Incorrect password" });
        return done(null,user);
      } catch (error) {
        return done(error)

      }
    }
  )
)

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await userModel.findById(id);
    done(null, user);
  } catch(err) {
    done(err);
  };
});



router.get('/login', function (req, res) {
  res.render('login');
});

router.post('/login', passport.authenticate ('local',{
  successRedirect : '/home',
  failureRedirect : '/login'
})
);
router.get('/home', isLoggedIn,function (req, res) {
  res.render('home');
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/login');
  }
}
router.get("/log-out", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});
module.exports = router;
