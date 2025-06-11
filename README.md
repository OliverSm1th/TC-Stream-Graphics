# A collection of HTML graphical elements for live streams

These have been tested to work with [H2RGraphics](https://h2r.graphics/) using the Custom HTML component

## Getting Started

Look through some of the previous examples. One good example is `bmc/logo` which has a good structure + comments.  
Use the template to get started. Begin with creating a static html version of the graphic + then animate it using Javascript

## Building an element

In order to use the element (for H2R graphics), you need to build it into a single HTML file:

```bash
npm install   # Install build dependencies
npm run build --file=[folderName]
# Adding parameters:
npm run build --file=[folderName] -- [params]
```

_Some elements require specific build parameters - check the `html` file_

## Running the server

You can also see the elements locally by starting up a http server

1. Install dev dependencies: `npm install -D`
2. Start the server: `npm run server`
3. Ensure the `dev.js` script is uncommented in the `html` files for the graphics you want to see
4. Go to the `html` file in the server and add `&debug=true` to the path to bring up a the debug menu
5. Click "Play" to see the graphic running
6. Tailwind watch `npm run watch:tail --file=wsaf/wpaint/`
