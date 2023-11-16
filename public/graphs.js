
const margin = {top: 20, right: 60, bottom: 90, left: 50};
const width = 600 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;
const min = 18 
const max = 36
let  amin = 18
let  amax = 36
const body = document.querySelector('body')
const presets = {
  isSet : false , 
  inital : true ,
  fanOn : -1 ,
  fanOff : -1 ,
  winOn : -1 ,
  winOff : -1
}

const reads = []

const chart = ()=>{
  return d3.select("#graph")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform",
  "translate(" + margin.left + "," + margin.top + ")");
}

const xLabel = (svg)=>{
  // x axis label
  svg.append("text")
  .attr("transform",
        "translate(" + (width/2) + " ," + 
                      (height + 40 ) + ")")
      .style("text-anchor", "middle")
      .text("Time")
      .attr
      ('fill' , 'white')
}

const yLabel = (svg)=>{
  svg.append("text")
.attr("transform", "rotate(-90)")
.attr("y", 0 - margin.left)
.attr("x",0 - (height / 2))
.attr("dy", "1em")
.style("text-anchor", "middle")
.text("Temperature")
.attr('fill' , 'white')
}

const legend = (svg)=>{
  // legend
  svg.append('circle')
  .attr('cx' ,  10)
  .attr('cy' , height + 46)
  .attr('r' , 5)
  .attr('fill' , 'blue')
  
  svg.append('text')
  .attr('x' ,  20)
  .attr('y' , height +50)
  .attr('fill' , 'white')
  .text('Temperature')

  svg.append('circle')
  .attr('cx' ,  10)
  .attr('cy' , height + 66)
  .attr('r' , 5)
  .attr('fill' , 'red')
  
  svg.append('text')
  .attr('x' ,  20)
  .attr('y' , height +70)
  .attr('fill' , 'white')
  .text('Control temp')

}





const x = d3.scaleUtc()
.range([0, width])
.domain(d3.extent(reads, d => new Date(d.timestamp)))
.nice();

const y = d3.scaleLinear()
.range([height, 0])
.domain([min, max]);



const linesss = (svg, lineName , initVal)=>{

let sign = lineName.includes('On') ? "↑" : '↓'

  // dragable line 
let drag = d3.drag()
.on('start' , dragStart)
.on('drag' , dragMove)
.on('end' , dragEnd)

function dragStart(){
  // change color to red 
  let line = d3.select(this)
  .attr('stroke' , 'red')
  .attr('opacity' , 1)
}

function dragMove(d){
  const yVal = ()=>{
    let x1 = 0 
    let x2 = 20 
    let y1 = y(x1)
    let y2 = y(x2)
    let m = (y2 - y1)/(x2 - x1)
    let c = y1 - m*x1
    // make x subject 
    return (y)=> (y - c)/m 
  }


  if(yVal()(d.y) < 0 || yVal()(d.y) > 50)   return


  let value = d3.select(`.value.${lineName}`)
  .text(` ${lineName} ${sign} ${Math.round(yVal()(d.y))}`)



  if(d.y < -10 || d.y > height+10) return
    let line = d3.select(this)
    .attr(
      'transform' , 
      `translate( 0 , ${d.y})`
    )
  
    presets.isSet = true
    presets[lineName] = yVal()(d.y)

  

}

function dragEnd(){

  // add class to body 
  body.classList.add('savePresets')

  // change color to white 
  let line = d3.select(this)
  .attr('stroke' , 'white')
  .attr('opacity' , 0.5)
  .attr('font-size' , '0.8rem')
  d3.select(lineName)
  .attr('stroke' , 'white')

}

const dragline = svg.append('g')
.attr(
  'transform' , 
  `translate(0 , ${y(initVal  > 36 ? 36 : initVal < 18 ? 18 : initVal  )})`
)
.attr('opacity' , 0.5)
.attr('font-size' , '0.8rem')



dragline.append('line')
  .attr('class' , lineName)
  .attr('x1' , 0)
  .attr('y1' , 0)
  .attr('x2' , width)
  .attr('y2' , 0)
  .attr('stroke' , 'white')
  .attr('stroke-width' , '2px')


// value 
dragline.append('text')
.attr('class' , `value ${lineName}`)
.attr('x' , width)
.attr('y' , '0.2rem')
.attr('fill' , 'white')
.text(`${lineName} ${sign} ${initVal}`)


dragline.call(drag)

// dragline initial position 
dragline.init = ()=>{
  dragline.transition()

}

return dragline

}



// chart 
const svg = chart()
xLabel(svg)
yLabel(svg)

legend(svg)

// x axis
const xAxis = svg.append("g")
.attr("transform", "translate(0," + height + ")")
.call(d3.axisBottom(x));

// y axis
const yAxis = svg.append("g")
.call(d3.axisLeft(y));



// temperature line 
const tempLine = d3.line()
.x((d,i) => x(d.timestamp))
.y(d => y(d.Temperature))

// c temp 
const cTempLine = d3.line()
.x((d) => x(d.timestamp))
.y(d => y(d.Heat_Index))


const line=  svg.append('path')
.datum(reads)
.attr('d' , tempLine)
.style('fill', 'none')
.style('stroke-width' , '2px')
.style('stroke' , 'blue')

// c line 
const cline=  svg.append('path')
.datum(reads)
.attr('d' , cTempLine)
.style('fill', 'none')
.style('stroke-width' , '2px')
.style('stroke' , 'red')



// helper functions 
// update the x axis
const updateX = () => {
    
    // transition on xAxis 
    x.domain(d3.extent(reads, d => new Date(d.timestamp)))

    let tempMax = d3.max(reads , d => d.Temperature)
      let indexMax = d3.max(reads , d => d.Heat_Index)
      amax = Math.max(tempMax , indexMax)
    // if temp is above max , change the domain 
    if(amax > max){
      
      y.domain([min , amax])

      yAxis.transition()
      .duration(1000)
      .call(d3.axisLeft(y))
    }


    // if temp is below min , change the domain
    if(d3.min(reads , d => d.Temperature) < min){
      y.domain([d3.min(reads , d => d.Temperature) , max])

      yAxis.transition()
      .duration(1000)
      .call(d3.axisLeft(y))

    }

    xAxis.transition()
    .duration(1000)
    .call(d3.axisBottom(x))


    const circle = svg.selectAll('.temp')
    .data(reads , d=> d.timestamp)   // second part is the index of the element
    
  
      // enter , when there are no elements 
      circle.enter()
      .append('circle')
      .attr('cx' , (d , i) => x(i) )
      .attr('cy' , d => y(d.Temperature))
      .attr('r' , 2)
      .attr('class' , 'temp')
      .attr('fill' , 'blue')
  
      // update 
      circle.transition()
      .duration(1000)
      .attr('cx' , d  => x(d.timestamp))
      .attr('cy' , d => y(d.Temperature))
  
      // exit state
      circle.exit()
      .transition()
      .duration(1000)
      .attr('fill' , 'yellow')
      .remove()


      // update the line 
      line.transition()
        .duration(1000)
        .attr('d' , tempLine)

      
      cline.transition()
        .duration(1000)
        .attr('d' , cTempLine)




}




export { reads , updateX  , linesss , svg , presets}
