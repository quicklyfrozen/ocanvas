(function(oCanvas, window, document, undefined){

	// Define the class
	// Should be able to re-use line without copying...
	var arrow = function (settings, thecore) {
		
		// Return an object when instantiated
		return oCanvas.extend({
			core: thecore,
			
			shapeType: "radial",
			
			// Properties
			_: oCanvas.extend({}, thecore.displayObject._, {
				start_x: 0,
				start_y: 0,
				end_x: 0,
				end_y: 0,
				x: 200,
				y: 0,
				abs_x: 0,
				abs_y: 0
			}),
			children: [],
			
			arrowWidth: 6,
			arrowLength: 16,

			// Getters and setters
			set start (values) {
				this._.start_x = values.x + (this.parent ? this.parent._.abs_x : 0);
				this._.start_y = values.y + (this.parent ? this.parent._.abs_y : 0);
				this.setPosition();
			},
			set end (values) {
				this._.end_x = values.x + (this.parent ? this.parent._.abs_x : 0);
				this._.end_y = values.y + (this.parent ? this.parent._.abs_y : 0);
				this.setPosition();
			},
			get start () {
				var offset = { x: 0, y: 0 };
				if (this.parent) {
					offset.x = this.parent._.abs_x;
					offset.y = this.parent._.abs_y;
				}
				return { x: this._.start_x - offset.x, y: this._.start_y - offset.y };
			},
			get end () {
				var offset = { x: 0, y: 0 };
				if (this.parent) {
					offset.x = this.parent._.abs_x;
					offset.y = this.parent._.abs_y;
				}
				return { x: this._.end_x - offset.x, y: this._.end_y - offset.y };
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
				delete pts;
				
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
				delete pts;
				
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
			
			set length (value) {
				var dX, dY, length, angle;
				
				// Find current length and angle
				dX = Math.abs(this._.end_x - this._.start_x);
				dY = Math.abs(this._.end_y - this._.start_y);
				length = Math.sqrt(dX * dX + dY * dY);
				angle = Math.asin(dX / length);
				
				// Calculate new values
				dX = Math.sin(angle) * value;
				dY = Math.cos(angle) * value;
				this._.end_x = this._.start_x + dX;
				this._.end_y = this._.start_y + dY;
				this.x += 0;
				this.y += 0;
			},
			get length () {
				var dX, dY, length;
				
				dX = Math.abs(this._.end_x - this._.start_x);
				dY = Math.abs(this._.end_y - this._.start_y);
				length = Math.sqrt(dX * dX + dY * dY);
				
				return length;
			},
			
			set radius (value) {
				this.length = value * 2;
			},
			get radius () {
				return this.length / 2;
			},
			
			// Method for setting x/y coordinates (which will set abs_x/abs_y as specified by displayObject)
			setPosition: function () {
				if (this.initialized) {
					var offset = { x: 0, y: 0 };
					if (this.parent) {
						offset.x = this.parent._.abs_x;
						offset.y = this.parent._.abs_y;
					}
					this.x = this._.start_x - offset.x + (this._.end_x - this._.start_x) / 2;
					this.y = this._.start_y - offset.y + (this._.end_y - this._.start_y) / 2;
					delete pts;
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
				var arrowWidth = this.arrowWidth;
				var arrowLength = this.arrowLength;
				var pts = this.arrowPts;
				
				function toRadians(deg) {
					return deg * 2 * Math.PI / 360;
				}

				function toDegrees(rad) {
					return rad * 360 / 2 / Math.PI;
				}

				function arrowCoords(x1, y1, x2, y2, x3, y3) {
					pts = [{x: x1, y: y1},
						   {x: x2, y: y2},
						   {x: x3, y: y3}];
				}
				
				function calcCoords(index, x, y, dist, dirn) {
					while(dirn < 0.0)   dirn = 360.0+dirn;
					while(dirn > 360.0) dirn = dirn-360.0;

					pts[index] = {
						x: x + (Math.sin(toRadians(dirn))*dist),
						y: y - (Math.cos(toRadians(dirn))*dist)
					};
				}

				/* Use desired angle of arrowhead border vs. arrow line to compute arrowhead points */
				function calcValuesQuad(x1, y1, x2, y2)	{
					var arrowAng = toDegrees(Math.atan(arrowWidth / arrowLength));
					var dist = Math.sqrt((arrowLength*arrowLength + arrowWidth * arrowWidth));
					var lineAng = toDegrees(Math.atan((Math.abs(x1-x2))/(Math.abs(y1-y2))));
				
					// Adjust line angle for quadrant
					if (x1 > x2) {
						// South East
						if (y1 > y2) lineAng = 180.0-lineAng;
					}
					else {
						// South West
						if (y1 > y2) lineAng = 180.0+lineAng;
						// North West
						else lineAng = 360.0-lineAng;
					}
					// Calculate coords
					pts[0] = {x: x2, y: y2};
					calcCoords(1,x2,y2,dist,lineAng-arrowAng);
					calcCoords(2,x2,y2,dist,lineAng+arrowAng);
				}

				function calcValues(x1, y1, x2, y2) {
					// North or south
					if (x1 == x2) {
						// North
						if (y2 < y1) arrowCoords(x2,y2,x2-arrowWidth,y2+arrowLength,x2+arrowWidth,y2+arrowLength);
						// South
						else arrowCoords(x2,y2,x2-arrowWidth,y2-arrowLength,x2+arrowWidth,y2-arrowLength);
							return;
					}
					// East or West
					if (y1 == y2) {
						// East
						if (x2 > x1) arrowCoords(x2,y2,x2-arrowLength,y2-arrowWidth,x2-arrowLength,y2+arrowWidth);
						// West
						else arrowCoords(x2,y2,x2+arrowLength,y2-arrowWidth,x2+arrowLength,y2+arrowWidth);
							return;
					}
					// Calculate quadrant
					pts = [];
					calcValuesQuad(x1,y1,x2,y2);
				}

				var sx = this._.start_x - translation.x - origin.x,
					sy = this._.start_y - translation.y - origin.y,
					ex = this._.end_x - translation.x - origin.x,
					ey = this._.end_y - translation.y - origin.y;

				if (pts == undefined) {
					calcValues(sx, sy, ex, ey);
					this.arrowPts = pts;
				}
				
				canvas.lineWidth = this.strokeWidth;
				canvas.strokeStyle = this.strokeColor;
				canvas.beginPath();
				canvas.moveTo(sx, sy);
				canvas.lineTo(ex, ey);
				canvas.stroke();
				canvas.closePath();
				
				// draw arrow head
				canvas.fillStyle = this.strokeColor;
				canvas.beginPath();
				canvas.moveTo(pts[0].x, pts[0].y);
				canvas.lineTo(pts[1].x, pts[1].y);
				canvas.lineTo(pts[2].x, pts[2].y);
				canvas.lineTo(pts[0].x, pts[0].y);
				canvas.closePath();
				canvas.fill();
				
				return this;
			}
			
		}, settings);
	};
	
	// Register the display object
	oCanvas.registerDisplayObject("arrow", arrow, "init");
	
})(oCanvas, window, document);
