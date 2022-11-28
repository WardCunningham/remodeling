# convert traditional format to json objects
# usage: ruby json.rb

require 'json'

Encoding.default_external = Encoding::UTF_8

@text = @copy = @trouble = 0

def sep text
  Hash[text.split(/<<<<gs>>>>/).each_slice(2).to_a]
end

def get page
  it = sep `cat trouble/#{page} | perl json.pl date text rev`
  print '.'
  @text += 1
  {date:it['date'], text:it['text'], rev:it['rev'], page:page}
rescue Exception => e
  begin
    it = sep `cat trouble/#{page} | perl json.pl date copy rev`
    raise 'missing' if it['copy'].empty?
    print ','
    @copy += 1
    {date:it['date'], text:it['copy'], rev:it['rev'], page:page, copy: true}
  rescue Exception => e
    print 'x'
    @trouble += 1
    {page:page, trouble:true}
  end
end

Dir.glob('trouble/*') do |file|
  page = file.gsub(/trouble\//, '')
  File.open("pages/#{page}",'w') do |output|
    output.puts JSON.pretty_generate(get(page))
  end
end

puts
puts "#{@text} text ok"
puts "#{@copy} copy ok"
puts "#{@trouble} with trouble"
