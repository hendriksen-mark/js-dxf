# JavaScript DXF writer

Simple [DXF](https://en.wikipedia.org/wiki/AutoCAD_DXF) writer.

## Installing
```
npm install @markhhh/dxf-writer
```

## Node.js example
```javascript
const { NodeJsDrawing: Drawing } = require('@markhhh/dxf-writer');
const fs = require('fs');

async function main() {
  const stream = fs.createWriteStream(__filename + '.dxf');
  const d = new Drawing(stream);

  d.setUnits('Decimeters');
  await d.drawText(10, 0, 10, 0, 'Hello World'); // draw text in the default layer named "0"
  d.addLayer('l_green', Drawing.ACI.GREEN, 'CONTINUOUS');
  d.setActiveLayer('l_green');
  await d.drawText(20, -70, 10, 0, 'go green!');

  d.addLayer('l_yellow', Drawing.ACI.YELLOW, 'DOTTED').setActiveLayer('l_yellow');
  await d.drawCircle(50, -30, 25);

  await d.end();
  stream.end();
}

main().catch(console.error);
```
Example preview in LibreCAD:
![example in LibreCAD](https://raw.githubusercontent.com/hendriksen-mark/js-dxf/master/examples/demo.png "example in LibreCAD")

## Browser examples

 - [demo](https://hendriksen-mark.github.io/js-dxf/examples/browser/index.html)

 - [editor](https://hendriksen-mark.github.io/js-dxf/examples/browser/editor/index.html)

## Supported entities:
 - arc
 - circle
 - cylinder
 - ellipse
 - face
 - helix
 - line
 - line 3D
 - mesh
 - point
 - polygon
 - polyline
 - polyline 3D
 - spline
 - text
 - vertex
 
## Supported colors: 
 - red
 - green 
 - cyan
 - blue
 - magenta
 - white

## Supported units:
 - Unitless
 - Inches
 - Feet
 - Miles
 - Millimeters
 - Centimeters
 - Meters
 - Kilometers
 - Microinches
 - Mils
 - Yards
 - Angstroms
 - Nanometers
 - Microns
 - Decimeters
 - Decameters
 - Hectometers
 - Gigameters
 - Astronomical units
 - Light years
 - Parsecs

## Line types
3 line type out of the box (CONTINUOUS, DASHED, DOTTED) with the ability to add a custom line type.

```javascript
const { BrowserFriendlyDrawing: Drawing, StringWritableStream } = require('@markhhh/dxf-writer');

let d = new Drawing(new StringWritableStream());
d.addLineType('DASHDOT', '_ . _ ', [0.5, -0.5, 0.0, -0.5]);
```
