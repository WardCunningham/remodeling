# publish workspace changes to public remodel testbed
# usage: sh sync.sh

rsync -az static/ c2.com:web/wiki/remodel/
