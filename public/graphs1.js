
const margin = {top: 20, right: 60, bottom: 50, left: 50};
const width = 600 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;
const min = 15 
const max = 40


const reads = []

// chart 
const chart = ()=>{
    return  d3.select("#graph")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");
    

} 


const svg = chart()


// x axis label
svg.append("text")
.attr("transform",
      "translate(" + (width/2) + " ," + 
                     (height + margin.bottom ) + ")")
    .style("text-anchor", "middle")
    .text("Time")
    .attr
    ('fill' , 'white')

// y axis label
svg.append("text")
.attr("transform", "rotate(-90)")
.attr("y", 0 - margin.left)
.attr("x",0 - (height / 2))
.attr("dy", "1em")
.style("text-anchor", "middle")
.text("Temperature")
.attr('fill' , 'white')


// scales
const x = d3.scaleUtc()
.range([0, width])
.domain(d3.extent(reads, d => new Date(d.timestamp)))
.nice();

const y = d3.scaleLinear()
.range([height, 0])
.domain([min, max]);

window.y = y 

// x axis
const xAxis = svg.append("g")
.attr("transform", "translate(0," + height + ")")
.call(d3.axisBottom(x));

// y axis
svg.append("g")
.call(d3.axisLeft(y));

// legend
const legend = svg.append('g')
.attr('transform' , `translate(${width - 40} , ${0})`)
.attr('class' , 'legend')
.append('rect')
.attr('width' , 30)
.attr('height' , 10)
.attr('fill' , 'blue')
.call((d3.select('.legend')
  .append('text')
  .text('Temp')
  .attr('color' , 'white')
  ))


// temperature line 
const tempLine = d3.line()
.x((d,i) => x(d.timestamp))
.y(d => y(d.Temperature))

// control line 
const tempLine2 = d3.line()
.x((d,i) => x(d.timestamp))
.y(d => y(d.Heat_index2))


const line=  svg.append('path')
.datum(reads)
.attr('d' , tempLine)
.style('fill', 'none')
.style('stroke-width' , '2px')
.style('stroke' , 'blue')

const line2=  svg.append('path')
.datum(reads)
.attr('d' , tempLine2)
.style('fill', 'none')
.style('stroke-width' , '2px')
.style('stroke' , 'red')




// helper functions 
// update the x axis
const updateX = () => {
    
    // transition on xAxis 
    x.domain(d3.extent(reads, d => new Date(d.timestamp)))

    xAxis.transition()
    .duration(1000)
    .call(d3.axisBottom(x))



    // humidity line
    const humLine = d3.line()
    .x((d,i) => x(d.timestamp))
    .y(d => y(d.Temperature))

    //path 
        // selection 
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


    // line 2 ==============================
    if(reads.Heat_index2){
      const humLine2 = d3.line()
      .x((d,i) => x(d.timestamp))
      .y(d => y(d.Heat_index2))
  
      //path 
          // selection 
      const circle2 = svg.selectAll('.temp2')
      .data(reads , d=> d.timestamp)   // second part is the index of the element
      
    
        // enter , when there are no elements 
        circle2.enter()
        .append('circle')
        .attr('cx' , (d , i) => x(i) )
        .attr('cy' , d => y(d.Heat_index2))
        .attr('r' , 2)
        .attr('fill' , 'red')
        .attr('class' , 'temp2')  
        // update 
        circle2.transition()
        .duration(1000)
        .attr('cx' , d  => x(d.timestamp))
        .attr('cy' , d => y(d.Heat_index2))
    
        // exit state
        circle2.exit()
        .transition()
        .duration(1000)
        .attr('fill' , 'yellow')
        .remove()
  
  
        // update the line 
        line2.transition()
          .duration(1000)
          .attr('d' , tempLine2)

    }




}

const linesss = ()=>{
  // dragable line 
let drag = d3.drag()
.on('start' , dragStart)
.on('drag' , dragMove)
.on('end' , dragEnd)

function dragStart(){
  // change color to red 
  let line = d3.select(this)
  .attr('stroke' , 'red')
  console.log('drag start')
}

function dragMove(d){
    let line = d3.select(this)
    .attr(
      'transform' , 
      `translate( 0 , ${d.y})`
    )

}

function dragEnd(){
  // change color to white 
  let line = d3.select(this)
  .attr('stroke' , 'white')
}

const dragline = svg.append('g')
.attr(
  'transform' , 
  `translate(0 , ${height/2})`
)

dragline.append('line')
  .attr('x1' , 0)
  .attr('y1' , 0)
  .attr('x2' , width)
  .attr('y2' , 0)
  .attr('stroke' , 'white')
  .attr('stroke-width' , '2px')

// text fanon 
dragline.append('text')
.attr('x' , width)
.attr('y' , '0.4rem')
.attr('fill' , 'white')
.text('  FanOn')



dragline.call(drag)

}


linesss()

// drag start


export { reads , updateX}
