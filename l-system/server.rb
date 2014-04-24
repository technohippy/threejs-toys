require 'webrick'

s = WEBrick::HTTPServer.new(:Port => 10080, :DocumentRoot => Dir.pwd)
trap('INT') { s.shutdown }
s.start
