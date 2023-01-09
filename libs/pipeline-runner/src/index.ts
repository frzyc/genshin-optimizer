import loadImages from './lib/loadImages'
import loadTrans from './lib/loadTrans'
import loadValues from './lib/loadValues'

console.log("Running Pipeline to generate files using dm.")
loadImages();
loadTrans();
loadValues();
