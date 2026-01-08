
// PAINT PROGRAM FROM https://editor.p5js.org/moonloops/sketches/-eSoqX2Gs
// AND https://www.youtube.com/watch?v=wRWGUxQpDZY

/*
  TODO:
    Make Toolbar icons, all the same size, with OFF icon as well:
    Line, Rect, Circle, Eraser (clears entire shape), Letter, Fill?
    Try 64 x 64 for the icons

    Need a popup dialog to set a shape's parameters or letters to place

    Record all placements of shapes, so they can be removed or replayed
      - placed x,y
      - shape type (rect,cirle,line,letter)
      - fill type none or color
      - foreground color
      - width, height, radius, vertices (for polygon)

    Allow clicking on a shape to change it's values:
      lines:  x,y start/end locations
      rect: change to polygon, change vertices
      ALL: move x,y center location

    More to follow of course

*/

let paintWindow;
let currentTool = "pencil";
let currentColor = "blue";
let icon;
let toolIcons = {};

let gridOnOff = 'Off';
let gridType = 'Dots';
let gridSpacing = 25;
let Snap = 'Off';

let DrawnObjects = [];

let CurrentObjectInDialog; // after dialog, set this object's parameters
let dialogInProgress = false; // so letter dialog can work
let lastFontSize = 32;
let curLineWidth = 1;
let curDrawFill = false;
/*
const AVAILABLE_TOOLS = [
  "eraser",
  "paint",
  "pencil",
  "brush",
  "spray",
  "line",
  "rect",
  "circle",
];
*/

const AVAILABLE_TOOLS = [
    "line",
    "rect",
    "circle",
    "letter",
    "grid",
    "eraser",
    "undo",
    "gear",
    "update"
  ];
  
const WEB_COLORS = [
  "black",
  "gray",
  "maroon",
  "olive",
  "green",
  "teal",
  "navy",
  "purple",
  "darkkhaki",
  "darkgreen",
  "dodgerblue",
  "royalblue",
  "blueviolet",
  "brown",
  "white",
  "silver",
  "red",
  "yellow",
  "lime",
  "aqua",
  "blue",
  "fuchsia",
  "moccasin",
  "springgreen",
  "aqua",
  "lightsteelblue",
  "deeppink",
  "orange",
];


function preload() {
  icon = loadImage("images/icon.png");
  AVAILABLE_TOOLS.forEach((tool) => {
    toolIcons[tool] = [
      loadImage(`images/${tool}.png`),
      loadImage(`images/${tool}-on.png`),
    ];
  });
}

// const MARGIN = 2;
// const PADDING = 5;
// const ICON_SIZE = 16;
// const TITLEBAR_H = 20;
// const TOOLBAR_W = 76;
// const PALETTE_H = 72;
// const CANVAS_GAP = 28;
// const TOOLBAR_BUTTON_SIZE = 32;
// const PALETTE_BUTTON_SIZE = 24;

const MARGIN = 2;
const PADDING = 5;
const ICON_SIZE = 16;
const TITLEBAR_H = 20;
const TOOLBAR_W = 140;
const PALETTE_H = 72;
const CANVAS_GAP = 28;
const TOOLBAR_BUTTON_SIZE = 70;
const PALETTE_BUTTON_SIZE = 24;


class PaintWindow {
  constructor(x, y, w, h, title) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.title = title;
    this.visible = true;

    this.closeButton = new Button(
      this.x + this.w - ICON_SIZE - MARGIN * 2,
      this.y + MARGIN * 2,
      ICON_SIZE,
      ICON_SIZE,
      "x",
      () => {
        this.visible = false;
      }
    );

    this.toolbar = new Toolbar(
      this.x + MARGIN,
      this.y + TITLEBAR_H + MARGIN * 2,
      TOOLBAR_W,
      h - PALETTE_H - TITLEBAR_H
    );

    this.palette = new Palette(
      this.x + MARGIN,
      this.y + this.h - PALETTE_H - MARGIN,
      this.w - MARGIN * 2,
      PALETTE_H
    );

    this.canvas = new Canvas(
      this.x + TOOLBAR_W + PADDING * 2,
      this.y + TITLEBAR_H + PADDING * 2,
      this.w - TOOLBAR_W - CANVAS_GAP,
      this.h - PALETTE_H - TITLEBAR_H - CANVAS_GAP
    );
  }

