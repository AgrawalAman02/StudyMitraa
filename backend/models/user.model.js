import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    fullName:{type:String , required:true  , lowercase:true , trim:true},
    email:{type:String , required:true , unique:true , lowercase:true , minLength:[5 , 'Please Enter atleast 5 characters']},
    password:{type:String , required:true , select:false},
    avatarUrl:{type:String , require:true , default:'https://nerdyabhi.github.io/Cara/img/logo.png'}})

const userModel = mongoose.model('user' , userSchema);

export {userModel};