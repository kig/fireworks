var canvas = document.createElement('canvas');
document.body.appendChild(canvas);
window.onresize = function() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
};
window.onresize();

var ctx = canvas.getContext('2d');

var clearColor = 'rgba(0,0,0,0.1)'

var rockets = [];

var Rocket = function() {
	this.fuel = 1+Math.random();
	this.startingFuel = this.fuel;
	this.velocity = {x: 0, y: 0};
	this.jitter = 0;
	this.orientation = Math.random() * Math.PI*2;
	this.position = {x: 0, y: 0};
	this.bodyMass = 0.5;
	this.fuse = 15+Math.floor(30*Math.random());
	this.delayFuse = 0;
	this.submunitionDelayFuse = 0;
	this.finished = false;
	this.mass = this.bodyMass + this.fuel;
	this.submunitions = 80;
	this.sparkling = false;
	this.visible = true;
	this.color = [Math.min(255,Math.random()*512) | 0, Math.min(255,Math.random()*384) | 0, Math.random()*256 | 0, 1];
	rockets.push(this);
};
Rocket.prototype.tick = function() {
	if (this.fuel > 0) {
		this.fuel -= 0.05;
		this.velocity.x += (0.05*Math.random()+0.25) * Math.cos(this.orientation) / this.mass;
		this.velocity.y += (0.05*Math.random()+0.25) * Math.sin(this.orientation) / this.mass;
		this.mass = this.bodyMass + this.fuel;
	}
	if (this.fuel <= 0) {
		if (this.delayFuse <= 0) {
			this.fuse--;
		}
		this.delayFuse--;
	}
	if (this.fuse == 0) {
		this.explode();
		this.finished = true;
	}
	if (this.sparkling) {
		var r = 0.5 + Math.random();
		this.color[0] *= r;
		this.color[1] *= r;
		this.color[2] *= r;
		this.color[0] = Math.floor(this.color[0]);
		this.color[1] = Math.floor(this.color[1]);
		this.color[2] = Math.floor(this.color[2]);
	}
	this.color[3] = Math.max(0, Math.min(1, this.fuse/100));
	this.velocity.y += 0.02;
	this.velocity.x += this.jitter * Math.abs(this.velocity.y) * (Math.random() - 0.5);
	this.position.x += this.velocity.x;
	this.position.y += this.velocity.y;
	this.velocity.x *= 0.975;
	this.velocity.y *= 0.975;
	this.orientation = (Math.atan2(this.velocity.y, this.velocity.x));
};
Rocket.prototype.draw = function(ctx) {
	if (!this.visible) {
		return;
	}
	ctx.save();
	{
		ctx.translate(this.position.x, this.position.y);
		ctx.rotate(this.orientation);
		ctx.strokeStyle = (this.delayFuse > 0 ? 'rgba(0,0,0,0)' : 'rgba('+this.color.join(",")+')');
		ctx.beginPath();
		var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
		ctx.moveTo(speed,0);
		ctx.lineTo(0,0);
		ctx.stroke();
	}
	ctx.restore();
};
Rocket.prototype.explode = function() {
	for (var i=0; i<this.submunitions; i++) {
		var r = new Rocket();
		r.submunitions = 0;
		r.bodyMass = (this.bodyMass / this.submunitions) * 0.2;
		r.fuel = (this.bodyMass / this.submunitions) * 0.8;
		r.fuse = 100;
		r.delayFuse = this.submunitionDelayFuse;
		r.color = this.color.slice();
		r.sparkling = true;
		r.position.x = this.position.x;
		r.position.y = this.position.y;
		r.velocity.x = this.velocity.x + Math.cos(r.orientation) * Math.sin(Math.random()*Math.PI*2);// * (Math.random());
		r.velocity.y = this.velocity.y + Math.sin(r.orientation);
	}

};

var rocketCounter = 0;
var tick = function() {
	ctx.fillStyle = clearColor;
	ctx.beginPath();
	ctx.globalCompositeOperation = 'source-over';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	ctx.save();
	{
		ctx.translate(canvas.width/2, canvas.height);
		ctx.scale(2,2);
		if (rocketCounter % 30 === 0) {
			var r = new Rocket();
			//r.position.x = (Math.random()-0.5) * 80;
			r.fuel += Math.random();
			//r.visible = false;
			r.fuse = 10 + Math.random()*80 | 0;
			r.submunitionDelayFuse = 0; 
			r.orientation = (Math.random() - 0.5)*0.25 - Math.PI/2;
		}
		rocketCounter++;
		for (var i=0; i<rockets.length; i++) {
			if (rockets[i].finished) {
				rockets.splice(i, 1);
				i--;
			} else {
				rockets[i].tick();
			}
		}
		ctx.globalCompositeOperation = 'lighten';
		ctx.lineWidth = 1;
		for (var i=0; i<rockets.length; i++) {
			rockets[i].draw(ctx);			
		}
	}
	ctx.restore();

	window.requestAnimationFrame(tick, canvas);
};

tick();