// forward declare
updateObjects() {
  // // called from update dialog, take the id=curObjects textarea and get all objects
  // // repace DrawnOjects with these
  // let strObjects = $('#curObjects').val();
  // console.log('IN dynamic_dialog: updateObjects',strObjects);
}


  draw() {
    if (!this.visible) return;

    // Basic grey background
    fill("lightgrey");
    stroke("black");
    rect(this.x, this.y, this.w, this.h);

    // Draw all our components
    this.drawTitleBar();
    this.closeButton.draw();
    this.toolbar.draw();
    this.palette.draw();

    // Draw darker canvas background
    fill("dimgray");
    noStroke();
    rect(
      this.x + TOOLBAR_W + PADDING / 2,
      this.y + TITLEBAR_H + MARGIN + PADDING / 2,
      this.w - TOOLBAR_W - PADDING,
      this.h -
        PALETTE_H -
        TITLEBAR_H -
        PADDING -
        MARGIN
    );

    this.canvas.display();
  }

  drawTitleBar() {
    fill("darkblue");
    rect(
      this.x + PADDING / 2,
      this.y + PADDING / 2,
      this.w - PADDING,
      TITLEBAR_H
    );

    // Draw the icon on the title bar
    image(
      icon,
      this.x + MARGIN * 2,
      this.y + MARGIN * 2,
      ICON_SIZE,
      ICON_SIZE
    );

    // Window title
    fill("white");
    noStroke();
    textSize(12);
    textAlign(LEFT, CENTER);
    textFont("Courier New");
    textStyle(BOLD);
    const x = this.x + ICON_SIZE + MARGIN * 5;
    const y = this.y + TITLEBAR_H - PADDING * 1.5;
    text(this.title, x, y);

    // show mouse x,y
    // subtradt off positon of drawing area
    text(`X: ${mouseX - 200}, Y: ${mouseY - 50}`, 10, 10);
  }

  mousePressed(mx, my) {
    // console.log("PaintWindow mousePressed");
    this.closeButton.mousePressed(mx, my);
    this.palette.mousePressed(mx, my);
    this.toolbar.mousePressed(mx, my);
    this.canvas.mousePressed(mx, my);
  }

  mouseDragged(mx, my) {
    this.canvas.mouseDragged(mx, my);
  }

  mouseReleased() {
    this.canvas.mouseReleased();
  }
}

class Button {
  constructor(
    x,
    y,
    w,
    h,
    label,
    action,
    fillColor = null,
    img = null
  ) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.label = label;
    this.action = action;
    this.fillColor = fillColor;
    this.img = img;
  }

  draw() {
    if (this.img != null) {
      image(
        this.img,
        this.x + this.w / 2 - this.img.width / 2,
        this.y + this.h / 2 - this.img.height / 2
      );
    } else {
      fill(this.fillColor ? this.fillColor : "lightgrey");
      stroke("black");
      rect(this.x, this.y, this.w, this.h);
      if (!this.fillColor) {
        fill("black");
        textSize(13);
        textAlign(CENTER, CENTER);
        text(
          this.label,
          this.x + this.w / 2,
          this.y + this.h / 2
        );
      }
    }
  }

  mousePressed(mx, my) {
    // onsole.log("mousePressed Button")
    if (currentTool == 'eraser') {
      cursor(CROSS);
    } else {
      cursor(ARROW);
    }
    if (
      mx > this.x &&
      mx < this.x + this.w &&
      my > this.y &&
      my < this.y + this.h
    ) {
      this.action();
      // console.log("mousePressed Button current tool",currentTool);
      // if grid is current tool, show the grid dialog
      if (currentTool == 'grid') {
        handleAction('grid'); // processed in DialogDone function
      }
      if (currentTool == 'eraser') {
        cursor(CROSS);
        // modifier to erase all
        if (keyIsPressed === true) {
          eraseAll(); // remove all user objects - we should have an undo!
        };
      }
      if (currentTool == 'undo') {
        eraseLastDrawnObject();
      }
      if (currentTool == 'gear') {
        handleAction('gear'); // processed in DialogDone function
      }
      if (currentTool == 'update') {
        handleAction('update'); // processed in DialogDone function
      }
    }
  }
}

