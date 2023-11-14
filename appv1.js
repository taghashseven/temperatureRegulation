import express from 'express'
import { WebSocketServer } from 'ws';
import { SerialPort } from 'serialport'
import fs from 'fs' // file system
import path from 'path'
// quick fix __dirname
import {URL} from 'url'
const __dirname = new URL('.', import.meta.url).pathname

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
// arduino 
const serialport = new SerialPort({ 
    path: 'COM3', 
    baudRate: 9600   
})



// websocket server
const wss = new WebSocketServer({ port: 3001 });

wss.on('connection', function connection(ws) {
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

    });
  
    ws.send('something');
    let buffer = ''
    // on arduino data write 
    serialport.on('data', (data) => {
        buffer += data.toString()

        // parse if we have a new line
        if(buffer.includes('\r\n')) {
            // to arry 
            let data = buffer.replace('\r\n', '').split(',')
            let dataObj = {}
            if(data[0].includes('Humidity')) {
                data.map(item => {
                    item = item.split(':')
                    dataObj[item[0].trim()] = item[1].trim()
                })
                // write to file 
                let filedata = `${dataObj['Humidity']},${dataObj['Temperature']},${dataObj['Heat Index']}`
                fs.appendFile('./data.csv', filedata + '\n', (err) => {
                    if(err) {
                        console.log(err)
                    }
                    else {
                        // send to client 
                        ws.send(JSON.stringify(dataObj))
                    }
                })
            }
            // clear the buffer
            buffer = ''
        }
        
    })

  });

// console serial data
serialport.on('data' , data =>{
        console.log('arduino: ' , data.toString())
})

app.listen(3000, () => {
    console.log('Server is listening on port 3000')
    // what is the ip address 
})

