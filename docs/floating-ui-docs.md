Use on the 
web
 with vanilla JavaScript (dom refers to the 
Document Object Model
 to work with HTML/SVG elements).

npm install @floating-ui/dom

Tutorial
Build a tooltip from scratch and learn how to use Floating UI’s positioning toolkit.

This page teaches you the fundamentals of Floating UI’s positioning by building a tooltip from scratch. If you just want to start learning about the API, skip to the 
next section
.

Before proceeding
The vanilla package of this library is a JavaScript-based layout engine for “anchor positioning”. It acts as a polyfill for CSS to correctly position absolutely-positioned anchored elements on the document.

If you’re looking for pre-built components or something simple out of the box, you may find other libraries are better suited for your use case.

Setting up
Create a new HTML document with two elements, a <button> and a tooltip <div>:

<!doctype html>
<html>
  <head>
    <title>Floating UI Tutorial</title>
  </head>
  <body>
    <button id="button" aria-describedby="tooltip">
      My button
    </button>
    <div id="tooltip" role="tooltip">My tooltip</div>
 
    <script type="module">
      // Your code will go here.
    </script>
  </body>
</html>
Right now you should see the following (except with the browser’s default styling):

My button
My tooltip
Styling
Let’s give our tooltip some styling:

<!doctype html>
<html>
  <head>
    <title>Floating UI Tutorial</title>
    <style>
      #tooltip {
        background: #222;
        color: white;
        font-weight: bold;
        padding: 5px;
        border-radius: 4px;
        font-size: 90%;
      }
    </style>
  </head>
  <body>
    <!-- ... -->
  </body>
</html>
Here’s the result so far:

My button
My tooltip
Making the tooltip “float”
Your tooltip <div> is a regular block on the document, like any other element, which is why it spans the whole width of the page.

We want it to float on top of the UI though, so it doesn’t disrupt the flow of the document, and should only take up as much size as its contents.

#tooltip {
  width: max-content;
  position: absolute;
  top: 0;
  left: 0;
  background: #222;
  color: white;
  font-weight: bold;
  padding: 5px;
  border-radius: 4px;
  font-size: 90%;
}
Visit 
Initial layout
 to learn more.

My buttonMy tooltip
Your tooltip is now a “floating” element — it only takes up as much size as it needs to and is overlaid on top of the UI.

Positioning
Inside your module <script> tag, add the following code:

Play on CodeSandbox

import {computePosition} from 'https://cdn.jsdelivr.net/npm/@floating-ui/dom@1.7.2/+esm';
 
const button = document.querySelector('#button');
const tooltip = document.querySelector('#tooltip');
 
computePosition(button, tooltip).then(({x, y}) => {
  Object.assign(tooltip.style, {
    left: `${x}px`,
    top: `${y}px`,
  });
});
Above, we call computePosition() with the button and tooltip elements as arguments.

It returns a Promise, so we use the .then() method which passes in the calculated x and y coordinates for us, which we use to assign left and top styles to the tooltip.

Our tooltip is now centered underneath the button:

My buttonMy tooltip
Placements
The default placement is 'bottom', but you probably want to place the tooltip anywhere relative to the button. For this, Floating UI has the placement option, passed into the options object as a third argument:

import {computePosition} from 'https://cdn.jsdelivr.net/npm/@floating-ui/dom@1.7.2/+esm';
 
const button = document.querySelector('#button');
const tooltip = document.querySelector('#tooltip');
 
computePosition(button, tooltip, {
  placement: 'right',
}).then(({x, y}) => {
  Object.assign(tooltip.style, {
    left: `${x}px`,
    top: `${y}px`,
  });
});
My buttonMy tooltip
The available base placements are 'top', 'right', 'bottom', 'left'.

Each of these base placements has an alignment in the form -start and -end. For example, 'right-start', or 'bottom-end'. These allow you to align the tooltip to the edges of the button, rather than centering it.

Our first problem
These placements are a useful feature themselves, but they don’t offer much that couldn’t be achieved with raw CSS tricks. Which brings us to our first problem: what happens if we use a 'top' placement?

My buttonMy tooltip
We can’t read the tooltip text because the button happens to be close to the document boundary. In this case, you could use the 'bottom' placement, instead of 'top'. Again, you could just use CSS for this, although it may become unwieldy and require extra parent wrapper tags.