class ToolbarButton extends Button {
  constructor(
    x,
    y,
    w,
    h,
    label,
    action,
    fillColor = null,
    img = null,
    onImg = null
  ) {
    super(x, y, w, h, label, action, fillColor, img);
    // An alternative image to show when the tool is selected.
    this.onImg = onImg;
  }

  draw() {
    if (currentTool === this.label && this.onImg != null) {
      image(
        this.onImg,
        this.x + this.w / 2 - this.onImg.width / 2,
        this.y + this.h / 2 - this.onImg.height / 2
      );
    } else {
      // Use the parent class's draw method
      super.draw();
    }
  }
}

class Toolbar {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.toolButtons = [];

    // Create a ToolbarButton object for each tool.
    AVAILABLE_TOOLS.forEach((toolName, i) => {
      const row = floor(i / 2);
      const col = i % 2;
      this.toolButtons.push(
        new ToolbarButton(
          this.x + 5 + col * TOOLBAR_BUTTON_SIZE,
          this.y + 5 + row * TOOLBAR_BUTTON_SIZE,
          TOOLBAR_BUTTON_SIZE,
          TOOLBAR_BUTTON_SIZE,
          toolName,
          () => {
            currentTool = toolName;
          },
          null,
          toolIcons[toolName][0],
          toolIcons[toolName][1]
        )
      );
    });
  }

  draw() {
    fill("darkgray");
    noStroke();
    rect(this.x, this.y, this.w, this.h);
    this.toolButtons.forEach((button) => button.draw());
  }

  mousePressed(mx, my) {
    // console.log("mousePressed Toolbar")
    this.toolButtons.forEach((button) =>
      button.mousePressed(mx, my)
    );
  }
}

class Palette {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.colorButtons = [];

    // Create a Button object for each color
    const endFirstRow = WEB_COLORS.length / 2;
    WEB_COLORS.forEach((colorName, i) => {
      let row = i < endFirstRow ? 0 : 1;
      let col = row > 0 ? i - endFirstRow : i;
      let x =
        this.x +
        this.h +
        col * PALETTE_BUTTON_SIZE +
        col * MARGIN * 2;
      let y =
        this.y +
        row * PALETTE_BUTTON_SIZE +
        PADDING * 2 +
        (row > 0 ? MARGIN * 2 : 0);
      this.colorButtons.push(
        new Button(
          x,
          y,
          PALETTE_BUTTON_SIZE,
          PALETTE_BUTTON_SIZE,
          colorName,
          () => {
            currentColor = colorName;
          },
          colorName
        )
      );
    });
  }

  draw() {
    fill("darkgray");
    rect(this.x, this.y, this.w, this.h);

    // Draw a box for the currently selected color
    stroke(60);
    fill("lightgray");
    rect(
      this.x + PADDING * 2,
      this.y + PADDING * 2,
      this.h - PADDING * 4,
      this.h - PADDING * 4
    );

    // Draw a little shaddow
    fill("black");
    const offset = this.h / 2 - this.h / 6;
    const s = PALETTE_BUTTON_SIZE;
    rect(
      this.x + offset + MARGIN,
      this.y + offset + MARGIN,
      s,
      s
    );

    // Draw currently selected color
    fill(currentColor);
    rect(this.x + offset, this.y + offset, s, s);

    // Draw each color
    this.colorButtons.forEach((button) => button.draw());
  }

  mousePressed(mx, my) {
    // console.log("mousePressed Pallete")
    this.colorButtons.forEach((button) =>
      button.mousePressed(mx, my)
    );
  }
}

class Canvas {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    // Used for pencil, brush when drawing frame by frame
    this.lastX = null;
    this.lastY = null;

    // Used for drawing geometry i.e. lines, circles, etc.
    // These change less frequently than lastX, lastY.
    this.drawingX = null;
    this.drawingY = null;

