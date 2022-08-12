const express = require('express'),
router = express.Router();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const passport = require('passport');
const { ensureAuthenticated } = require('../config/auth');


const Admin = require('../model/Admin');
const Latest = require('../model/Latest');
const Updates = require('../model/Updates');
const Contact = require('../model/Contact')

let fs = require('fs');
let path = require('path');
let multer = require('multer');

 // MULTER
let storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, __dirname + '/uploads/')
    },
    filename: function(req, file, cb) {
      console.log(file)
      cb(null, file.fieldname +'-'+ Date.now());
    }
  })
  
  const upload = multer({storage:storage});
  

router.get('/sig', (req, res) => {
    res.render('sig');
})

router.get('/login', (req, res) => {

    res.render('login');

})




router.post('/sig', upload.single('image'), (req, res)=>{
    const{cName, cEmail, username, password,password2} = req.body;

    let errors = [];

    //Check passwords match

    if(password !== password2){
        errors.push({msg: "Passwords do not match"});
        req.flash('error_msg', 'Passwords do not match') 
    }

    //Check password length
    if(password.length < 8){
        errors.push({msg: "password should be at least eight characters"})
    }

    if(errors.length > 0){
        res.render('sig', {
            errors,
            cName,cEmail, username, password,password2
        });

    }else{
        //validation passed
            Admin.findOne({ username: username  })
            .then(admin => {
                if(admin){
                    //user exists
                    errors.push({msg: 'Username is already registered'});
                    res.render('sig', {
                        errors,
                        cName,cEmail, username, password,password2
                    });

                }
                else{
                    const newAdmin = new Admin({
                        cName, cEmail, username, password,  upload:{
            data:fs.readFileSync(path.join(__dirname+'/uploads/'+req.file.filename)),
            contentType: 'image/png'
          }
        });
                    //Hash Password
                    bcrypt.genSalt(10, (err, salt) => 
                        bcrypt.hash(newAdmin.password, salt, (err, hash) => {
                            if(err) throw err;

                            //Set password hashed
                            newAdmin.password = hash;

                            //Save new user
                            newAdmin.save()
                            .then(user => {
                                req.flash('success_msg', 'You are now successfully registered and can log in')
                                res.redirect('/admin/login');
                            })
                            .catch(err => console.log(err))
                    }))

                }
            });
    }
});

//login handle

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect:'/admin/dashboard',
        failureRedirect:'/admin/login',
        failureFlash:true
    })(req, res, next);
});

//Dashboard

router.get('/dashboard', ensureAuthenticated, (req,res)=>{

        Admin.find({username:req.user.username}, function(err, record){
            if(err){
                console.log(err);
                res.send('There is an issue')
            }
            else{
                console.log(req.user.username)
                res.render('dashboard', {record,username:req.user.username})
            }
        })

})

//LATEST NEWS
router.get('/latestnews', ensureAuthenticated, (req,res)=>{

        Latest.find({username:req.user.username}, function(err){
            if(err){
                console.log(err);
                res.send('There is an issue')
            }
            else{
                // console.log(req.user.username)
                res.render('latestNews', {username:req.user.username})
            }
        })
});

router.post('/latestnews', upload.single('image'), (req, res)=>{
    const{title, subtitle, category, article} = req.body;

    let errors = [];

    if(errors.length > 0){
        res.render('latestnews', {
            errors,
            title, subtitle, category, article
        });

    }else{
        //validation passed            
            const newLatest = new Latest({
                        title, subtitle, category, article, username:req.user.username,  upload:{
            data:fs.readFileSync(path.join(__dirname+'/uploads/'+req.file.filename)),
            contentType: 'image/png'
          }
        });

            //Save new user
            newLatest.save()
            .then(user => {
            req.flash('success_msg', 'Article added successfully')
            res.redirect('/admin/latestnews');
            })
            .catch(err => console.log(err))
                    }

    });

router.get('/viewLatestNews', ensureAuthenticated, (req,res)=>{

        Latest.find({username:req.user.username}, function(err, record){
            if(err){
                console.log(err);
                res.send('There is an issue')
            }
            else{
                //console.log(req.user.username)
                res.render('viewLatestNews', {record,username:req.user.username})
            }
        })

});

