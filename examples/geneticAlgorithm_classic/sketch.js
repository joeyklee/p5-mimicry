// ***************

let ga = nocjs.GeneticAlgorithm;
let mutationRate = 0.01;
let target;
let population; // Population
let obstacles;

//  creating a different set of vector inhabitants
class VectorPopulation extends ga.Population {
    createVectorInhabitant(dna){
        let position = createVector(0, height/2);
        return new ga.Inhabitant(position, dna, target)
    }
}

function setup() {
    createCanvas(480, 360);

    target = new ga.Obstacle(width / 2 - 12, 24, 24, 24);
    // mutationRate, populationSize, lifetime, target
    // population = new VectorPopulation(mutationRate, 50, 'vectors', 300, target);
    population = new ga.Population(mutationRate, 50, 'vectors', 300, target);
    // add an obstacle
    population.createObstacle(width / 2 - 100, height / 2, 200, 10)
    
}

function draw() {
    background(220);

    population.run();


    // display stuff
    // Draw the start and target positions
    target.display();
    displayInfo();
    // Draw the obstacles
    for (let i = 0; i < population.obstacles.length; i++) {
        population.obstacles[i].display();
    }

    
}

function displayInfo(){
    // Display some info
    fill(0);
    noStroke();
    text("Generation #: " + population.getGenerations(), 10, 18);
    text("Cycles left: " + (population.lifetime - population.lifecycle), 10, 36);
    text("Record cycles: " + population.recordtime, 10, 54);
}