    // Create a p5.Graphics object to store user's drawing
    // this.buffer = createGraphics(920, 600);
    // this.buffer.pixelDensity(pixelDensity()); 
    this.buffer = createGraphics(w, h);
    this.buffer2 = createGraphics(w, h); // for grid
    this.buffer.background("white");
    this.buffer2.background("white"); // for grid
  }

  display() {
    fill("white");
    this.buffer2.clear() // make the grid transparent
    rect(this.x, this.y, this.w, this.h);
    drawGrid();
    // image(this.buffer, this.x, this.y); // old way try object drawing
    drawObjects();
    image(this.buffer2, this.x, this.y);

    if (this.isDrawingGeometry()) {
      // Draw a preview of what the user is trying to draw
      let x1 = this.x + this.drawingX;
      let y1 = this.y + this.drawingY;
      let x2 = mouseX;
      let y2 = mouseY;
      if (!this.mouseInsideCanvas(x2, y2)) {
        this.drawingX = null;
        this.drawingY = null;
        return;
      }
      this.drawShape(currentTool, x1, y1, x2, y2, false);
    }
  }

  mouseInsideCanvas(mx, my) {
    return (
      mx >= this.x &&
      mx <= this.x + this.w &&
      my >= this.y &&
      my <= this.y + this.h
    );
  }

  isDrawingGeometry() {
    return this.drawingX !== null;
  }

  strokeWeight() {
    return currentTool === "brush" ? 5 : 1;
  }

  replaceBufferWithFreshCanvas() {
    let newBuffer = createGraphics(this.w, this.h);
    newBuffer.image(this.buffer, 0, 0);
    this.buffer = newBuffer;
  }

  beginGeometry(x, y) {
    this.drawingX = x;
    this.drawingY = y;
  }

  endGeometry(x, y) {
    if (this.isDrawingGeometry()) {
      this.drawShape(
        currentTool,
        this.drawingX,
        this.drawingY,
        x,
        y
      );
    }
    this.drawingX = null;
    this.drawingY = null;
  }

  drawShape(shape, x1, y1, x2, y2, persist = true) {
    // ('drawShape');
    let c = persist ? this.buffer : window;
    c.stroke(currentColor);
    c.strokeWeight(this.strokeWeight());

    switch (shape) {
      case "line":
        if (persist == false) {
          c.line(x1, y1, x2, y2);
        } else {
          if (Snap == 'On') {
            [x1,y1] = nearestSnap(x1,y1);
            [x2,y2] = nearestSnap(x2,y2);
          }
          const o = {'line':[x1,y1,x2,y2,currentColor,curLineWidth,curDrawFill]};
          DrawnObjects.push(o);  
        }
        break;
      case "rect":
        if (persist == false) {
          c.noFill();
          c.rect(x1, y1, x2 - x1, y2 - y1);
        } else {
          if (Snap == 'On') {
            [x1,y1] = nearestSnap(x1,y1);
            [x2,y2] = nearestSnap(x2,y2);
          }
          const o = {'rect':[x1, y1, x2 - x1, y2 - y1, currentColor,curLineWidth,curDrawFill]};
          DrawnObjects.push(o);  
        }
        break;

      case "letter":
        if (dialogInProgress == true) {
          return; // do not retrigger this during dialog
        }
        // Todo adjust letter parameters
        // console.log(persist)
        c.textFont('Courier New');
        c.textStyle(NORMAL);
        c.textSize(lastFontSize);
        c.textAlign(LEFT, CENTER);
        c.fill(currentColor); 

        if (persist == false) {
          c.text("Y", x2, y2);
        } else {
          dialogInProgress = true;
          const o = {'letter':["Y",x2,y2]};
          // dialog to see what letter, font, etc we want
          console.log("Letter Dialog");
          LetterDialog(o); // the callback will add the object
          //DrawnObjects.push(o);  
        }
        //c.text("Z", mouseX, mouseY);

        //text("A", x1, y1);
        //c.noFill();
        //c.rect(x1, y1, x2 - x1, y2 - y1);
        break;    

      case "circle":
      let radiusX = (x2 - x1) / 2;
      let radiusY = (y2 - y1) / 2;
      if (persist == false) {
          c.noFill();
          c.ellipse(
            x1 + radiusX,
            y1 + radiusY,
            Math.abs(radiusX * 2),
            Math.abs(radiusY * 2)
          );
        } else {
          const o = {'circle':[x1 + radiusX, 
                              y1 + radiusY,
                              Math.abs(radiusX * 2), 
                              Math.abs(radiusY * 2),currentColor,curLineWidth,curDrawFill]};
          DrawnObjects.push(o);  
        }
        break;

        case "eraser":
          if (persist) {
            // console.log("draw eraser",x1,y1,x2,y2,persist);
            erase_object(x2,y2);
          }
          break;
    }
  }

  mousePressed(mx, my) {
    // console.log("mousePressed Canvas");
    if (!this.mouseInsideCanvas(mx, my)) return;

    const adjustedX = mx - this.x;
    const adjustedY = my - this.y;
    this.lastX = adjustedX;
    this.lastY = adjustedY;

    switch (currentTool) {
      case "paint":
        this.paint(adjustedX, adjustedY);
        break;
      case "pencil":
      case "brush":
        this.buffer.stroke(currentColor);
        this.buffer.strokeWeight(this.strokeWeight());
        this.buffer.point(adjustedX, adjustedY);
        break;
      case "line":
      case "rect":
      case "circle":
      case "letter":
      case "eraser":
        this.beginGeometry(adjustedX, adjustedY);
        break;
      case "spray":
        this.sprayPaint(adjustedX, adjustedY);
        break;
    }
  }

  mouseDragged(mx, my) {
    if (!this.mouseInsideCanvas(mx, my)) return;

    // Adjust mx & my to be relative to drawing canvas
    const adjustedX = mx - this.x;
    const adjustedY = my - this.y;

    switch (currentTool) {
      case "spray":
        this.sprayPaint(
          mx - this.x,
          my - this.y,
          currentColor
        );
        break;
      case "eraser":
        this.eraser(
          pmouseX - this.x,
          pmouseY - this.y,
          mx - this.x,
          my - this.y
        );
        break;
      case "pencil":
      case "brush":
        // Draw a line only if we have a previous position
        if (this.lastX !== null && this.lastY !== null) {
          this.buffer.stroke(currentColor);
          this.buffer.strokeWeight(this.strokeWeight());
          this.buffer.line(
            this.lastX,
            this.lastY,
            adjustedX,
            adjustedY
          );
        }

        // Update the previous position
        this.lastX = adjustedX;
        this.lastY = adjustedY;
        break;
    }
  }

  mouseReleased() {
    this.lastX = null;
    this.lastY = null;
    if (!this.mouseInsideCanvas(mouseX, mouseY)) return;
    if (this.isDrawingGeometry()) {
      // Render whatever we are drawing
      // console.log("mouseReleased - render the item")
      this.endGeometry(mouseX - this.x, mouseY - this.y);
    }
  }

  sprayPaint(x, y) {
    let density = 50; // Dots per frame
    let radius = 10; // Max distance from center
    this.buffer.stroke(currentColor);
    this.buffer.strokeWeight(1); // Size of each dot
    for (let i = 0; i < density; i++) {
      // Calculate a random offset for each dot
      let angle = random(TWO_PI); // Random angle
      let r = random(radius); // Distance from center
      let offsetX = r * cos(angle);
      let offsetY = r * sin(angle);
      this.buffer.point(x + offsetX, y + offsetY);
    }
  }

  eraser(x1, y1, x2, y2, strokeWeightVal = 10) {
    // Assume white background
    this.buffer.stroke(255, 255, 255);
    this.buffer.strokeWeight(strokeWeightVal);
    this.buffer.line(x1, y1, x2, y2);
  }

  paint(x, y) {
    const newColor = color(currentColor);
    this.buffer.loadPixels();
    let targetColor = this.buffer.get(x, y);

    // Do nothing if the target and new color are the same
    let isSame = this.colorsEqual(targetColor, newColor, 0);
    if (isSame) {
      return;
    }

    let pixelVisited = new Set();
    let queue = [[x, y]];

    const shouldColorPixel = (x1, y1) => {
      if (
        x1 < 0 ||
        y1 < 0 ||
        x1 > this.buffer.width ||
        y1 > this.buffer.height
      ) {
        return false;
      }

      let idx = y1 * this.buffer.width + x1;
      if (pixelVisited.has(idx)) {
        return false;
      }

      let thisColor = this.buffer.get(x1, y1);
      return this.colorsEqual(thisColor, targetColor);
    };

    while (queue.length > 0) {
      let [x, y] = queue.shift();
      let idx = y * this.buffer.width + x;

      if (!pixelVisited.has(idx)) {
        this.buffer.set(x, y, newColor);
        pixelVisited.add(idx);

        // Define the four directions to check
        let directions = [
          [0, -1],
          [1, 0],
          [0, 1],
          [-1, 0],
        ];

        for (let [xOffset, yOffset] of directions) {
          if (shouldColorPixel(x + xOffset, y + yOffset)) {
            queue.push([x + xOffset, y + yOffset]);
          }
        }
      }
    }
    this.buffer.updatePixels();
    this.replaceBufferWithFreshCanvas();
  }

  // Helper method to normalize colors
  normalizeColor(color) {
    if (color instanceof p5.Color) {
      return [
        red(color),
        green(color),
        blue(color),
        alpha(color),
      ];
    } else {
      if (color.length === 3) {
        return [...color, 255];
      }
      return color;
    }
  }

  // Helper method to check if two colors are equal
  colorsEqual(col1, col2, tolerance = 10) {
    col1 = this.normalizeColor(col1);
    col2 = this.normalizeColor(col2);

    return (
      Math.abs(col1[0] - col2[0]) <= tolerance &&
      Math.abs(col1[1] - col2[1]) <= tolerance &&
      Math.abs(col1[2] - col2[2]) <= tolerance &&
      Math.abs(col1[3] - col2[3]) <= tolerance
    );
  }
}

