// Encode links.txt into links.json compainion to docs/names.txt
// Usage: deno run --allow-read encode-links.js >docs/inlinks.json

let names = Deno.readTextFileSync('docs/names.txt').split(/\r?\n/)
let outbounds = Deno.readTextFileSync('links.txt').split(/\r?\n/)

let inbounds = {}
for (let outbound of outbounds) {
  let [key, ...links] = outbound.split(' ')
  let index = names.indexOf(key)
  if (index < 0) {console.log('missing',key); continue}
  for (let link of links) {
    let inbound = inbounds[link] ||= []
    inbound.push(index)
  }
}
console.log(JSON.stringify(names.map(name => inbounds[name]||[])))