const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy

passport.use(new GoogleStrategy({
    clientID:process.env.GOOGLE_CLIENT-ID ,
    clientSecret:process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:process.env.GOOGLE_CALLBACK_URL,
    passReqToCallback:true,
},function(request,accessToken,refereshToken,profile,done){
    console.log(profile);
    return done(null,profile)
}))