// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

/***
    |''Name''|sn3Wiki.js|
    |''Description''|Enables sn3Wiki syntax highlighting using CodeMirror|
    |''Author''|tito lino|
    |''Status''|''stable''|
***/

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
"use strict";

CodeMirror.defineMode("sn3Wiki", function () {
  // Tokenizer
  var textwords = {};
  
  var previousLineIsJava=0;
  
  var keywords = {
    "allTags": true, "closeAll": true, "list": true,
    "newJournal": true, "newTiddler": true,
    "permaview": true, "saveChanges": true,
    "search": true, "slider": true, "tabs": true,
    "tag": true, "tagging": true, "tags": true,
    "tiddler": true, "timeline": true,
    "today": true, "version": true, "option": true,
    "with": true, "filter": true
  };

  var isSpaceName = /[\w_\-]/i,
  	  isSpaceNameAndDot = /[\w_.:\=-}" <%>+]/i,
  	  isSpaceNameAndDotNoXml = /[\w_.:\=-}" %+]/i,
  	  isSpaceNameAndDotAndBR = /[\w_.\-^\r\n]/i,
      reHR = /^\-\-\-\-+$/,                                 // <hr>
      reWikiCommentStart = /^\/\*\*\*$/,            // /***
      reWikiCommentStop = /^\*\*\*\/$/,             // ***/
      reBlockQuote = /^<<<$/,

      reJsCodeStart = /^\/\/\{\{\{$/,                       // //{{{ js block start
      reJsCodeStop = /^\/\/\}\}\}$/,                        // //}}} js stop
      reXmlCodeStart = /^<!--\{\{\{-->$/,           // xml block start
      reXmlCodeStop = /^<!--\}\}\}-->$/,            // xml stop

      reCodeBlockStart = /^\{\{\{$/,                        // {{{ TW text div block start
      reCodeBlockStop = /^\}\}\}$/,                 // }}} TW text stop

      reUntilCodeStop = /.*?\}\}\}/;

  function chain(stream, state, f) {
    state.tokenize = f;
    return f(stream, state);
  }

  function tokenBase(stream, state) {
    var sol = stream.sol(), ch = stream.peek();

    state.block = false;        // indicates the start of a code block.

    

    
    
    // check start of  blocks
    if (sol && /[<\/\*{}\-]/.test(ch)) {
      if (stream.match(reCodeBlockStart)) {
        state.block = true;
        return chain(stream, state, twTokenCode);
      }
      if (stream.match(reBlockQuote))
      {
        return 'quote';
      }
      if (stream.match(reWikiCommentStart) || stream.match(reWikiCommentStop))
      {    	  
        return 'comment';
      }
      if (stream.match(reJsCodeStart) || stream.match(reJsCodeStop) || stream.match(reXmlCodeStart) || stream.match(reXmlCodeStop))
      {
        return 'comment';
      }
      if (stream.match(reHR))
      {   	  
        return 'hr';
      }
    }

    stream.next();
    
    

    

    
  
        
    
    if (    
    	((stream.string.trim().toLowerCase().indexOf("where ")!=-1) ||
    		((stream.string.trim().indexOf("AND ")!=-1) && ((stream.string.trim().indexOf("=")!=-1) || (stream.string.trim().indexOf(">")!=-1) | (stream.string.trim().indexOf("<")!=-1))) ||
    		((stream.string.trim().indexOf("OR ")!=-1) && ((stream.string.trim().indexOf("=")!=-1) || (stream.string.trim().indexOf(">")!=-1) | (stream.string.trim().indexOf("<")!=-1))) ||
    		(stream.string.trim().toLowerCase().indexOf("order by ")!=-1) ||
    		(stream.string.trim().toLowerCase().indexOf("group by ")!=-1) ||
    		(stream.string.trim().toLowerCase().indexOf("inner join ")!=-1)
    	) &&
    	(stream.string.trim().toLowerCase().indexOf("the ")==-1) &&
    	(!stream.string.match(/( de | of | la | at | y  )/))
    	)
    {    // check for SQL
        //  stream.eatWhile(isSpaceName);
          return "string-2";
     } 
    
	  if (stream.string.indexOf(" DEBUG [")!=-1)
    	  return "header";
	  if (stream.string.trim().startsWith("[DEBUG]"))
    	  return "header";
	  
	  if (stream.string.indexOf(" INFO [")!=-1)
    	  return "header";
	  if (stream.string.trim().startsWith("[INFO]"))
    	  return "header";
	  
	  if (stream.string.indexOf(" WARN [")!=-1)
    	  return "header";
	  if (stream.string.trim().startsWith("[WARN]"))
    	  return "header";	  	  
	  if (stream.string.trim().startsWith("[WARNING]"))
    	  return "header";	  	  	  
    
	  if (stream.string.indexOf(" ERROR [")!=-1)
    	  return "error";	  
	  if (stream.string.trim().startsWith("[ERROR]"))
    	  return "error";	 	  
    	  
    
    if ((stream.string.indexOf("ebContainer :")!=-1) || (stream.string.indexOf("SystemOut")!=-1)) {    // check for banksphere traces
        //  stream.eatWhile(isSpaceName);
          return "header";
        }     

    if (stream.string.indexOf("SystemErr")!=-1) {    // check for banksphere traces
        //  stream.eatWhile(isSpaceName);
          return "error";
        }    
    
    
    if (previousLineIsJava == 2)
    {
    	stream.eatWhile(isSpaceNameAndDot);
    	 previousLineIsJava=0;
    	 
      	 if ( (stream.string.toLowerCase().endsWith(";")) ||
    			 (stream.string.toLowerCase().endsWith("%>")) ||
    			 (stream.string.toLowerCase().endsWith("/html>"))
    	    )
      		 return "number"; 
    }
    if (previousLineIsJava == 1)
    {
    	 if ( (stream.string.toLowerCase().endsWith(";")) ||
    			 (stream.string.toLowerCase().endsWith("%>")) ||
    			 (stream.string.toLowerCase().endsWith("</html>"))
    	    )
    	 {
    		 previousLineIsJava=2;
    	 }
    	 stream.eatWhile(isSpaceNameAndDot);
    	 return "number"; 
    }
    
    if (
    	(stream.string.toLowerCase().trimLeft().startsWith("var ")) ||
    	(stream.string.toLowerCase().trimLeft().startsWith("<html")) ||
    	(stream.string.toLowerCase().trimLeft().startsWith("<bhtc")) ||
    	(stream.string.toLowerCase().trimLeft().startsWith("</bhtc")) ||
    	(stream.string.toLowerCase().trimLeft().startsWith("string ")) ||
    	(stream.string.toLowerCase().trim().indexOf("<string>")!=-1) ||
    	((stream.string.toLowerCase().trimLeft().startsWith("if ")) && (stream.string.toLowerCase().indexOf(",")==-1) && (stream.string.toLowerCase().indexOf("the ")==-1)) ||
    	(stream.string.toLowerCase().indexOf("if(")!=-1 ) ||
    	(stream.string.toLowerCase().trimLeft().startsWith("try ")) ||
    	(stream.string.toLowerCase().trimLeft().startsWith("import ")) ||
    	(stream.string.toLowerCase().trimLeft().startsWith("try{")) ||
    	(stream.string.toLowerCase().trimLeft().startsWith("} catch")) ||
    	(stream.string.toLowerCase().trimLeft().startsWith("}catch")) ||    	
    	((stream.string.toLowerCase().indexOf("cookie.")!=-1 ) && (stream.string.toLowerCase().indexOf(" y ")==-1 )) ||
    	((stream.string.toLowerCase().indexOf("response.")!=-1 ) && (stream.string.toLowerCase().indexOf(".java")==-1 )) ||
    	(stream.string.toLowerCase().indexOf("request.")!=-1 ) ||
    	(stream.string.toLowerCase().indexOf("if (")!=-1 ) ||
    	(stream.string.toLowerCase().indexOf(".next()")!=-1 ) ||
    	(stream.string.toLowerCase().indexOf(".initdata(")!=-1 ) ||
    	(stream.string.toLowerCase().indexOf(".concat")!=-1 ) ||
    	(stream.string.toLowerCase().indexOf("break;")!=-1 ) ||
        (stream.string.toLowerCase().trimLeft().startsWith("else ")) ||
        (stream.string.toLowerCase().indexOf("else{")!=-1) ||
        (stream.string.toLowerCase().indexOf("else {")!=-1) ||
        (stream.string.toLowerCase().trim() == "else") ||
        (stream.string.toLowerCase().trimLeft().startsWith("while ")) ||
        (stream.string.toLowerCase().trimLeft().startsWith("getlogger ")) ||
        (stream.string.toLowerCase().trimLeft().startsWith("while(")) ||
        (stream.string.toLowerCase().trimLeft().startsWith("for ")) ||
        (stream.string.toLowerCase().trimLeft().startsWith("for(")) ||
        ((stream.string.toLowerCase().trimLeft().startsWith("case ")) && (stream.string.toLowerCase().indexOf(";")!=-1)) ||
        ((stream.string.toLowerCase().trimLeft().startsWith("return ")) && (stream.string.toLowerCase().indexOf("the ")==-1)) ||
        (stream.string.toLowerCase().trimLeft().startsWith("throw ")) ||
        (stream.string.toLowerCase().trimLeft().startsWith("public ")) ||        	
        (stream.string.toLowerCase().trimLeft().startsWith("char ")) ||
        (stream.string.toLowerCase().trimLeft().startsWith("logger.")) ||
        (stream.string.toLowerCase().indexOf(".append")!=-1) ||
        (stream.string.toLowerCase().indexOf("settimeout(")!=-1) ||
        (stream.string.toLowerCase().trimLeft().startsWith("private ")) ||
        (stream.string.toLowerCase().trimLeft().startsWith("throws ")) ||
        (stream.string.toLowerCase().trim() == '{') ||
        (stream.string.toLowerCase().trim()== '}') ||
        (stream.string.toLowerCase().trimLeft().startsWith("int ")) ||
        (stream.string.toLowerCase().trimLeft().startsWith("<%")) ||
        (stream.string.toLowerCase().trimLeft().endsWith("%>")) ||
        ((stream.string.toLowerCase().indexOf("=")!=-1 ) && (stream.string.toLowerCase().endsWith(";")) && (!stream.string.toLowerCase().endsWith(">;"))) ||
        ((stream.string.toLowerCase().indexOf("[")!=-1 ) && (stream.string.toLowerCase().endsWith(";"))) 
       ) 
       {    // check for java code
    	stream.eatWhile(isSpaceNameAndDot);
   	 if ( (!stream.string.toLowerCase().endsWith(";")) &&
			 (!stream.string.toLowerCase().endsWith("%>")) &&
			 (!stream.string.toLowerCase().endsWith("</html>"))
	    )
    		  previousLineIsJava=1;
          return "number";  
       }    
    
    if ((stream.string.trim().startsWith("<")) && (!stream.string.trim().startsWith("<%"))) {    // check for xml
        stream.eatWhile(isSpaceName);
        return "string-2";
   }    
    

    
    
    if  (stream.string.toLowerCase().trimLeft().startsWith("document.get"))
    	 return "number";

    
    if (((stream.string.trim().indexOf("{")!=-1) ||
        	(stream.string.trim().indexOf("}")!=-1)) &&
        	(stream.string.trim().indexOf("\"")!=-1) &&
        	(stream.string.trim().indexOf(":")!=-1)
        	)	
        {    // check for json
        	
            //  stream.eatWhile(isSpaceName);
              return "string-2";
         }    
    
    if (
        	((stream.string.match(/:/g) || []).length>2) &&
            ((stream.string.match(/\"/g) || []).length>2)
            )        		
            {    // check for json
                  stream.eatWhile("p");
                  return "string-2";
             }      
    
    
    if (sol && /[\/\*!#;:>|]/.test(ch)) {
      if (ch == "!") { // tw header
        stream.skipToEnd();
        return "header";
      }
      if (ch == "*") { // tw list
        stream.eatWhile('*');
        return "comment";
      }
      if (ch == "#") { // tw numbered list
        stream.eatWhile('#');
        return "comment";
      }
      if (ch == ";") { // definition list, term
        stream.eatWhile(';');
        return "comment";
      }
      if (ch == ":") { // definition list, description
        stream.eatWhile(':');
        return "comment";
      }
      if (ch == ">") { // single line quote
        stream.eatWhile(">");
        return "quote";
      }
      if (ch == '|')
        return 'header';
    }

    if (ch == '{' && stream.match(/\{\{/))
      return chain(stream, state, twTokenCode);
    
    if (ch == 'S' && stream.match(/\E\L\E\C\T/)  && !stream.string.match(/( de | of | la | at | y | if | the )/))
        return chain(stream, state, twTokenCode);
    
    if (ch == 's' && stream.match(/elect\ /) && !stream.string.match(/( de | of | la | at | y | if | the   )/))
        return chain(stream, state, twTokenCode);    
    

    // rudimentary html:// file:// link matching. TW knows much more ...
    if (/[hf]/i.test(ch) &&
        /[ti]/i.test(stream.peek()) &&
        stream.match(/\b(ttps?|tp|ile):\/\/[\-A-Z0-9+&@#\/%?=~_|$!:,.;]*[A-Z0-9+&@#\/%=~_|$]/i))
    {
      return "link";
    }
    
    if (ch == '(' &&
            stream.match(/\b(https?|ftp|file):\/\/[\-A-Z0-9+&@#\/%?=~_|$!:,. ;]*[A-Z0-9+&@#\/%=~_|$]/i))
        {
          return "link";
        }    
    
    if (ch == '~')    // _no_ CamelCase indicator should be bold
      return 'brace';

    if (/[\[\]]/.test(ch) && stream.match(ch)) // check for [[..]]
      return 'brace';

    //if ((/[A-Za-z]/.test(ch)) && (stream.match(/[\.-A-Za-z0-9_+]*\@/))) 
    if ((/[A-Za-z/]/.test(ch)) && (stream.match(/^\w+([\.-]?\ w+)*@\w+([\.-]?\ w+)*(\.)*/)))
    {
      stream.eatWhile(isSpaceName);
      return "link";
    }
    
 
    
    if (stream.match(/^\d{3}-.+$/)) {    // check for banksphere traces
        //  stream.eatWhile(isSpaceName);
    	  if (stream.string.indexOf("ERROR")!=-1)
    	  return "error";
    	  else
          return "header";
        } 
    
    if (stream.string.trim().startsWith("at net.") || stream.string.trim().startsWith("net.")) {    // check for stacktraces
        //  stream.eatWhile(isSpaceName);
          return "comment";
     }
    if (stream.string.trim().startsWith("at sun.") || stream.string.trim().startsWith("sun.")) {    // check for stacktraces
        //  stream.eatWhile(isSpaceName);
          return "comment";
     }    
    if (stream.string.trim().startsWith("at com.") || stream.string.trim().startsWith("com.")) {    // check for stacktraces
        //  stream.eatWhile(isSpaceName);
          return "comment";
     }
    if (stream.string.trim().startsWith("at org.") || stream.string.trim().startsWith("org.")) {    // check for stacktraces
        //  stream.eatWhile(isSpaceName);
          return "comment";
     }
    if (stream.string.trim().startsWith("at java.") || stream.string.trim().startsWith("java.")) {    // check for stacktraces
        //  stream.eatWhile(isSpaceName);
          return "comment";
     }    
    if (stream.string.trim().startsWith("at javax.") || stream.string.trim().startsWith("javax.")) {    // check for stacktraces
        //  stream.eatWhile(isSpaceName);
          return "comment";
     }  
    if (stream.string.trim().startsWith("at es.") || stream.string.trim().startsWith("es.")) {    // check for stacktraces
        //  stream.eatWhile(isSpaceName);
          return "comment";
     } 
    if (stream.string.trim().startsWith("at HTTPClient.") || stream.string.trim().startsWith("HTTPClient.")) {    // check for stacktraces
        //  stream.eatWhile(isSpaceName);
          return "comment";
     }     
    if (stream.string.trim().startsWith("Caused by:"))  {    // check for stacktraces
        //  stream.eatWhile(isSpaceName);
          return "comment";
     }    
    if (stream.string.trim().startsWith("Exception:"))  {    // check for stacktraces
        //  stream.eatWhile(isSpaceName);
          return "comment";
     }
    if (stream.string.trim().indexOf("Previous exception")!=-1)  {    // check for stacktraces
        //  stream.eatWhile(isSpaceName);
          return "string";
     }      
        
    
    if (ch == 'H' && stream.match(/\D\d{10}/))  //remedy
    {
        stream.eatWhile(isSpaceName);
        return "stringhd";
     }   
    
    if (ch == 'H' && stream.match(/F_[\-A-Za-z0-9_+.]*.jar/))  //hoffix
    {
       stream.eatWhile(isSpaceNameAndDot);
        return "string";
     }  
    
    if (ch == '(' && stream.match(/\H\D\d{10}/))  //remedy
    {
        stream.eatWhile(isSpaceName);
        return "string";
     }     
    if (ch == 'C' && stream.match(/\H\G/))  //remedy
    {
        stream.eatWhile(isSpaceName);
        return "string";
     }     
    if (ch == 'R' && stream.match(/\F\C/))  //remedy
    {
        stream.eatWhile(isSpaceName);
        return "string";
     }      
    
    if (ch == 'B' && stream.match(/\K\S\E/))  //errores bks
    {
        stream.eatWhile(isSpaceName);
        return "string";
     }      
    
    if (ch == 'U' && stream.match(/ser/))  //user pass
    {
        stream.eatWhile(isSpaceName);
        return "number";
     }       
        
    if (ch == 'P' && stream.match(/ass/)) //user pass
    {
        stream.eatWhile(isSpaceName);
        return "number";
     }       
    
    if (ch == 'U' && stream.match(/su/))  //user pass
    {
        stream.eatWhile(isSpaceName);
        return "number";
     }       
    
        
    if ((ch == '<') && stream.match(/[\-A-Za-z0-9_áéíóúÁÉÍÓÚñ:Ñ"=+%/ ]+>/))  //linea con xml <....>
    { 
    	// stream.eatWhile(isSpaceNameAndDotNoXml);
    	return "string-2";
    }
    
    
    if (ch == 'A' && stream.match(/\S\S\N/))  //jira
    {
        stream.eatWhile(isSpaceName);
        return "stringhd";
     }     
    
    if (ch == 'D' && stream.match(/\EVARCHSUP/))  //jira
    {
        stream.eatWhile(isSpaceName);
        return "stringhd";
     }       
    
    if (ch == '[' && stream.match(/[\-A-Za-z0-9_áéíóúÁÉÍÓÚñÑ+% ]+]/))  //[...]
    {
        return "keyword";
     }   

    
    if (ch == '"' && stream.match(/[\-A-Za-z0-9_áéíóúÁÉÍÓÚñÑ+% ]+"/))   //"..." 
    { 
        return "keyword";
     }       
        
//    if (ch == '\'' && stream.match(/.*\'/))  //'...'
//    {
//        return "keyword";
//     }     
    
    if (/[A-Z]/.test(ch) && stream.match(/[\-A-Z0-9_+]*\_\E\N\S/))  //ensamblado
    {
        stream.eatWhile(isSpaceName);
        return "strong";
     }     
    
    if (/[A-Z]/.test(ch) && stream.match(/[\-A-Z0-9_+]*\_\E\S\C\E/))  //ensamblado
    {
        stream.eatWhile(isSpaceName);
        return "strong";
     }   
    
    if (ch == 'V' && stream.match(/\D(D|I)[0-9]/))  //vdi
    {
        stream.eatWhile(isSpaceName);
        return "strong";
     }       
        
    if (stream.match(/[\-A-Za-z0-9_+]*\.[\-A-Za-z0-9_+]{2,}\.[\-A-Za-z0-9_+]{2,}\.[\-A-Za-z0-9._=+]{2,}/))  //ips, servers...
    {
        stream.eatWhile(isSpaceName);
        return "strong";
     }       
    
    if (stream.match(/[\-A-Za-z0-9_+]*\/[\-A-Za-z0-9_+]+\/[\-A-Za-z0-9_+]+\/[\/\-A-Za-z0-9"'._=+]*/))  //paths
    {
        stream.eatWhile(isSpaceName);
        return "strong";
     }       


//    if ((ch == "/") && (stream.string.indexOf("http:/")==-1) && (stream.string.indexOf("https:/")==-1)){ // tw invisible comment
//      if (stream.eat("%")) {
//        return chain(stream, state, twTokenComment);
//      } else if (stream.eat("/")) { //
//        return chain(stream, state, twTokenEm);
//      }
//    }

    if (ch == "_" && stream.eat("_")) // tw underline
        return chain(stream, state, twTokenUnderline);

    // strikethrough and mdash handling
//    if (ch == "-" && stream.eat("-")) {
//      // if strikethrough looks ugly, change CSS.
//      if (stream.peek() != ' ')
//        return chain(stream, state, twTokenStrike);
//      // mdash
//      if (stream.peek() == ' ')
//        return 'brace';
//    }

    if (ch == "'" && stream.eat("'")) // tw bold
      return chain(stream, state, twTokenStrong);

    if (ch == "<" && stream.eat("<")) // tw macro
      return chain(stream, state, twTokenMacro);

    // core macro handling
    stream.eatWhile(/[\w\$_]/);
    return textwords.propertyIsEnumerable(stream.current()) ? "keyword" : null
  }

  // tw invisible comment
  function twTokenComment(stream, state) {
    var maybeEnd = false, ch;
    while (ch = stream.next()) {
      if (ch == "/" && maybeEnd) {
        state.tokenize = tokenBase;
        break;
      }
      maybeEnd = (ch == "%");
    }
    return "comment";
  }

  // tw strong / bold
  function twTokenStrong(stream, state) {
    var maybeEnd = false,
    ch;
    while (ch = stream.next()) {
      if (ch == "'" && maybeEnd) {
        state.tokenize = tokenBase;
        break;
      }
      maybeEnd = (ch == "'");
    }
    return "strong";
  }

  // tw code
  function twTokenCode(stream, state) {
    var sb = state.block;

    if (sb && stream.current()) {
      return "string-2";
    }

    if (!sb && stream.match(reUntilCodeStop)) {
      state.tokenize = tokenBase;
      return "string-2";
    }

    if (sb && stream.sol() && stream.match(reCodeBlockStop)) {
      state.tokenize = tokenBase;
      return "string-2";
    }
    
    if (!sb && stream.match(/.*?W\H\E\R\E\ /)) {
        state.tokenize = tokenBase;
        return "string-2";
      }    
    
    if (!sb && stream.match(/.*?where\ /)) {
        state.tokenize = tokenBase;
        return "string-2";
      }        
     

    stream.next();
    return "string-2";
  }

  // tw em / italic
  function twTokenEm(stream, state) {
    var maybeEnd = false,
    ch;
    while (ch = stream.next()) {
      if (ch == "/" && maybeEnd) {
        state.tokenize = tokenBase;
        break;
      }
      maybeEnd = (ch == "/");
    }
    return "em";
  }

  // tw underlined text
  function twTokenUnderline(stream, state) {
    var maybeEnd = false,
    ch;
    while (ch = stream.next()) {
      if (ch == "_" && maybeEnd) {
        state.tokenize = tokenBase;
        break;
      }
      maybeEnd = (ch == "_");
    }
    return "underlined";
  }

  // tw strike through text looks ugly
  // change CSS if needed
  function twTokenStrike(stream, state) {
    var maybeEnd = false, ch;

    while (ch = stream.next()) {
      if (ch == "-" && maybeEnd) {
        state.tokenize = tokenBase;
        break;
      }
      maybeEnd = (ch == "-");
    }
    return "strikethrough";
  }

  // macro
  function twTokenMacro(stream, state) {
    if (stream.current() == '<<') {
      return 'macro';
    }

    var ch = stream.next();
    if (!ch) {
      state.tokenize = tokenBase;
      return null;
    }
    if (ch == ">") {
      if (stream.peek() == '>') {
        stream.next();
        state.tokenize = tokenBase;
        return "macro";
      }
    }

    stream.eatWhile(/[\w\$_]/);
    return keywords.propertyIsEnumerable(stream.current()) ? "keyword" : null
  }

  // Interface
  return {
    startState: function () {
      return {tokenize: tokenBase};
    },

    token: function (stream, state) {
      if (stream.eatSpace()) return null;
      var style = state.tokenize(stream, state);
      return style;
    }
  };
});

CodeMirror.defineMIME("text/x-sn3Wiki", "sn3Wiki");
});
