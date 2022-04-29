var express = require("express")
var bodyParser = require("body-parser")
var mongoose = require("mongoose")
require('dotenv/config')

const app = express()
const config = require("./config")
const client = require("twilio")(config.accountSID, config.authToken)

app.use(bodyParser.json())
app.use(express.static('Front-end'))
app.use(bodyParser.urlencoded({
    extended:true
}))

mongoose.connect(process.env.DB_connect,{
    useNewUrlParser: true,
    useUnifiedTopology: true
});

var db = mongoose.connection;

db.on('error',()=>console.log("Error in Connecting to Database"));
db.once('open',()=>console.log("Connected to Database"))

app.post("/sign_up",(req,res)=>{
    var First_Name = req.body.First_Name;
    var Last_Name = req.body.Last_Name;
    var email = req.body.email;
    var password = req.body.password;
    var phone_number = req.body.phone_number;

    var data = {
        "First_Name": First_Name,
        "Last_Name": Last_Name,
        "email" : email,
        "password" : password,
        "phone_number" : phone_number
    }

    db.collection('customers').insertOne(data,(err,collection)=>{
        if(err){
            throw err;
        }
        console.log("Record Inserted Successfully");
    });

    return res.redirect('homepage.html')

});

app.post("/Login", async(req,res)=>{

    try {
        var email = req.body.email;
        var clPassword = req.body.password;
        // console.log(`${email} and password is ${clPassword}`)

        const usermail = await db.collection('customers').findOne({email:email})
        var passwoedDB = usermail.password
        
        if(passwoedDB === clPassword){
            return res.redirect('homepage.html')
        }else {
            res.send("passwoed are not matching")
        }

    } catch (error){
        res.status(400).send("invalid Email")
    }

});

app.post("/Login_phone", async(req,res)=>{
    const phone_number = req.body.phone_number;
    // console.log(`${phone_number}`)

    const userphone_number = await db.collection('customers').findOne({phone_number:phone_number})
    var phone_numberDB = userphone_number.phone_number
    client
        .verify
        .services(config.serviceID)
        .verifications
        .create({
            to : `+${phone_numberDB}`,
            // channel : req.query.channel
            channel : "sms"
        })
        .then(() => {
            // res.json(result);
            return res.redirect('login_verify.html');
        })
        .catch(err => {
            res.json({err});
        });
                    
});

app.post("/verify", async(req,res)=>{
    const phone_number = req.body.phone_number;
    const OTP = req.body.otp

    client
        .verify
        .services(config.serviceID)
        .verificationChecks
        .create({
            to : `+${phone_number}`,
            code : OTP
        })
        .then((result) => {
            var status = result["status"]
            if ("approved" == status){
                return res.redirect('homepage.html');
            }else{
                res.json('OTP is wrong');
            }
        })
        .catch(err => {
            res.json({err});
        });

})

// start server
const PORT = process.env.PORT;
app.get("/",(req,res)=>{
    res.set({
        "Allow-access-Allow-Origin": '*'
    })
    return res.redirect('SignUp.html');
}).listen(PORT);


console.log(`Server Running on port ${PORT}`);