Needing to manually handle this for every single tooltip you add in an application can be cumbersome. This is especially true when you want to apply a tooltip or popover to an element anywhere on the page at a whim, and have its position “just work” for any screen size or location, without needing to adjust anything.

This is why you can let Floating UI handle it for you automatically with the adoption of “middleware”.

Middleware
Middleware are how every single feature beyond the basic placement positioning is implemented.

A middleware is a piece of code which runs between the call of computePosition() and its eventual return, to modify or provide data to the consumer.

flip() modifies the coordinates for us such that it uses the 'bottom' placement automatically without us needing to explicitly specify it.

import {
  computePosition,
  flip,
} from 'https://cdn.jsdelivr.net/npm/@floating-ui/dom@1.7.2/+esm';
 
const button = document.querySelector('#button');
const tooltip = document.querySelector('#tooltip');
 
computePosition(button, tooltip, {
  placement: 'top',
  middleware: [flip()],
}).then(({x, y}) => {
  Object.assign(tooltip.style, {
    left: `${x}px`,
    top: `${y}px`,
  });
});
Now, even though we’ve set placement to 'top', the tooltip flips to the bottom automatically for us if it can’t fit on the top. No need to adjust anything manually.

My buttonMy tooltip
Importantly, it will continue to use the 'top' placement at all times if it can, and only fallback to 'bottom' if it has to.

Shift middleware
Now, what if we wanted to have more content inside the tooltip?

<div id="tooltip" role="tooltip">
  My tooltip with more content
</div>
My buttonMy tooltip with more content
Oh no, we now have the same problem as before, but on the opposite axis (x instead of y). Because it’s centered beneath the button, and the tooltip happens to be wider than the button, it ends up overflowing the viewport edge.

To solve this problem, we have the shift() middleware:

import {
  computePosition,
  flip,
  shift,
} from 'https://cdn.jsdelivr.net/npm/@floating-ui/dom@1.7.2/+esm';
 
const button = document.querySelector('#button');
const tooltip = document.querySelector('#tooltip');
 
computePosition(button, tooltip, {
  placement: 'top',
  middleware: [flip(), shift()],
}).then(({x, y}) => {
  Object.assign(tooltip.style, {
    left: `${x}px`,
    top: `${y}px`,
  });
});
My buttonMy tooltip with more content
Now, we can read all the text because the shift() middleware shifted the tooltip from its bottom centered placement until it was fully in view.

As you can see, the tooltip lies fully flush with the edge of the document boundary. To add some whitespace, or padding, the shift() middleware accepts an options object:

import {
  computePosition,
  flip,
  shift,
} from 'https://cdn.jsdelivr.net/npm/@floating-ui/dom@1.7.2/+esm';
 
const button = document.querySelector('#button');
const tooltip = document.querySelector('#tooltip');
 
computePosition(button, tooltip, {
  placement: 'top',
  middleware: [flip(), shift({padding: 5})],
}).then(({x, y}) => {
  Object.assign(tooltip.style, {
    left: `${x}px`,
    top: `${y}px`,
  });
});
My buttonMy tooltip with more content
Now there’s 5px of breathing room between the tooltip and the edge of the boundary.

Offset middleware
We probably also don’t want the tooltip to lie flush with the button element. For this, we have the offset() middleware:

import {
  computePosition,
  flip,
  shift,
  offset,
} from 'https://cdn.jsdelivr.net/npm/@floating-ui/dom@1.7.2/+esm';
 
const button = document.querySelector('#button');
const tooltip = document.querySelector('#tooltip');
 
computePosition(button, tooltip, {
  placement: 'top',
  middleware: [offset(6), flip(), shift({padding: 5})],
}).then(({x, y}) => {
  Object.assign(tooltip.style, {
    left: `${x}px`,
    top: `${y}px`,
  });
});
This will displace the tooltip 6px from the reference element:

My buttonMy tooltip with more content
Note
Notice that we put offset() at the start of the array, rather than at the end? Middleware behavior is dependent on order. Each middleware returns new coordinates which middleware later in the array will use. The offset() middleware is one that should be before most other ones, because they should modify their coordinates based on the offset ones.

Arrow middleware
Most tooltips have an arrow (or triangle / caret) which points toward the button. For this, we have the arrow() middleware, but we first need to add a new element inside of our tooltip:

