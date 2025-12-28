
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
let currentColor = "fuchsia";
let icon;
let toolIcons = {};

let gridOnOff = 'Off';
let gridType = 'Dots';
let gridSpacing = 25;
let Snap = 'Off';

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
    "grid"
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
        handleAction();
        console.log("handleAction done");  
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
    image(this.buffer, this.x, this.y);
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
        c.line(x1, y1, x2, y2);
        break;
      case "rect":
        c.noFill();
        c.rect(x1, y1, x2 - x1, y2 - y1);
        break;

      case "letter":
        // Todo adjust letter parameters
        // console.log(persist)
        c.textFont('Courier New');
        c.textStyle(NORMAL);
        c.textSize(64);
        c.textAlign(CENTER, CENTER);
        c.fill(0, 0, 255); // RGB: Red, Green, Blue (0-255)
        //c.text("X", x1, y1);
        c.text("Y", x2, y2);
        //c.text("Z", mouseX, mouseY);

        //text("A", x1, y1);
        //c.noFill();
        //c.rect(x1, y1, x2 - x1, y2 - y1);
        break;    

      case "circle":
        c.noFill();
        let radiusX = (x2 - x1) / 2;
        let radiusY = (y2 - y1) / 2;
        c.ellipse(
          x1 + radiusX,
          y1 + radiusY,
          Math.abs(radiusX * 2),
          Math.abs(radiusY * 2)
        );
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

function dialogDone(dialog_name, result_list) {
  console.log("dialogDone result_list", dialog_name, result_list);
  if (dialog_name == 'grid_dialog') {
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
