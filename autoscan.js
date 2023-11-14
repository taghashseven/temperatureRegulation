const SerialPort = require('serialport');

// List available serial ports
SerialPort.list().then(ports => {
  console.log('Available serial ports:');
  ports.forEach(port => {
    console.log(`- Port: ${port.path}, Manufacturer: ${port.manufacturer || 'N/A'}`);
    
    // Check if the port is an Arduino based on the manufacturer string
    if (port.manufacturer && port.manufacturer.toLowerCase().includes('arduino')) {
      console.log('Found Arduino board on port: ' + port.path);
      // You can use this port for communication with the Arduino board
    }
  });
});