<div id="tooltip" role="tooltip">
  My tooltip with more content
  <div id="arrow"></div>
</div>
Then style it:

#arrow {
  position: absolute;
  background: #222;
  width: 8px;
  height: 8px;
  transform: rotate(45deg);
}
Then pass the arrow element into the arrow() middleware:

import {
  computePosition,
  flip,
  shift,
  offset,
  arrow,
} from 'https://cdn.jsdelivr.net/npm/@floating-ui/dom@1.7.2/+esm';
 
const button = document.querySelector('#button');
const tooltip = document.querySelector('#tooltip');
const arrowElement = document.querySelector('#arrow');
 
computePosition(button, tooltip, {
  placement: 'top',
  middleware: [
    offset(6),
    flip(),
    shift({padding: 5}),
    arrow({element: arrowElement}),
  ],
}).then(({x, y}) => {
  Object.assign(tooltip.style, {
    left: `${x}px`,
    top: `${y}px`,
  });
});
Now we need to add dynamic styles to the arrow element. Unlike other middleware, the arrow() middleware doesn’t modify the main x and y coordinates. Instead, it provides data for us to use. We can access this piece of information provided via middlewareData.

This contains an arrow object, referring to the name of the arrow() middleware we used:

computePosition(button, tooltip, {
  placement: 'top',
  middleware: [
    offset(6),
    flip(),
    shift({padding: 5}),
    arrow({element: arrowElement}),
  ],
}).then(({x, y, placement, middlewareData}) => {
  Object.assign(tooltip.style, {
    left: `${x}px`,
    top: `${y}px`,
  });
 
  // Accessing the data
  const {x: arrowX, y: arrowY} = middlewareData.arrow;
});
We now want to use this data to apply the styles.

computePosition(button, tooltip, {
  placement: 'top',
  middleware: [
    offset(6),
    flip(),
    shift({padding: 5}),
    arrow({element: arrowElement}),
  ],
}).then(({x, y, placement, middlewareData}) => {
  Object.assign(tooltip.style, {
    left: `${x}px`,
    top: `${y}px`,
  });
 
  // Accessing the data
  const {x: arrowX, y: arrowY} = middlewareData.arrow;
 
  const staticSide = {
    top: 'bottom',
    right: 'left',
    bottom: 'top',
    left: 'right',
  }[placement.split('-')[0]];
 
  Object.assign(arrowElement.style, {
    left: arrowX != null ? `${arrowX}px` : '',
    top: arrowY != null ? `${arrowY}px` : '',
    right: '',
    bottom: '',
    [staticSide]: '-4px',
  });
});
The styles above will handle the arrow’s position for all placements.

x is the x-axis offset, only existing if the placement is vertical ('top' or 'bottom').
y is the y-axis offset, only existing if the placement is horizontal ('right' or 'left').
staticSide depends on the placement that gets chosen. For instance, if the placement is 'bottom', then we want the arrow to be positioned 4px outside of the top of the tooltip (so we use a negative number).

The reason we use .split('-')[0] is to also handle aligned placements, like 'top-start' rather than only 'top'.

My buttonMy tooltip with more content
Functionality
Now that the tooltip has everything positioned, we can add user interactions that will show the tooltip when hovering or focusing the button.

#tooltip {
  display: none;
  width: max-content;
  position: absolute;
  top: 0;
  left: 0;
  background: #222;
  color: white;
  font-weight: bold;
  padding: 5px;
  border-radius: 4px;
  font-size: 90%;
}
function update() {
  computePosition(button, tooltip, {
    // ... options ...
  }).then(({x, y, placement, middlewareData}) => {
    // ... positioning logic ...
  });
}
 
function showTooltip() {
  tooltip.style.display = 'block';
  update();
}
 
function hideTooltip() {
  tooltip.style.display = '';
}
 
[
  ['mouseenter', showTooltip],
  ['mouseleave', hideTooltip],
  ['focus', showTooltip],
  ['blur', hideTooltip],
].forEach(([event, listener]) => {
  button.addEventListener(event, listener);
});
Try hovering or focusing the button:

My button
Misc
To keep the tooltip anchored to the button while scrolling or resizing, you’ll want to use the 
autoUpdate
 utility.

As for animations, this is up to you to explore when crafting your floating elements!

Complete
You’ve now created a basic accessible tooltip using Floating UI.