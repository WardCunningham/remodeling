# check all remaining pages with trouble
# sh check.sh; ls -lSr invalid

cat pages/* | \
  jq -r 'select(.trouble)|.page' | \
  while read i; do
    cat trouble/$i | perl check.pl | ruby check.rb > invalid/$i
  done