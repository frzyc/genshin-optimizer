import loadImages from './lib/loadImages'
import loadValues from './lib/loadValues'
import loadFormulas from './lib/loadFormulas'

console.log("Running Pipeline to generate files using dm.")
loadImages();
loadValues();
loadFormulas();
