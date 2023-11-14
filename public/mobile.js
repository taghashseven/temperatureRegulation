
console.log(location.hostname)
const hum = document.querySelector(".hum");
const temp = document.querySelector(".temp");
const index = document.querySelector(".index");

// if not localhost
if(location.hostname != "localhost") {

    // long pull 
    const lookup = async ()=>{

        const data = await fetch('/data')
        const json = await data.json()
        console.log(json)

        hum.innerHTML = json.Humidity
        temp.innerHTML = json.Temperature ;
        index.innerHTML = json.Heat_Index

    
    }

    const getStatus = async ()=>{
        const data = await fetch('/status')
        const json = await data.json()
        console.log(json)
    }
    
    lookup()
    // every 5 seconds
    setInterval(() => {
        lookup()
        getStatus()
    }, 5000);

}

