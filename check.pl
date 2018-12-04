# remove separators before checking for other invalid characters
# usage: cat file perl check.pl | ruby check.rb

my $SEP = "\263";
$_ = join('', <STDIN>);
s/\o{347}/c/g;
s/\o{222}/'/g;
print join('<<<<gs>>>>',split($SEP, $_));