function setup() {
  createCanvas(920, 600);
  paintWindow = new PaintWindow(
    50,
    20,
    820,
    550,
    "untitled - Paint"
  );
  pg = createGraphics(600, 600); //
}

function draw() {
  background("teal");
  paintWindow.draw();
}

function mousePressed() {
  paintWindow.mousePressed(mouseX, mouseY);
}

function mouseDragged() {
  paintWindow.mouseDragged(mouseX, mouseY);
}

function mouseReleased() {
  paintWindow.mouseReleased();
}

function dialogDone(dialog_name, result_list, cur_drawn_object=null) {
  console.log("dialogDone result_list", dialog_name, result_list);
  if (dialog_name == 'grid') {
    // set the grid as per user configuration
    /*
       gridDialog = [
        ['Grid',{'gridOnOff':['select','On','Off']}],
        ['Grid Type',{'gridType':['select','Dots','Grid']}],
        ['Grid Spacing',{'gridSpacing':['input','25']}], // 25 is default value for input box
        ['Snap',{'snapOnOff':['select','On','Off']}]
      
        result_list = { 'gridOnOff':Off, 'gridType':Dots, 
                        'gridSpacing:25', 'snapOnOff:Off }
    */
    // update globals
    gridOnOff = result_list['gridOnOff'];
    gridType = result_list['gridType'];
    gridSpacing = Number(result_list['gridSpacing']);
    Snap = result_list['snapOnOff'];
  }
  if (dialog_name == 'letter') {
    // return values: 'selLetter','ltrSize','ltrFont'
    // adjust drawnObject details
    let [ch, x, y] = cur_drawn_object['letter'];
    ch = result_list['selLetter'];
    s = result_list['ltrSize'];
    f = result_list['ltrFont'];
    co = currentColor;
    lastFontSize = Number(s);
    const o = {'letter':[ch,x,y,s,f,co]};
    DrawnObjects.push(o);
  }
  if (dialog_name == 'gear') {  // drawing settings
    // return values: 'lineWidth','fillShape'
    // set global variables
    curLineWidth = Number(result_list['lineWidth']);
    curDrawFill = result_list['fillShape'];
    // set gloval 
  }
  dialogInProgress = false;
}

