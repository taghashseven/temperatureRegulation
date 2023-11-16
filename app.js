import express from 'express'
import { WebSocketServer } from 'ws';
import { SerialPort } from 'serialport'
import fs from 'fs' // file system
import path from 'path'
// quick fix __dirname
import {URL} from 'url'
const __dirname = new URL('.', import.meta.url).pathname
let filedata = {

}

let msgBuffer = ''

const app = express()
// app.use('/public', express.static(__dirname + '/public'))
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(express.static('public'))

app.get('/', (req, res) => {
    // serve the 
    res.end('Hello World')
})
// arduino  auto restart



// websocket server
const wss = new WebSocketServer({ port: 3001 });

( async ()=>{
// auto scann any port with arduino and return the port 
    let arduinoPort = null
   
    try {
        let ports = await SerialPort.list()
        arduinoPort = ports.find(port => port.manufacturer?.includes('Arduino'))
        if(arduinoPort) {
            console.log('Arduino found on port : ', arduinoPort.path)
        }
        else {
            console.log('Arduino not found')
        }
    }
    catch(err) {
        // make it read
        console.log('\x1b[31m')
        console.log(err)
        console.log('\x1b[0m')
    }

    // write to the file 

    // every 10min seconds save
    setInterval(()=>{
        
        if(!filedata.saved){
            fs.appendFile(path.join('./data.csv'), 
            `${filedata.timestamp} , ${filedata.Humidity} , ${filedata.Temperature} , ${filedata.Heat_Index}` + '\n',
            (err) => {
                if (err) throw err;
            }
            )
            filedata.saved = true
        }

    }, 1000*60*10 )

    const serialport = new SerialPort({ 
        path: arduinoPort?.path || 'COM3', 
        baudRate: 9600, 
    
    })

    
    wss.on('connection', function connection(ws) {

        console.log('client connectd!')

        ws.on('error', console.error);

      
        ws.on('message', function message(data) {
          console.log('received: %s', data);
    
          // if message is fan turn on fan 
            if(data == 'manual') {
                serialport.write('manual\n')
            }
            else if(data == 'auto') {
                serialport.write('auto\n')
            }
            else if(data == 'openWindow') {
                serialport.write('openWindow\n')
            }
            else if(data == 'closeWindow') {
                serialport.write('closeWindow\n')
            }
    
            else if(data == 'fanOn') {
                serialport.write('fanOn\n')
            }
            else if(data == 'fanOff') {
                serialport.write('fanOff\n')
            }

            else if(data.includes('set')) {
                serialport.write(data + '\n')
            }   
    
        });
      
        let buffer = ''
        // on arduino data write
        serialport.on('arduinoData', (data) => {
            // console.log('arduino : ' , data)
            ws.send(JSON.stringify(data))
        });
    
        
      });

        // console serial data
    serialport.on('data' , data =>{
        // parse it base dont he format
        msgBuffer += data.toString()
        // if we have a start and end
        if(msgBuffer.includes('<<end>>')) {
            // parse it 
            let msg = msgBuffer.split('<<end>>')[0]
            // clear the msgBuffer
            msgBuffer = ''
            // parse the message 
            msg = msg.split('<<start>>')[1]
            if(msg){
                // parse the type and payload
                let msgArr = msg.split(';')
                let type = msgArr[0]?.trim()
                let payload = msgArr[1]
                // emit the data to the client

                // if type is data
                if(type == 'data' || type == 'status') {
                    // to object 
                    let params = payload.split(',')
                    let dataObj = {}
                    params.forEach(param => {
                        let keyVal = param.split(':')
                        dataObj[keyVal[0]?.trim()] = keyVal[1]?.trim()
                    })

                    // add a timestamp
                    dataObj.timestamp = Date.now()
                    dataObj.time = new Date()
                    if (type == 'data'){
                        dataObj.saved = false
                        
                        filedata = {...dataObj}
                        delete filedata.timestamp
                    }
                    serialport.emit('arduinoData', {type, payload: dataObj})
                    return ;

                }

                serialport.emit('arduinoData', {type, payload})

            }
        }

        // if 



    })


    serialport.on('error', err =>{
        console.error(err);
        console.log('\x1b[31mPlease connect the arduino to PC before running  server')
        console.log('To restart server type "rs then enter" \x1b[0m')
    })

        
})()



app.listen(3000, () => {
    console.log('Server is listening on port 3000')
    // what is the ip address 
})

