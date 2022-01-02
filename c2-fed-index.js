// Retrieve all changes for last week from scrape logs, index c2 wiki links
// usage: deno run --allow-net c2-fed-index.js > docs/c2-fed-index.json

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

let index = await fetch(`https://wiki.c2.com/c2-fed-index.json`).then(res => res.json())
let site = `http://search.fed.wiki.org:3030`
let list = await fetch(`${site}/logs`).then(res => res.text())
let logs = list.trim().split(/\n/).map(line => line.split('"')[1])
let seen = new Set()


for (let log of logs) {
  if(log.includes(index.last)) break
  console.error(new Date())
  let text = await fetch(`${site}${log}`).then(res => res.text())
  let who, what, match
  for (let line of text.split(/\n/)) {
    match = line.match(/^([\w.-]+), (\d+) pages$/)
    if (match) {who = match[1]}
    match = line.match(/^\t(.+?), (\d+) days ago$/)
    if (match) {
      what = match[1]
      if(!seen.has(who+what))
        // console.error(log,who,asSlug(what))
        await scan(log,who,what)
      seen.add(who+what)
    }
  }
  await sleep(500)
}

function num (column, value) {
  let col = index[column]
  let n = col.findIndex(val => val == value)
  if (n >= 0) return n
  col.push(value)
  return col.length-1
}

async function scan(log,who,what) {
  let items = await fetch(`${site}/sites/${who}/pages/${asSlug(what)}/items.txt`).then(res => res.text())
  let md5ws = items.split(/\n/).filter(item => /^[0-9a-f]{16}w$/.test(item))
  if (!md5ws.length) return
  console.error(log,who,what,md5ws)
  let siten = num('sites',who)
  let slugn = num('slugs',asSlug(what))
  let titlen = num('titles',what)
  let page = await fetch(`http://${who}/${asSlug(what)}.json`).then(res => res.json())
  for (let md5w of md5ws) {
    let item = page.story.find(item => item.id == md5w)
    let md5wn = num('md5ws',md5w)
    let pagen = num('pages',item.wiki)
    index.rows.push([siten,slugn,titlen,md5wn,pagen])
  }
  await sleep(500)
}

index.last = logs[0].split(/[\/\.]/)[2]
console.log(JSON.stringify(index,null,2))