function drawGrid() {
  const spacing = gridSpacing;  // adjust per user
  const rSize = 4;

  cv = paintWindow.canvas; // for dimensions
  const c = cv.buffer2; // 2nd layer for grid
  c.stroke('black');
  c.strokeWeight(1);
  c.fill(0);

  // here do dots or lines
  if (gridOnOff == 'On') {
    if (gridType == 'Dots') {
      // dots
      for(y = 0; y < cv.h + 50; y += spacing) {
        for(x = 0; x < cv.w + 50; x += spacing) {
          c.rect(x,y,rSize,rSize);
        } 
      } 
      } else {
        // lines
        c.strokeWeight(3);
        for (y=0; y<cv.h; y += spacing) {
          c.line(0, y, cv.w, y);
        }
        for (x=0; x<cv.w; x += spacing) {
          c.line(x, 0, x, cv.h);
        }
      }
  }
}

// object drawing routines
function drawObjects() { 
  // draw user Objects that can be erased
  cv = paintWindow.canvas; // for dimensions
  const c = cv.buffer; // 1st layer for canvas drawing
  // TODO - get the color, weight, fill for the line,rect,circle...
  c.stroke('black');
  c.strokeWeight(5);
  c.fill(0);
  
  // user objects
  /*
       o = {'line':[x1,y1,x2,y2]};
       DrawnObjects.push(o); 
  */

  // force only lines to remain - so we can remove what we want
  // need all other other shapes put into DrawnObjects to restore functionality
  cv.buffer.background("white");

  const l = DrawnObjects.length;
  if (l > 0 ) {
    // just show the lines
    for (let obj = 0; obj < l; obj++) {
      //first_line = DrawnObjects[0];
      key = Object.keys(DrawnObjects[obj])[0]; 
      if (key == 'line') {
        const [x1, y1, x2, y2, co, clw] = DrawnObjects[obj][key]; // Yay destructuring
        c.stroke(co); // color
        c.strokeWeight(clw);
        c.line(x1, y1, x2, y2);
      }
      if (key == 'rect') {
        const [x1, y1, w, h, co, clf, cdf] = DrawnObjects[obj][key];
        c.stroke(co);
        c.strokeWeight(clf);
        if (cdf == 'On') {
          c.fill(co);
        }
        else {
          c.noFill();
        }
        c.rect(x1, y1, w, h);
      }
      if (key == 'letter') {
        const [ch, x, y, s, f, co] = DrawnObjects[obj][key];
        // set size and font
        c.textFont(f);
        c.textStyle(NORMAL);
        c.textAlign(LEFT, CENTER)
        c.fill(co); 
        c.textSize(Number(s));
        c.strokeWeight(1);
        c.text(ch, x, y);
      }
      if (key == 'circle') {
        const [x, y, d1, d2, co, clf, cdf] = DrawnObjects[obj][key];
        c.stroke(co); // color
        c.strokeWeight(clf);
        if (cdf == 'On') {
          c.fill(co);
        }
        else {
          c.noFill();
        }
        c.ellipse(x, y, d1, d1);  // make the ellipse a circle
      }
    }
  }
  
  image(cv.buffer, cv.x, cv.y); // old way try object drawing
}

