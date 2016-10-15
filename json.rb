# convert traditional format to json objects
# usage: ruby json.rb

require 'json'

Encoding.default_external = Encoding::UTF_8

def get file
  raw = `cat #{file} | ./a.out`
  Hash[raw.split(/<<<<gs>>>>/).each_slice(2).to_a]
rescue
  {}
end

Dir.glob('wiki.wdb/*') do |file|
  File.open(file.gsub(/wiki.wdb/, 'static/pages'),'w') do |output|
    output.puts JSON.pretty_generate(get(file))
  end
  print '.'
end