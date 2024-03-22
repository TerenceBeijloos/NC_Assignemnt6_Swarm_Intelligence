let max_generations = 100;
let swarm_size = 15;
let screen_width = 600;
let screen_height = 600;
let simulation_count = 20;
let steps_per_sim = 300;
let speed = 2.5;
let boid_fov = 100;

let separation_mutation = 0.2; //current*(1-+separation_mutation)
let alignment_mutation = 0.2;  //current*(1-+alignment_mutation)
let cohesion_mutation = 0.2;   // current*(1-+cohesion_mutation)

let file_path = "sim_data";

const default_parameters = {
    cohesion : 25,
    separation : 0.5,
    alignment : 0.65
}

function distanceWrapped(x1, y1, x2, y2) {
    let dx = Math.abs(x2 - x1);
    let dy = Math.abs(y2 - y1);
    
    if (dx > screen_width / 2) {
        dx = screen_width - dx;
    }
    if (dy > screen_height / 2) {
        dy = screen_height - dy;
    }

    return Math.sqrt(dx * dx + dy * dy);
}

function boid_neighbors(n, distribution, swarm) {
    for (let i = n+1; i < swarm.length; i++) {
        distribution[Math.floor(distanceWrapped(swarm[i].pos.x,swarm[i].pos.y,swarm[n].pos.x,swarm[n].pos.y))]++;
    }
}

function getRandomUnitVector() {
  let angle = random(TWO_PI);
  return createVector(cos(angle), sin(angle));
}

function drawGraph(distance_distribution) {
    stroke("black");
    let barWidth = screen_width / distance_distribution.length;
    let maxCount = Math.max(...distance_distribution);
    
    for (let i = 0; i < distance_distribution.length; i++) {
        let x = i * barWidth;
        let y = map(distance_distribution[i], 0, maxCount, height, 0);
        let barHeight = height - y;
        
        fill(0, 0, 255);
        rect(x, y, barWidth, barHeight);
    }
}

function fitness(swarm) {
    let sumX = 0;
    let sumY = 0;

    for (let boid of swarm) {
        let magnitude = Math.sqrt(boid.dir.x * boid.dir.x + boid.dir.y * boid.dir.y);
        sumX += boid.dir.x / magnitude;
        sumY += boid.dir.y / magnitude;
    }

    let sumMagnitude = Math.sqrt(sumX * sumX + sumY * sumY);

    let order = sumMagnitude / swarm.length;

    return order;
}
simulations = []
function setup_simulations()
{
    for (let i = 0; i < simulation_count; i++) 
    {
        let sim = new Simulation(steps_per_sim);
        for (let i of Array(swarm_size)){
            randomSeed(i);
            sim.scene.swarm.push(new Particle(speed,sim.scene,sim.parameters));
        }
        simulations.push(sim);
    }
}

function setup(){
    createCanvas(screen_width, screen_height);
    setup_simulations();

    console.log("Generation,Cohesion,Alignment,Separation,Fitness");
}

function compareFitness(simulationA, simulationB) {
    const fitnessA = fitness(simulationA.scene.swarm);
    const fitnessB = fitness(simulationB.scene.swarm);

    if (abs(fitnessA-0.6) < abs(fitnessB-0.6)) {
        return -1;
    } else if (abs(fitnessA-0.6) > abs(fitnessB-0.6)) {
        return 1;
    } else {
        return 0;
    }
}

let generation = 0;
function draw() {

    if (generation >= max_generations) 
    {
      if (generation == max_generations) {
        console.log("using best simulation: " + simulations[0].parameters.cohesion.toString() + "," +
        simulations[0].parameters.alignment.toString() + "," +
        simulations[0].parameters.separation.toString());
        generation++;
      }
      simulations[0].step();
      simulations[0].draw();
      return;
    }

    //Mutate
    for (let i = 5; i < simulations.length; i++)
    {
        simulations[i].mutate();
    }

    //Sim
    for(let s of simulations)
    {
        s.simulate();
    }

    // Fittest
    simulations.sort(compareFitness);

    for (let j = 0; j < simulations.length; j++) 
    {
        simulations[j].print();
    }

    simulations = simulations.slice(0, 5);

    for (let i = 0; i < 3; i++) 
    {
        for (let j = 0; j < 5; j++) 
        {
            let sim = new Simulation();
            sim.parameters = {...simulations[j].parameters};
            for (let i of Array(swarm_size))
            {
              randomSeed(i);
              sim.scene.swarm.push(new Particle(speed,sim.scene,sim.parameters));
            }
            simulations.push(sim);   
        }
    }

    generation++;
}

