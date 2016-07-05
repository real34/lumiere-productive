var Luxafor = require("luxafor")();

console.log('starting ...')
var color = process.argv[2]

if (!color || !Luxafor.colors.hasOwnProperty(color)) {
  console.error('Color "' + color + '" not available')
  console.log('Available colors: ', Object.keys(Luxafor.colors).join(', '))
  return
}

Luxafor.init(function () {
  console.log('... initialized')
  Luxafor.setLuxaforColor(Luxafor.colors[color], function () {
    console.log('... color changed')
    Luxafor.flashColor(128, 64, 128, function () {
      console.log('Enjoy!')
    });
  });
});
