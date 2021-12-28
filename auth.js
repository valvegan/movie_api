const jwtSecret = 'your_jwt_secret'; //this has to be the same key used in the jwt strategy
const passport = require('passport');
const jwt = require('passport');
require('./passport'); //local passport file

let generateJWTToken = (user) => {
    return jwt.sign(user, jwtSecret,{
        subject: user.username, //this is the username youre encoding in the jwt
        expiresIn: '7d', // this specifies that the token will expire in 7 days
        algorithm: 'HS256' //This is the algorithm used to sign or encode the values of the jwt

    })
}

//post login
module.exports = (router) => {
    router.post('/login', (req, res) => {
        passport.authenticate('local', {session: false}, (error, user, info) => {
            if (error || !user){
                return res.status(400).json({
                    message: 'Something is not right',
                    user: user
                });
            }
            req.login(user, {session: false}, (error) =>{
                if (error){
                    res.send(error);
                }
                let token = generateJWTToken(user.toJSON());
                return res.json({user, token});
            });
        })(req, res);
    });
}
