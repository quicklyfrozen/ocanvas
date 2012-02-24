(function(oCanvas, window, document, undefined){

	// Define the class
	// N.B. not a curve yet, planning to add smoothing...
	var curve = function (settings, thecore) {
		
		// Return an object when instantiated
		return oCanvas.extend({
			core: thecore,
			
			shapeType: "radial",
			
			// Properties
			_: oCanvas.extend({}, thecore.displayObject._, {
				x: 200,
				y: 0,
				abs_x: 0,
				abs_y: 0,
				points: []
			}),
			children: [],
			
			// Getters and setters
			set points(values) {
				this._.points = values;
			},
			get points() {
				return this._.points;
			},
			
			// Overwrite the setters that displayObject provides, to enable start/end coordinates to affect the position
			set x (value) {
				var diff, offsetX, objects, l, i;

				// Get delta length
				diff = this._.end_x - this._.start_x;

				// Get parent offset
				offsetX = this.parent ? this.parent._.abs_x : 0;
				
				// Assign new x positions for the object
				this._.x = value;
				this._.abs_x = value + offsetX;
				
				// Assign new x positions for start and end points
				this._.start_x = value - (diff / 2) + offsetX;
				this._.end_x = value + (diff / 2) + offsetX;
				
				// Update children
				objects = this.children;
				l = objects.length;
				for (i = 0; i < l; i++) {
					objects[i]._.abs_x = this.abs_x + objects[i].x;
					objects[i].x += 0;
				}
			},
			set y (value) {
				var diff, offsetY, objects, l, i;

				// Get delta length
				diff = this._.end_y - this._.start_y,
				
				// Get parent offset
				offsetY = this.parent ? this.parent._.abs_y : 0;
				
				// Assign new y positions for the object
				this._.y = value;
				this._.abs_y = value + offsetY;
				
				// Assign new y positions for start and end points
				this._.start_y = value - (diff / 2) + offsetY;
				this._.end_y = value + (diff / 2) + offsetY;
				
				// Update children
				objects = this.children;
				l = objects.length;
				for (i = 0; i < l; i++) {
					objects[i]._.abs_y = this.abs_y - objects[i].y;
					objects[i].y += 0;
				}
			},
			get x () {
				return this._.x;
			},
			get y () {
				return this._.y;
			},
			
			// Method for setting x/y coordinates (which will set abs_x/abs_y as specified by displayObject)
			setPosition: function () {
				if (this.initialized) {
					var offset = { x: 0, y: 0 };
					if (this.parent) {
						offset.x = this.parent._.abs_x;
						offset.y = this.parent._.abs_y;
					}
					this.x = this._.x - offset.x; // + (this._.end_x - this._.start_x) / 2;
					this.y = this._.y - offset.y; // + (this._.end_y - this._.start_y) / 2;
				}
			},
			
			// Method for initializing the dimensions
			init: function () {
				this.initialized = true;
				this.setPosition();
			},
			
			draw: function () {
				var canvas = this.core.canvas,
					origin = this.getOrigin(),
					translation = this.core.draw.translation;
				
				
				canvas.lineWidth = this.strokeWidth;
				canvas.strokeStyle = this.strokeColor;
				canvas.lineCap = canvas.lineJoin = 'round';
				canvas.beginPath();
				canvas.moveTo(this._.points[0].x - translation.x - origin.x, this._.points[0].y - translation.y - origin.y);
				for (var i=1; i<this._.points.length; i++) {
					canvas.lineTo(this._.points[i].x - translation.x - origin.x, this._.points[i].y - translation.y - origin.y);
				}
				canvas.stroke();
				canvas.closePath();
				
				return this;
			}
			
		}, settings);
	};
	
	// Register the display object
	oCanvas.registerDisplayObject("curve", curve, "init");
	
})(oCanvas, window, document);