function eraseAll() {
  // erase all user objects (later choose objects option)
  const cv = paintWindow.canvas;
  cv.buffer.background("white");
  DrawnObjects = [];
}

function isPointOnLineSegment(x, y, x1, y1, x2, y2, margin = 3) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lineLengthSq = dx * dx + dy * dy;

  // Handle case where the line is a single point
  if (lineLengthSq === 0) {
      const dist = Math.sqrt(Math.pow(x - x1, 2) + Math.pow(y - y1, 2));
      return dist <= margin;
  }

  // Calculate the projection of the point onto the line
  // Parameter 't' indicates where the point projects onto the line (0 = start, 1 = end)
  const t = ((x - x1) * dx + (y - y1) * dy) / lineLengthSq;

  // Constrain 't' to the range [0, 1] to check only the line segment
  // If t is outside [0, 1], the closest point is one of the endpoints
  const t_clamped = Math.max(0, Math.min(1, t));

  // Find the coordinates of the closest point on the line segment
  const closestX = x1 + t_clamped * dx;
  const closestY = y1 + t_clamped * dy;

  // Calculate the distance from the given point to the closest point on the segment
  const distance = Math.sqrt(Math.pow(x - closestX, 2) + Math.pow(y - closestY, 2));

  // Check if the distance is within the specified margin
  return distance <= margin;
}

function isPointInRectangle(x, y, x1, y1, x2, y2, margin = 3) {
  // expand the box by margin
  x1 = x1 - margin;
  y1 = y1 - margin;
  x2 = x2 + margin;
  y2 = y2 + margin;

  if ((x>=x1) && (y>=y1) && (x<=x2) && (y<=y2)) {
    return true;
  } else {
    return false;
  }
}

function isPointInCircle(x, y, x1, y1, radius, margin=3) {
  let d = dist(x, y, x1, y1); // Calculate distance
  if (d < radius + margin) {
    return true;
  } else {
    return false;
  }
}


