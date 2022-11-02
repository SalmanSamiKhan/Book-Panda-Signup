const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const https = require('https')

const app = express()
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static('public')) // for serving static/local files 

app.get('/', function(req,res){
    res.sendFile(__dirname+'/signup.html')
})

app.post('/', function(req,res){
    const firstName = req.body.firstName
    const lastName = req.body.lastName
    const email = req.body.email

    // Now creating a js obj according to mailchimp requirement
    const data = { // js obj data
        members:[ // members array
            { // single obj in members array
                email_address:email,
                status:"subscribed",
                merge_fields:{ // nested obj
                    FNAME:firstName, // FNAME, LNAME as per mailchimp documentation
                    LNAME:lastName
                }
            }
        ]
    } // data ends here

    // converting data obj to flat pack json
    const jsonData = JSON.stringify(data)
    const url = 'https://us8.api.mailchimp.com/3.0/lists/listsId'
    const options = {
        method: 'POST',
        auth: 'username:apiKey' // name: apiKey
    }
    // storing into request --> sending request procedure to mailchimp
    const request = https.request(url, options, function(response){
        response.on('data', function(data){
            // console.log(JSON.parse(data));
            if(response.statusCode===200){ // status code 200 = success
                res.sendFile(__dirname+'/success.html') // show success msg
            }
            else{
                res.sendFile(__dirname+'/failure.html') // show failure msg
            }
        })
    })
    request.write(jsonData) // requesting to write data
    request.end() // end process
})

app.post('/failure', function(req,res){
    res.redirect('/') // if signup results in error page, try again btn redirects to home
})

app.listen(process.env.PORT ||3000, function(){
    console.log('server running on port 3000')
})
