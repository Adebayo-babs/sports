const express = require('express'),
      router = express.Router();
      const Latest = require('../model/Latest');
      const Updates = require('../model/Updates');
      const Contact = require('../model/Contact')
    

router.get('/',(req,res)=>{

    Updates.find((err,record)=>{
        if (err) console.log(err);
        else {
            res.render('index',{record:record});
        }
    }).sort({ date: 'desc' });
});

router.get("/newIndDetails/:slug", (req, res) => {
        Updates.find({slug:req.params.slug}, (err, record) => {
            if (record) {
                res.render('newIndDetails', {record});
            } else{
                console.log(err)
            }
        })
    });

//View Latest News On Click

router.get('/viewLatestNews',(req,res)=>{

    Updates.find((err,record)=>{
        if (err) console.log(err);
        else {
            res.render('viewLatestNews',{record:record});
        }
    }).sort({ date: 'desc' });
})


// Details
router.get("/newIndDetails/:slug", (req, res) => {
        Updates.find({slug:req.params.slug}, (err, record) => {
            if (record) {
                res.render('newIndDetails', {record});
            } else{
                console.log(err)
            }
        }).sort({ date: 'desc' })
    })



//View Sports by Category
router.get('/sports/:category', (req,res)=>{

        // console.log(req.params);
        // res.send("Processing");

        Latest.find({category:req.params.category}, (err, record) => {
            if (record) {
                res.render('vSports', {record})
            }
        }).sort({ date: 'desc' })

});

//View Details of Sports
router.get("/details/:slug", (req, res) => {
        Latest.find({slug:req.params.slug}, (err, record) => {
            if (record) {
                res.render('vDetails', {record});
            } else{
                console.log(err)
            }
        }).sort({ date: 'desc' })
    })


router.get('/contactUs', (req, res) => {

    res.render('contact');

})

router.post('/contactUs', (req, res)=>{
    const{mail, message} = req.body;

    let errors = [];

    if(errors.length > 0){
        res.render('contact', {
            errors,
            mail, message
        });

    }else{
        //validation passed            
            const newContact = new Contact({
                        mail, message

        });

            //Save new user
            newContact.save()
            .then(user => {
            req.flash('success_msg', 'Message sent successfully')
            res.redirect('/contactUs');
            })
            .catch(err => console.log(err))
                    }

    });

// router.get('/search', (req, res) => {
// res.render('search')
// });



module.exports=router; 