  export {configure, markup}

  var names

  function configure (options) {
    names = options.names
  }

  function escape (text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }
  function emphasis (text) {
    return text
      .replace(/'''(.*?)'''/g, '<strong>$1<\/strong>')
      .replace(/''(.*?)''/g, '<em>$1<\/em>')
      .replace(/^-----*/, '<hr>')
  }

  var code = ''
  var codes = []
  function enter(key, replacement) {
    // $code = $key;
    // while (@code > $depth) {local($_) = pop @code; print "</$_>\n"}
    // while (@code < $depth) {push (@code, $key); print "<$key>\n"}
    // if ($code[$#code] ne $key) {
    //   print "</$code[$#code]><$key>\n";
    //   $code[$#code] = $key;
    // }
    return function (match, p1, p2) {
      var depth = p1.length || 0
      var adjust = ''
      code = key
      if (code != '...') {
        while (codes.length > depth) { adjust += "</" + codes.pop() + ">" }
        while (codes.length < depth) { adjust += "<" + key + ">"; codes.push(key) }
        if (codes.length && codes[codes.length-1] != key) {
          adjust += "</" + codes[codes.length-1] + "><" + key + ">"
          codes[codes.length-1] = key
        }
      }
      return adjust + replacement.replace(/{p1}/, p1).replace(/{p2}/, p2)
    }
  }
  function complete (text) {
    return enter("", "")("","","") + text
  }
  function bullets (text) {
    // $code = "";
    // s/^\s*$/<p><\/p>/                && ($code = '...');
    // s/^(\t+)(.+):\t/<dt>$2<dd>/      && &enter('DL', length $1);
    // s/^(\t+)\*/<li>/                 && &enter('UL', length $1);
    // s/^(\*+)/<li>/                   && &enter('UL', length $1);
    // s/^(\t+)\d+\.?/<li>/             && &enter('OL', length $1);
    // /^\s/                            && &enter('PRE', 1);
    code = ''
    let result = text
      .replace(/^\s*$/,                 enter('...', '<p></p>' ) )
      .replace(/^(\t+)(.+):\t/,         enter('DL',  '<dt>{p2}<dd>') )
      .replace(/^(\t+)\*/,              enter('UL',  '<li>') )
      .replace(/^(\*+)/,                enter('UL',  '<li>') )
      .replace(/^(\t+)\d+\.?/,          enter('OL',  '<li>') )
      .replace(/^(\s)/,                 enter('PRE', '{p1}') )
    return result
  }
  function links (text, sanitize) {
    // link conversion happens in four phases:
    //   unexpected markers are adulterated
    //   links are found, converted, and stashed away properly escaped
    //   remaining text is processed and escaped
    //   unique markers are replaced with unstashed links
    var stashed = []
    function stash (text) {
      var here = stashed.length
      stashed.push(text)
      return "〖" + here + "〗"
    }
    function unstash (match, digits) {
      return stashed[+digits]
    }
    function internal (title) {
      if (names && names.indexOf(title)!=-1) {
        var url = location.origin + location.pathname + "?" + title
        return stash("<a href=\""  + url + "\">" + title + "</a>")
      } else {
        return title
      }
    }
    function external (url) {
      if (url.match(/\.(gif|jpg|jpeg|png)$/)) {
        return stash("<img src=\"" + url.replace(/^https:\/wiki\//,'https://c2.com/wiki/') + "\">")
      } else {
        return stash("<a href=\"" + url + "\" rel=\"nofollow\" target=\"_blank\">" + url + "</a>")
      }
    }
    function youtube (match, p1, p2) {
      var embed =
        "<object width=\"425\" height=\"344\">" +
        "<param name=\"movie\" value=\"https://www.youtube.com/v/$2&hl=en&fs=1&\"></param>" +
        "<param name=\"allowFullScreen\" value=\"true\"></param>" +
        "<param name=\"allowscriptaccess\" value=\"always\"></param>" +
        "<embed src=\"https://www.youtube.com/v/" + p2 + "&hl=en&fs=1&\" type=\"application/x-shockwave-flash\" allowscriptaccess=\"always\" allowfullscreen=\"true\" width=\"425\" height=\"344\"></embed>" +
        "</object>"
      return stash(embed)
    }
    function isbn (match, isbn) {
      var code = isbn.replace(/[- ]/g, "")
      if (code.match(/^\d{9}.$/)) {
        return "ISBN " + isbn
      } else {
        return "ISBN " + isbn
      }
    }
    function titlesearch () {
      function link(text) {
        return "<a href=?" + text + ">" + text + "</a>"
      }
      window.get = function() {
        var want = search.value
        if (want.length > 1) {
          var found = names.filter(function (e) { return e.includes(want) })
          if (found.length) {
            return window.searchresult.innerHTML = found.slice(0,500).map(link).join('<br>')
          }
        }
        window.searchresult.innerHTML = ''
      }
      window.got = function (e) {
        if (!e) e = window.event;
        if ((e.keyCode || e.which) == '13') {
          search.value = ''
          window.searchresult.innerHTML = ''
        }
      }
      return stash("<input type=text id=search onInput='get()' onKeyPress='got()'><br><div id=searchresult></div>")
    }
    function fullsearch () {
      return stash("<form action=\"https://proxy.c2.com/cgi/fullSearch\"><input type=text name=search></form>")
    }
    var prepass = text
      .replace(/〖(\d+)〗/g, '〖 $1 〗')
      .replace(/^https:\/\/(www.)?youtube.com\/watch\?v=([-\w]+)/, youtube)
      .replace(/\[Search\]/, titlesearch)
      .replace(/\[Fullsearch\]/, fullsearch)
      .replace(/\[?ISBN:? *([0-9- xX]{10,})\]?/i, isbn)
      .replace(/\b(https?|ftp|mailto|file|telnet|news):[^\s<>\[\]"'\(\)]*[^\s<>\[\]"'\(\)\,\.\?]/g,external)
      .replace(/\b[A-Z][a-z]+([A-Z][a-z]+)+\b/g, internal)
    var postpass = sanitize(prepass)
      .replace(/〖(\d+)〗/g, unstash)
    if (code == '') {
      postpass = complete(postpass)
    }
    return postpass
  }
  function inner (text) {
    text = escape(text)
    text = bullets(text)
    text = emphasis(text)
    return text
  }
  function render (text) {
    return links(text, inner)
  }
  function markup (text) {
    var lines = text.replace(/\\\n/,' ').split(/\n/)
    var expand = lines.map(render).join("\n")
    return expand + complete('')
  }