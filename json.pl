# extract specific fields from legacy wiki format files
# usage: cat PageName | perl json.pl date rev text

my $SEP = "\263";
$_ = join('', <STDIN>);
s/\o{347}/c/g;
s/\o{222}/'/g;
%fields = split $SEP, $_;
@selected = ();
for (@ARGV) {
  push @selected, $_;
  push @selected, $fields{$_};
}
print join '<<<<gs>>>>', @selected;