router.get('/new', ensureAuthenticated, (req,res)=>{

        Updates.find({username:req.user.username}, function(err, record){
            if(err){
                console.log(err);
                res.send('There is an issue')
            }
            else{
                //console.log(req.user.username)
                res.render('new', {record,username:req.user.username})
            }
        })

});

router.post('/new', upload.single('image'), (req, res)=>{
    const{title, subtitle, article} = req.body;

    let errors = [];

    if(errors.length > 0){
        res.render('new', {
            errors,
            title, subtitle, article
        });

    }else{
        //validation passed            
            const newUpdates = new Updates({
                        title, subtitle, article, username:req.user.username,  upload:{
            data:fs.readFileSync(path.join(__dirname+'/uploads/'+req.file.filename)),
            contentType: 'image/png'
          }
        });

            //Save new user
            newUpdates.save()
            .then(user => {
            req.flash('success_msg', 'Article added successfully')
            res.redirect('/admin/new');
            })
            .catch(err => console.log(err))
                    }

    });


//View Latest News
router.get('/viewNew', ensureAuthenticated, (req,res)=>{

        Updates.find({username:req.user.username}, function(err, record){
            if(err){
                console.log(err);
                res.send('There is an issue')
            }
            else{
                //console.log(req.user.username)
                res.render('viewNew', {record,username:req.user.username})
            }
        }).sort({ date: 'desc' })

});

//View Messages
router.get('/someMes', ensureAuthenticated, (req, res)=>{

    Contact.find((err,record)=>{
        if (err) console.log(err);
        else {
            res.render('messages',{record:record});
        }
}).sort({ date: 'desc' })
})

//DELETE LATEST ARTICLE
router.get('/:id', (req, res) => {
        
         Updates.deleteOne({_id:req.params.id}, (error, record) => {
            if (error) {
                req.flash('error_msg', "Could not query database")
            } else {
                req.flash('message', "Article deleted successfully");
                res.redirect('/admin/viewNew')
            }
        })
})


//View Details of Latest News
router.get("/newDetails/:slug", ensureAuthenticated, (req, res) => {
        Updates.find({ slug:req.params.slug}, (err, record) => {
            if (record) {
                res.render('newDetails', {record});
            } else{
                console.log(err)
            }
        })
    });



// Delete Article
router.get('/:id', (req, res) => {
        
         Latest.deleteOne({_id:req.params.id}, (error, record) => {
            if (error) {
                req.flash('error_msg', "Could not query database")
            } else {
                req.flash('message', "Article deleted successfully");
                res.redirect('/admin/dashboard')
            }
        })
})





router.get('/sports/:category', ensureAuthenticated, (req,res)=>{

        // console.log(req.params);
        // res.send("Processing");

        Latest.find({category:req.params.category}, (err, record) => {
            if (record) {
                res.render('sports', {record})
            }
        }).sort({ date: 'desc' })

});

router.get("/details/:slug", ensureAuthenticated, (req, res) => {
        Latest.find({slug:req.params.slug}, (err, record) => {
            if (record) {
                res.render('details', {record});
            } else{
                console.log(err)
            }
        }).sort({ date: 'desc' })
    })



// //Edit Article
// router.get('/edit/:pid', ensureAuthenticated, (req, res) => {
//     Latest.find({_id:req.params.pid}, (error, record) => {
//                 if (error) {
//                     req.flash('error_msg', "Could not query database")
//                     res.redirect('/edit/:pid');
//                 } else {
//                     res.render('editLatest', {record, username:req.user.username});
//                 }
//             })
// });

// router.post('/edit/:pid', ensureAuthenticated, (req, res) => {
//         const {title, subtitle, category, article, date} = req.body;

//         Latest.updateOne({_id:req.params.pid}, {$set:{title, subtitle, category, article, date}}, (error, record) => {
//             if (error) {
//                 req.flash('error_msg', "Could not update Article");
//                 res.redirect('/edit/:pid');
//             } else {
//                 req.flash('message', "Article successfully updated");
//                 res.render('sports', {record});
//             }
//         })
//     })




router.get('/logout', (req, res) =>{
    req.logout;
     req.session.destroy();
     req.session = null;
    res.redirect('/admin/login');
 });

module.exports=router; 
