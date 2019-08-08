const DEFAULTS = {
    speedLimit: 4,
    mass: 40,
    frictionCoefficient: 0.01,
    dragCoefficient: 0.01,
    G: 0.4,
    maxForce: 0.2
}


class Mover {
    constructor(x, y, mass){
        this.location = createVector(x, y);
        this.velocity = createVector(0, 0);
        this.acceleration = createVector(0,0);
        this.speedLimit = DEFAULTS.speedLimit;
        this.mass = mass || DEFAULTS.mass;
        this.maxForce = DEFAULTS.maxForce;
    }

    applyFriction(frictionCoefficient){
        // friction = -1 * N * μ * velocity
        const frictionMag = frictionCoefficient || DEFAULTS.frictionCoefficient
        // fricition is operating in the opposite direction
        const f = this.velocity.copy();
        f.mult(-1);
        f.normalize();
        // scale the friction by the friction coefficient
        f.mult(frictionCoefficient);
        
        // here we directly apply friction
        this.applyForce(f);
    }

    applyResistance(dragCoefficient){
        // fluid resistance = (the opposite direction of velocity) * speed^2 * drag coefficient
        const f = this.velocity.copy();

        // get the speed before normalizing
        const speed = f.mag();
        // get the opposite direction
        f.mult(-1);
        // normalize;
        f.normalize();

        const dragCoeff = dragCoefficient || DEFAULTS.dragCoefficient;
        const strength =  dragCoeff * speed * speed;
        f.mult(strength);

        this.applyForce(f);
    }

    follow(path){
        let predict = this.velocity.copy();
        predict.normalize();
        predict.mult(50); // predict a position 50px ahead
        let predictLocation = p5.Vector.add(this.location, predict);

        // look at the line segment;
        let a = path.start;
        let b = path.end;

        // get the normal point to the line
        let normalPoint = this.getNormalPoint(predictLocation, a, b);
        // find the target point a bit further ahead of normal
        let dir = p5.Vector.sub(b, a);
        dir.normalize();
        dir.mult(10); // arbitrary 10 pixels ahead
        
        let target = p5.Vector.add(normalPoint, dir);

        // How far away are we from the path?
        let distance = p5.Vector.dist(predictLocation, normalPoint);
        // Only if the distance is greater than the path's radius do we bother to steer
        
        // FROM NOC
        if (distance > path.radius) {
            this.seek(target);
        }

        // Seek always
        // this.seek(target)
    }

    // A function to get the normal point from a point (p) to a line segment (a-b)
    // This function could be optimized to make fewer new Vector objects
    getNormalPoint(p, a, b) {
        // Vector from a to p
        let ap = p5.Vector.sub(p, a);
        // Vector from a to b
        let ab = p5.Vector.sub(b, a);
        ab.normalize(); // Normalize the line
        // Project vector "diff" onto line by using the dot product
        ab.mult(ap.dot(ab));
        let normalPoint = p5.Vector.add(a, ab);
        return normalPoint;
    }

    attract(attractor, locationProp, massProp, attractionConstant){
        // gravitational attraction = (G * m1 * m2) / (distance * distance)
        // get the direction of attraction
        let lProp = locationProp ||  'location';
        let mProp = massProp || attractor.mass;
        const f = p5.Vector.sub(this.location, attractor[lProp])
        // get the distance between those objects
        let  distance = f.mag();
        let G = attractionConstant || DEFAULTS.G;
        // no matter how close or far, the lowest distance is 5 and highest is 25
        distance = constrain(distance, 5.0, 25.0);

        // normalize the force so we can scale it by the strength of attraction
        f.normalize();
        const strength = (G * this.mass * attractor[mProp]) / (distance * distance);
        f.mult(strength);

        return f;
    }

    repel(attractor, locationProp, massProp, attractionConstant){
        // gravitational attraction = (G * m1 * m2) / (distance * distance)
        // get the direction of attraction
        let lProp = locationProp ||  'location';
        let mProp = massProp || attractor.mass;
        const f = p5.Vector.sub(this.location, attractor[lProp])
        // get the distance between those objects
        let  distance = f.mag();
        let G = attractionConstant || DEFAULTS.G;
        // no matter how close or far, the lowest distance is 5 and highest is 25
        distance = constrain(distance, 5.0, 25.0);

        // normalize the force so we can scale it by the strength of attraction
        f.normalize();
        const strength = (G * this.mass * attractor[mProp]) / (distance * distance);
        // REPEL: by adding -1
        f.mult(strength * -1);

        return f;
    }


    seek(target){
        const desired = p5.Vector.sub(target, this.location);

        // get there as fast as the mover is able...
        desired.setMag(this.speedLimit);

        // steering = desired location minus the velocity;
        const steer = p5.Vector.sub(desired, this.velocity);
        steer.limit(this.maxForce);

        this.applyForce(steer);
    }

    arrive(target){
        const desired = p5.Vector.sub(target, this.location);
        let d = desired.mag();

        // once the mover is w/in 100 pixels
        // scale the max speed down
        if(d < 100){
            let m = map(d, 0, 100, 0, this.speedLimit);
            desired.setMag(m);
        } else {
            // get there as fast as the mover is able...
            desired.setMag(this.speedLimit);
        }

        // steering = desired location minus the velocity;
        const steer = p5.Vector.sub(desired, this.velocity);
        steer.limit(this.maxForce);

        this.applyForce(steer);
    }

    applyForce(force){
        // acceleration = force/mass
        const f = p5.Vector.div(force, this.mass);
        this.acceleration.add(f);
    }

    update(){
        // velocity
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.speedLimit);
        // location
        this.location.add(this.velocity);
        // reset the acceleration on each iteration
        this.acceleration.mult(0);
    }

    checkEdges() {
        if (this.location.x > width - this.mass) {
          this.location.x = width - this.mass;
          this.velocity.x *= -1;
        } else if (this.location.x < this.mass) {
          this.location.x = this.mass;
          this.velocity.x *= -1;
        }

        if (this.location.y > height - this.mass) {
          this.location.y = height - this.mass;
          this.velocity.y *= -1;
        }else if (this.location.y < this.mass) {
          this.location.y = this.mass;
          this.velocity.y *= -1;
        }
      }



    display(){
        const angle = this.velocity.heading();
        push();
        translate(this.location.x, this.location.y);
        rotate(angle);
        ellipse(0, 0, this.mass/2, this.mass/2);
        line(0,0, this.mass/2, 0);
        pop();
    }
}

export default Mover;