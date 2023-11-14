import {reads, updateX  , presets, linesss ,svg} from './graphs.js'


// important variables 
const body  = document.querySelector('body')
const saveBtn = document.querySelector('#save')

const socket = new WebSocket('ws://localhost:3001')

socket.addEventListener('open', function (event) {
    socket.send('Hello Server!');
    console.log('connection open')
});


// socket events 
socket.addEventListener('message', function (event) {
    
        body.setAttribute("data-online", "");

        let data = JSON.parse(event.data.toString());
        console.log(data)
        if(data.type == "data") {
            const hum = document.querySelector(".hum");
            const temp = document.querySelector(".temp");
            const index = document.querySelector(".index");
            data = data.payload
            hum.innerHTML = data.Humidity
            temp.innerHTML = data.Temperature ;
            index.innerHTML = data.Heat_Index 
            // add to data array  
            if(reads.length > 20) 
                reads.shift()
            reads.push(data)
            // update the graph
            updateX()          
        }

        // if mode
        if(data.type == "status") {
            console.log(data.payload.mode)
            if(data.payload.mode == "auto") {
                // delete data-manual from body
                body.removeAttribute("data-manual")
            }
            else {
                // add data-manual to body
                body.setAttribute("data-manual", "")
            }


            // window = 1
            if(data.payload.window == 1){   
                // add data-windowon to body 
                body.setAttribute("data-windowon", "")
            }
            else {
                // delete data-windowon from body
                body.removeAttribute("data-windowon")
            }

            // for fan = 1
            if(data.payload.fan == 1){
                // add data-fanon to body 
                body.setAttribute("data-fanon", "")
            } else {
                // delete data-fanon from body
                body.removeAttribute("data-fanon")
            }

        }

        if(data.type == "actions"){
            if(data.payload == "fanOn")
            body.setAttribute("data-fanOn", "")
            else if(data.payload == "fanOff")
            body.removeAttribute("data-fanOn", "")
            else if(data.payload == "windowOn")
            body.setAttribute("data-windowOn", "")
            else if(data.payload == "windowOff")
            body.removeAttribute("data-windowOn", "")
            else if(data.payload == "auto")
            body.removeAttribute("data-manual", "")
            else if(data.payload == "manual")
            body.setAttribute("data-manual", "")


        }

        if(data.type == "presets"){
            if(presets.inital){
                // payload ' fanOn : 30  , fanOff : 29, windowOn : 22, windowOff : 18 '
                let payload = {}
                data.payload.split(',').forEach(item => {
                    let key = item.split(':')[0].trim()
                    let value = item.split(':')[1].trim()
                    payload[key] = value
                });
                console.log(payload) ;
        
                linesss(svg , 'fanOn' , payload.fanOn) 
                linesss(svg , 'fanOff' , payload.fanOff)
                linesss(svg , 'winOn' , payload.windowOn)
                linesss(svg , 'winOff' , payload.windowOff)
                presets.inital = false ;
            }
        }
    }
  );

socket.addEventListener('close', function (event) {
    console.log('close from server ', event.data);
    // set css var starts to offline
    // set status msg data-light="offline"
    body.removeAttribute('data-online' , '')

});

socket.addEventListener('error', function (event) {
    console.log('error from server ', event.data)
});

// room control 


// on button press end a message to the server 
const mode = document.querySelector(".text")
const openWindow = document.querySelector("#openWindowBtn")
const closeWindow = document.querySelector("#closeWindowBtn")
const fanon = document.querySelector("#fanon")
const fanoff = document.querySelector("#fanoff")
const modebtn  = document.querySelector(".toggle")

fanon.addEventListener('click', () => {
    socket.send('fanOn')
})

fanoff.addEventListener('click', () => {
    socket.send('fanOff')
})

openWindow.addEventListener('click', () => {
    socket.send('openWindow')
})

closeWindow.addEventListener('click', () => {
    socket.send('closeWindow')
})


saveBtn.addEventListener('click', () => {
    console.log(presets)
    // float to int 
    socket.send(`set;${parseInt(presets.fanOn)};${parseInt(presets.fanOff)};${parseInt(presets.winOn)};${parseInt(presets.winOff)}`)
})





modebtn.addEventListener('click' ,()=>{
    socket.send(`set;${presets[0]};${presets[1]};${presets[2]};${presets[3]}\n`)
})


// register service worker
// check if service worker is supported
if ('serviceWorker' in navigator) {
    // register service worker
    navigator.serviceWorker.register('/sw.js')
      .then(function(registration) {
        console.log('Service Worker Registered');
      })
      .catch(function(err) {
        console.log('Service Worker Failed to Register', err);
      })
  }