function erase_object(eraserX, eraserY) {
  // erase object that intersects given parameters
  const l = DrawnObjects.length;
  for (let i = 0; i < l; i++) {
    //first_line = DrawnObjects[0];
    key = Object.keys(DrawnObjects[i])[0]; 
    if (key == 'line') {
      const [x1, y1, x2, y2] = DrawnObjects[i][key]; // coords of line
      if (isPointOnLineSegment(eraserX, eraserY, x1,y1,x2,y2,6)) {
        // console.log('Found line - removing it!')
        DrawnObjects.splice(i, 1)
        break; // only do 1 at a time
      }
    }
    if (key == 'rect') {
      const [x1, y1, w, h] = DrawnObjects[i][key]; // coords of line
      if (isPointInRectangle(eraserX, eraserY, x1,y1,x1+w,y1+h,6)) {
        // console.log('Found rect - removing it!')
        DrawnObjects.splice(i, 1)
        break; // only do 1 at a time
      }
    }
    if (key == 'circle') {
      const [x, y, d1, d2] = DrawnObjects[i][key];
      if (isPointInCircle(eraserX, eraserY, x, y, d1/2, 6)) {
        // console.log('Found circle - removing it!')
        DrawnObjects.splice(i,1);
        break; // only do 1 at a time
      }
    }

    // estimate font height and width - 1 letter for now
    if (key == 'letter') {
      const [ch, x, y, s, f, co] = DrawnObjects[i][key];
      // use font size
      const offset = Number(s)
      const tl = ch.length;
      if (isPointInRectangle(eraserX, eraserY, x,y,x+(offset*tl),y+offset,6)) {
        // console.log('Found letter - removing it!')
        DrawnObjects.splice(i, 1)
        break; // only do 1 at a time
      }
    }
  }
}

function nearestSnap(x,y) {
  // find nearest x,y snap point
  // use gridSpacing to get snapResolution
  x += (gridSpacing / 2);  // move to middle
  y += (gridSpacing / 2);  // move to middle
  m1 = x % gridSpacing;  // how far off are we
  m2 = y % gridSpacing;  // how far off are we
  x2 = x - m1;  // get the nearest snap value 
  y2 = y - m2;  // get the nearest snap value
  return [Math.round(x2),Math.round(y2)];
}

function LetterDialog(o) {
  // given draw object, use dialog to set letter, font ..
  CurrentObjectInDialog = o; // save, after dialog 
  handleAction('letter',o);
}

function eraseLastDrawnObject() {
  const l = DrawnObjects.length;
  if (l == 0) {
    return; // no objects to delete
  }
  DrawnObjects.splice(l-1, 1);  // delete last drawn object
}

function GetDrawnObjects() {
  // for update objects Dialog
  let txt = ''
  const l = DrawnObjects.length;
  if (l > 0 ) {
    for (let obj = 0; obj < l; obj++) {
      key = Object.keys(DrawnObjects[obj])[0]; 
      if (key == 'line') {
        const [x1, y1, x2, y2, co, clw] = DrawnObjects[obj][key]; // Yay destructuring
        txt += `{"line":[${x1}, ${y1}, ${x2}, ${y2}, "${co}", ${clw}]},\n`;
      }
      if (key == 'rect') {
        const [x1, y1, w, h, co, clf, cdf] = DrawnObjects[obj][key];
        txt += `{"rect":[${x1}, ${y1}, ${w}, ${h}, "${co}", ${clf}, ${cdf}]},\n`;
      }
      if (key == 'letter') {
        const [ch, x, y, s, f, co] = DrawnObjects[obj][key];
        txt += `{"letter":["${ch}", ${x}, ${y}, ${s}, "${f}", "${co}"]},\n`;
      }
      if (key == 'circle') {
        const [x, y, d1, d2, co, clf, cdf] = DrawnObjects[obj][key];
        txt += `{"circle":[${x}, ${y}, ${d1}, ${d2}, "${co}", ${clf}, ${cdf}]},\n`;
      }
    }
    // remove last comma space \n
    txt = txt.slice(0, -2)
  }
  return txt
}

function updateObjects() {
  // called from update dialog, take the id=curObjects textarea and get all objects
  // repace DrawnOjects with these
  let strObjects = $('#curObjects').val();
  console.log('updateObjects',strObjects);
  lines = strObjects.split('\n')
  l = lines.length;
  // split string at \n
  if (l > 0 ) {
    DrawnObjects = []
    for (let i = 0; i < l; i++) {
      // remove last , if present
      let curLine = lines[i];
      if (curLine.at(-1) == ',') {
        curLine = curLine.slice(0, -1);
      }
      const jsObject = JSON.parse(curLine);
      console.log(jsObject)
      DrawnObjects.push(jsObject);
    }
  }
}