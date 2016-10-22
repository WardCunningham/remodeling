# update gh-pages from static subtree
# https://gist.github.com/cobyism/4730490
# usage: git push; sh sync-gh-pages.sh

git subtree push --prefix static origin gh-pages
