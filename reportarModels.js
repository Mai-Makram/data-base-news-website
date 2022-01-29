
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')

const userSchema = new  mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true 
    },
    email:{
        type:String,
        unique:true,
        required:true,
        trim:true,
        lowercase:true,  
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid')
            }
        } 

    },
    age:{
        type:Number,
        default:20,
        validate(value){
            if(value<0){
                throw new Error('Age must be a postive number')
            }
        }
    },
    password:{
      type:String,
      required:true,
      trim:true,
      minlength:6  
    },
    fullnumber:{
        type:String,
        required:true,
        validate(value) {
            if (!validator.isMobilePhone(value,'ar-EG')) {
             throw new Error('Phone is invalid');
            }
           }
    },
    tokens:[
        {
            type:String,
            required:true
        }
    ],
    
},{
    timestamps:{currentTime:()=>new Date().getDate()+(3.55*60*60*1000)}
})


// relations 
userSchema.virtual('tasks',{
  ref:'Task', // name of collection relation
  localField:'_id', 
  foreignField:'owner'
})



userSchema.pre('save',async function(next){
    // this --> document of user
    const user = this
    if(user.isModified('password'))
   { user.password = await bcrypt.hash(user.password,8)}

})



// login 

userSchema.statics.findByCredentials = async (email,password) =>{
    const user = await User.findOne({email})
   
    if(!user){
        throw new Error ('Unable to login..please check email')
    }
    // 123456 --> req.body.password  --> user.password
    const isMatch = await bcrypt.compare(password,user.password)
    if(!isMatch){
        throw new Error('Unable to login.. please check password')
    }

    return user
}



// generate token
// methods call function on variable 
userSchema.methods.generateToken = async function(){
    // this --> document
    const user = this
    const token = jwt.sign({_id:user._id.toString()},'nodecourse')
    user.tokens = user.tokens.concat(token)
    
    await user.save()
    return token
}


const User = mongoose.model('User',userSchema)

module.exports = User