class Particle {

    constructor(speed, scene, parameters){
        this.scene = scene;
        this.pos = createVector(random(0, this.scene.w), random(0, this.scene.h));
        this.dir = getRandomUnitVector();
        this.speed = speed;
        this.parameters = parameters;
    }

    wrap(){
        if (this.pos.x < 0) this.pos.x += this.scene.w;
        if (this.pos.y < 0) this.pos.y += this.scene.h;
        if (this.pos.x > this.scene.w) this.pos.x -= this.scene.w;
        if (this.pos.y > this.scene.h) this.pos.y -= this.scene.h;
    }

    draw(){
        fill(0);
        ellipse(this.pos.x, this.pos.y, 5, 5);
        stroke("red");
        line(this.pos.x + (this.dir.x * 5), this.pos.y + (this.dir.y * 5), this.pos.x, this.pos.y);

    }

    step(){
        let N = this.scene.neighbors(this.pos), avg_sin = 0, avg_cos = 0,
                avg_p = createVector(0, 0), avg_d = createVector(0, 0);
      
        for (let n of N) {
           let distance = distanceWrapped(n.pos.x,n.pos.y,this.pos.x,this.pos.y);
           if(distance > boid_fov)
           {
             continue;
           }

           avg_sin += Math.sin(n.dir.heading()) / N.length;
           avg_cos += Math.cos(n.dir.heading()) / N.length;

            avg_p.add(n.pos);
            if (n != this) {
                let separation = p5.Vector.sub(this.pos, n.pos);
                separation.div(separation.magSq()*this.parameters.separation); //0.65
                avg_d.add(separation);
            }
        }
      
        avg_p.div(N.length); avg_d.div(N.length);
        let avg_angle = Math.atan2(avg_cos, avg_sin);
        avg_angle += Math.random() * this.parameters.alignment - 0.25; // 0.5
        this.dir = p5.Vector.fromAngle(avg_angle);
      
        let cohesion = p5.Vector.sub(avg_p, this.pos);
        cohesion.div(this.parameters.cohesion); //25 Higher is less cohesion
        this.dir.add(cohesion);
      
        avg_d.mult(50);
        this.dir.add(avg_d);

        this.dir.setMag(this.speed);

        this.pos.add(this.dir);
        this.wrap();
    }
}

class Simulation
{
    constructor()
    {
        this.parameters = { ...default_parameters };
        this.update_distribution = 0;
        this.step_count = 0;
        this.scene = {
            w : 600, h : 600, swarm : [],
            neighbors( x ){
                let r = []
                for( let p of this.swarm ){
                    if( dist( p.pos.x, p.pos.y, x.x, x.y ) <= 100 ){
                        r.push( p )
                    }
                }
                r.sort()
                return r
            }
        }
        
    }

    print()
    {
      console.log(generation.toString() + "," +
      this.parameters.cohesion.toString() + "," +
      this.parameters.alignment.toString() + "," +
      this.parameters.separation.toString() + "," +
      fitness(this.scene.swarm).toString() + "\n");
    }

    step()
    {
        for (let p of this.scene.swarm) 
        {
            p.step();
        }
    }

    simulate()
    {
        for (let i = 0; i < steps_per_sim; i++) 
        {
            for (let p of this.scene.swarm) 
            {
                p.step();
            }
        }
    }

    draw() {
        background(220);
    
        if (this.update_distribution % 10 == 0) {
            let distance_distribution = new Array(425).fill(0);
            for (let i = 0; i < this.scene.swarm.length; i++) {
                boid_neighbors(i, distance_distribution, this.scene.swarm);
            }
            drawGraph(distance_distribution);
        }
        
        for (let p of this.scene.swarm) {
            p.draw();
        }
    }

    minus(x,y){
        return x-y;
    }

    plus(x,y){
        return x+y;
    }

    mutate()
    {
        let operator = (Math.random() < 0.5) ? this.plus : this.minus;
        this.parameters.cohesion *= operator(1,cohesion_mutation);

        operator = (Math.random() < 0.5) ? this.plus : this.minus;
        this.parameters.separation *= operator(1,separation_mutation);

        operator = (Math.random() < 0.5) ? this.plus : this.minus;
        this.parameters.alignment *= operator(1,alignment_mutation);
    }

}
