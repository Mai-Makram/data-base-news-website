const express = require('express')

const router = express.Router()

const User = require('../models/reportarModels')

const auth = require('../middelware/auth')



router.post('/signup', async (req, res) => {
    try{
        const user = new User(req.body) // {}
        await user.save()
        const token = await user.generateToken()
        res.status(200).send({user,token})
    }
    catch(e){
        res.status(400).send(e)
    }

})


// login

router.post('/login',async (req,res)=>{
    try{
        const user = await User.findByCredentials(req.body.email,req.body.password)
        const token = await user.generateToken()
        res.status(200).send({user,token})
    }
    catch(e){
        res.status(400).send(e.message)
    }
})



// profile 
router.get('/profile',auth,async(req,res)=>{
    res.send(req.user)
})



// get all users

router.get('/users', auth,(req, res) => {
    User.find({}).then((users) => {
        res.status(200).send(users)
    }).catch((e) => {
        res.status(500).send(e)
    })
})

// get user by id 

router.get('/users/:id',auth,(req,res)=>{
    // req.params --> return object having value of id entered in url (localhost:3000/users/894758347658347653)
    // console.log(req.params)
    const _id = req.params.id
    User.findById(_id).then((user)=>{
        if(!user){
          return  res.status(404).send('Unable to find user')
        }
        res.status(200).send(user)
    }).catch((e)=>{
        res.status(500).send(e)
    })
})

//update

router.patch('/users/:profile',auth,async (req,res)=>{
    const _id = req.user
    /**
     * {"name":"mahmoud",
    "password":"123456789"
}
     */
    const updates = Object.keys(req.body)
    // console.log(updates)
   try{
       // bypass middleware (pre)
       const user = await User.findById(_id)
       if(!user){
        return res.status(404).send('Unable to find user')
    }
       console.log(user)
      
       updates.forEach((update)=> (user[update] = req.body[update]))
       await user.save()
       
       
       res.status(200).send(user)
   }catch(e){
       res.status(400).send(e.message)
   }
})



// delete 
router.delete('/users/:profile',auth,async(req,res)=>{
    //const _id = req.params.req.user
    const _id = req.user
    try{
        const user = await User.findByIdAndDelete(_id)
        if(!user){
            return res.status(404).send('No user is found')
        }
        res.send(user)
    }
    catch(e){
        res.status(500).send(e.message)
    }
})


// logout 

router.delete('/logout',auth,async(req,res)=>{
    try{
        // console.log(req.user)
        req.user.tokens = req.user.tokens.filter((el)=>{
            
            return el !== req.token
        })
        await req.user.save()
        res.send('Logout Successfully')
    }
    catch(e){
       res.status(500).send(e.message)
    }
})

// logoutall 
router.delete('/logoutall',auth,async(req,res)=>{
   try{
        req.user.tokens = []
    await req.user.save()
    res.send('Logout all was done successfully')
   }
   catch(e){
       res.send(e)
   }
   
})


module.exports = router
