//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
var _=require("lodash");  //for converting the url entered by user after localhost:3000/...... into lowercase and without any hiphens , dots or underscore.
const https=require("https"); //for sending the data of the form to the mailchimp website.
const nodemailer = require('nodemailer'); // for sending emails

//for database
const mongoose= require("mongoose");
mongoose.set('strictQuery',true);
//mongoose.connect("mongodb://127.0.0.1:27017/Journal",{useNewUrlParser:true},{serverSelectionTimeoutMS: 30000});

mongoose.connect("mongodb+srv://8228935781r:Ritu22@cluster0.sx4jmg4.mongodb.net/Journal",{useNewUrlParser:true},{serverSelectionTimeoutMS: 30000});

const val=0;
const JournalSchema=new mongoose.Schema({
  Title:String,
  Text:String
});

const UserSchema=new mongoose.Schema({
  email_address:String,
  password:String
});

const NewsSchema=new mongoose.Schema({
  email_address:String,
  password:String
});

const Journal=mongoose.model("Journal",JournalSchema);
const User=mongoose.model("User",UserSchema);
const Newsletter=mongoose.model("Newsletter",NewsSchema);

module.exports=User;

// const Journal=new JournalModel({
//    title:req.body.Title,
//    posting:req.body.postBody
// });

// Journal.save();


const mailchimp = require("@mailchimp/mailchimp_marketing");

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

let posts=[];

app.get("/",function(req,res)
{ 
  
  res.render("home",{
    HomeContent:homeStartingContent,
     posts:posts,
     p:'post'
  });
  
  
});

app.get("/about",function(req,res)
{
  res.render("about",{HomeContent:aboutContent});
});

app.get("/contact",function(req,res)
{
  res.render("contact",{HomeContent:contactContent});
});

app.get("/compose",function(req,res)
{
  res.render("compose");
});

app.post("/compose",function(req,res)
{ 

  
//------------------------for date and time-------------------------------------------------

  // const TimeE1=document.getElementById('time');
//const DateE1=document.getElementById('date');
let DateE1=0;
const days=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const Months=['January','February','March','April','May','June','July','August','September','October','November','December'];
setInterval(()=>{
const time=new Date();
const month=time.getMonth();  //0 to 11
const date=time.getDate(); // 0 to 6 
const day=time.getDay();
// const hour=time.getHours();
// const hoursIn12HrsFormat=hour>=13?hour%12:hour;
// const minutes2=time.getMinutes();
// const minutes3='0'+minutes2;
// const minutes=minutes2<=9?minutes3:minutes2;
// const ampm=hour>=12?'PM':'AM';
// TimeE1.innerHTML=hoursIn12HrsFormat + ':' +minutes + ' ' + `<span id="AM-PM"> ${ampm}</span>`;
DateE1=days[day]+ ', ' + date + ' ' + Months[month];
},1000);
//------------for database-------------------------
const J=new Journal({
  Title:req.body.Title,
  Text:req.body.postBody
});

J.save();

// -----------------------------------------------------

//---------------------------------------------------------------------------------------------


  const post={
    Title:req.body.Title,
    Text:req.body.postBody,
    date:DateE1

  };
  //res.render("compose");

  posts.push(post);
  //  res.redirect("/");

  res.redirect("/blogs");

  
});

app.get("/blogs", function(req, res) {
  Journal.find({})
    .then(function(journals) {
      res.render("blogs", { posts: journals });
    })
    .catch(function(err) {
      console.error(err);
      res.status(500).send("Internal server error");
    });
});


// app.get("/posts/:postId",function(req,res)
// {
//   const requestedPostId = req.params.postId;

//   Journal.findOne({_id: requestedPostId}, function(err, post){
//     res.render("post", {
//       title: Journal.Title,
//       content: Journal.Text
//     });
//   });
   
// });

app.get("/signIn",function(req,res)
{
  res.render("signIn");
}); 


app.post("/SignIn", async function(req,res) {
  const firstName = req.body.fname;
  const lastName = req.body.lname;
  const email = req.body.email;
  const password = req.body.pname;

  try {
    // save the new subscriber
    const N = new Newsletter({
      email_address: email,
      password: password
    });
    await N.save();
    res.render("success_newsletter");

    // send newsletter to all subscribers
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
          user: 'matt12@ethereal.email',
          pass: 'zUnCKcZQyeQgbGYtZT'
      }
    });
    const users = await User.find({}, 'email_address');
    const emails = users.map(user => user.email_address);
    emails.forEach(email => {
      console.log(email);
      const mailOptions = {
        from: '8228935781r@gmail.com',
        to: email,
        subject: 'Hello friends namaste.',
        text: 'kya re kaisan baa'
      };

      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
    });
  } catch (error) {
    console.error('Error:', error);
  }
});

  

app.get("/success",function(req,res)
{
   res.render("success");
});

app.get("/failure",function(req,res)
{
   res.render("failure");
});

app.get("/LogIn",function(req,res)
{
  res.render("LogIn");
});


app.post("/LogIn",function(req,res)
{
    var firstName=req.body.fname;
    var LastName=req.body.lname;
    
   
User.findOne({ email_address: firstName})
.then((user) => {
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  if (user.password !== LastName) {
    return res.status(401).json({ message: 'Incorrect password' });
  }
  // return res.status(200).json({ message: 'Login successful', user: user });
  return res.render("success_login");
})
.catch((err) => {
  return res.status(500).json({ message: err.message });
});

   
});


app.get("/SignInOriginal",function(req,res)
{
    res.render("SignInOriginal");
});

app.post("/SignInOriginal",function(req,res)
{
    
  var firstName=req.body.fename;
  var Password=req.body.password;


  const U=new User({
    email_address:firstName,
    password:Password
  });
  
  U.save()
  .then((result) => {
    res.render("Success_Signup");
  })
  .catch((error) => {
    console.error('Error creating user:', error);
  });
  // console.log(firstName);
  // console.log(Password);
});


app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});


// API KEY - 7f5b86c00ba71deabf12aee3022977a7-us21
//audience id - 7dc8c2a91b 