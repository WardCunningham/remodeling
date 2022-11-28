# see if ruby will complain reading input
# usage: cat file | perl check.rb | ruby check.rb

Encoding.default_external = Encoding::UTF_8
i = 0
while x = $stdin.gets
  begin
    i += 1
    x.scan(/e/)
  rescue Exception => e
    puts "#{i} #{x}"
  end
end