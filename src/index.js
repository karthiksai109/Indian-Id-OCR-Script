const express=require('express')
const mongoose=require('mongoose')
const app=express()
const multer=require('multer')

const Tesseract=require('tesseract.js')
const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'./uploads/')
    },
    filename:(req,file,cb)=>{
        cb(null,file.originalname)
    }
})
const upload=multer({storage:storage})
let u=null
app.post('/uplaod',upload.single('uploadedImage'),async (req,res)=>{
    let x=null
    try{
     x=  await Tesseract.recognize(
                'uploads/'+req.file.filename,
                'eng',
               
              ).then((result) => {
               let rep=result.data.text
               let o=rep.split('\n')
            console.log(o)
            let obj={}
            if(o[1]=='INCOME TAX DEPARTMENT @ GOVT. OF INDIA'){
               
                obj['idType']="panCard"
                obj['idNumber']=o[7]
                obj["info"]={
                    "name":o[2],
                    "fatherName":o[3],
                    "dob":o[4]
                }
            }
            if(o[0]=='; Indian Union Driving Licence .'){
                let s=o[7].split(' ')
                let d=o[8].split(' ')
                let sof=o[9].split(' ')
                let licenseNumber=o[2].split(' ')
               let license= licenseNumber[1]
               
                obj['idType']="drivingLicence"
                obj['idNumber']=license
              
                obj["info"]={
                    "name":s[1]+' '+s[2],
                    "son/Daughter/wifeof":sof[6]+' '+sof[7],
                    "dob":d[3]
                }
            }

            if(o.length>26){
                let s1=o[24].split(' ')
                if(s1.includes('Aadhaar')){
                    let num=o[37].split(' ')
                    
                let s=o[31].split(' ')
                let d=o[8].split(' ')
                let sof=o[11].split(' ')

                obj['idType']="adharCard"
                obj['idNumber']=num[1]+''+num[2]+''+num[3]
              
                obj["info"]={
                    "name":o[10],
                    "son/Daughter/wifeof":sof[1]+' '+sof[2],
                    "dob":s[2]
                }
                }
            }
               return res.send(obj)
                
              })
    }catch(err){
        console.log(err.message)
    }
})
mongoose.set('strictQuery',true)
mongoose.connect('mongodb+srv://group21Database:f8HsIED1oiOyc6yi@karthikcluster.b2ikjot.mongodb.net/OCR',{
    useNewUrlParser:true
})
.then(()=>console.log('mongodb conected'))
.catch((e)=>console.log(e))

app.listen(3000,function(){
    console.log('mongodb running on port 3000')
})