// Construct a roster listing indexed sites
// usage: deno run --allow-read=docs c2-fed-roster.js > docs/c2-fed-roster.json

const sleep = msec => new Promise(res => setTimeout(res,msec))
const asSlug = (title) => title.replace(/\s/g, '-').replace(/[^A-Za-z0-9-]/g, '').toLowerCase()

// let index = {
//   last: 'Sat-1400',
//   sites: [],
//   slugs: [],
//   titles: [],
//   md5ws: [],
//   pages: [],
//   rows:[]
// }

let index = JSON.parse(Deno.readTextFileSync(`docs/c2-fed-index.json`))
let title = `C2 Fed Roster`
let story = [
  {type:'paragraph',text:`Sites with wiki.c2.com excerpts found ${index.last}.`,id:'84823980980282'},
  {type:'roster',text:index.sites.join("\n"),id:'23984712394812'}
]
let journal = [
  {type:'create',date:Date.now(),item:JSON.parse(JSON.stringify({title,story}))}
]
console.log(JSON.stringify({title,story,journal},null,2))