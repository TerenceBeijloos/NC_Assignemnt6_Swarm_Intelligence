
let Cohesion = 25;
let Alignment = 0.65;
let Separation = 0.5;

let Scene = {
	w : 600, h : 600, swarm : [],
	neighbours( x ){
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

function distanceWrapped(x1, y1, x2, y2, width, height) {
    let dx = Math.abs(x2 - x1);
    let dy = Math.abs(y2 - y1);
    
    if (dx > width / 2) {
        dx = width - dx;
    }
    if (dy > height / 2) {
        dy = height - dy;
    }

    return Math.sqrt(dx * dx + dy * dy);
}

function boid_neighbors(n, distribution, swarm) {
    for (let i = n+1; i < swarm.length; i++) {
        distribution[Math.floor(distanceWrapped(swarm[i].pos.x,swarm[i].pos.y,swarm[n].pos.x,swarm[n].pos.y,600,600))]++;
    }
}

function getRandomUnitVector() {
  let angle = random(TWO_PI);
  return createVector(cos(angle), sin(angle));
}

class Particle {
    constructor(speed){
        this.pos = createVector(random(0, Scene.w), random(0, Scene.h));
        this.dir = getRandomUnitVector();
        this.speed = speed;
    }
    wrap(){
        if (this.pos.x < 0) this.pos.x += Scene.w;
        if (this.pos.y < 0) this.pos.y += Scene.h;
        if (this.pos.x > Scene.w) this.pos.x -= Scene.w;
        if (this.pos.y > Scene.h) this.pos.y -= Scene.h;
    }
    draw(){
        fill(0);
        ellipse(this.pos.x, this.pos.y, 5, 5);
        stroke("red");
        line(this.pos.x + (this.dir.x * 5), this.pos.y + (this.dir.y * 5), this.pos.x, this.pos.y);

    }
    step(){
        let N = Scene.neighbours(this.pos), avg_sin = 0, avg_cos = 0,
                avg_p = createVector(0, 0), avg_d = createVector(0, 0);
      
        for (let n of N) {
           let distance = distanceWrapped(n.pos.x,n.pos.y,this.pos.x,this.pos.y,600,600);
           if(distance > 100)
           {
             continue;
           }

           avg_sin += Math.sin(n.dir.heading()) / N.length;
           avg_cos += Math.cos(n.dir.heading()) / N.length;

            avg_p.add(n.pos);
            if (n != this) {
                let separation = p5.Vector.sub(this.pos, n.pos);
                separation.div(separation.magSq()*Separation);
                avg_d.add(separation);
            }
        }
      
        avg_p.div(N.length); avg_d.div(N.length);
        let avg_angle = Math.atan2(avg_cos, avg_sin);
        avg_angle += Math.random() * Alignment - 0.25;
        this.dir = p5.Vector.fromAngle(avg_angle);
      
        let cohesion = p5.Vector.sub(avg_p, this.pos);
        cohesion.div(Cohesion); //Higher is less cohesion
        this.dir.add(cohesion);
      
        avg_d.mult(50);
        this.dir.add(avg_d);

        this.dir.setMag(this.speed);

        this.pos.add(this.dir);
        this.wrap();
    }
}

function drawGraph(distance_distribution) {
    stroke("black");
    let barWidth = width / distance_distribution.length;
    let maxCount = Math.max(...distance_distribution);
    
    for (let i = 0; i < distance_distribution.length; i++) {
        let x = i * barWidth;
        let y = map(distance_distribution[i], 0, maxCount, height, 0);
        let barHeight = height - y;
        
        fill(0, 0, 255);
        rect(x, y, barWidth, barHeight);
    }
}

function average_normalised_velocity(swarm) {
    let sumX = 0;
    let sumY = 0;
    
    for (let boid of swarm) {
        sumX += boid.dir.x / boid.speed;
        sumY += boid.dir.y / boid.speed;
    }
    
    const avgX = sumX / swarm.length;
    const avgY = sumY / swarm.length;
    
    return createVector(avgX*80, avgY*80);
}

function setup(){
    createCanvas(Scene.w, Scene.h);
    let speed = 2.5;
    for (let i of Array(200)){
        randomSeed(i);
        Scene.swarm.push(new Particle(speed));
    }
}

let update_distribution = 0;
let step_count = 0;


function draw() {
    background(220);

    if (update_distribution % 10 == 0) {
        let distance_distribution = new Array(425).fill(0);
        for (let i = 0; i < Scene.swarm.length; i++) {
            boid_neighbors(i, distance_distribution, Scene.swarm);
        }
        drawGraph(distance_distribution);
    }
    print(step_count++);
    for (let p of Scene.swarm) {
        p.step();
        p.draw();
    }

    const avgVelocity = average_normalised_velocity(Scene.swarm);

    const center = createVector(width / 2, height / 2);

    const end = createVector(center.x + avgVelocity.x, center.y + avgVelocity.y);
    
    strokeWeight(3);
    
    stroke("green");
    line(center.x, center.y, end.x, end.y);
    strokeWeight(1)
}