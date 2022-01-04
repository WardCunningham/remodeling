# Update index and roster
# usage: git pull; sh c2-fed-update.sh

set -e
git pull
deno run --allow-net c2-fed-index.js > /tmp/c2-fed-index.json
mv /tmp/c2-fed-index.json docs
deno run --allow-read=docs c2-fed-roster.js > docs/c2-fed-roster.json
git add docs
git commit -m 'c2-fed index update'
git push