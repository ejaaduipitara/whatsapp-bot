const fs = require('fs');
const glob = require( 'glob' );

var language_dict = {};
const defaultLang = 'en';

const init = () => {
  console.log("loading lang files");
  glob.sync( './assets/language/*.json' ).forEach( function( file ) {
    console.log("loading lang files");
    
      let dash = file.split("/");
      if(dash.length == 3) {
          let dot = dash[2].split(".");
        if(dot.length == 2) {
          let lang = dot[0];
          fs.readFile(file, function(err, data) {
            // console.log(lang, JSON.parse(data.toString()));
            language_dict[lang] = JSON.parse(data.toString());
          });
        }
      }
    });
}

const getMessage = (language = defaultLang, botId, key) => {
  // console.log("⭆ getMessage: ", language, botId, key);
  let msg = botId ? language_dict[language][botId][key] : language_dict[language][key]
  let result
  if(msg) {
    result = JSON.parse(JSON.stringify(msg));
  } else {
    console.log(`❌ Object doesn't exist for ${language}.${botId}.${key}`);
  }
  // console.log("getMessage Output\n", msg);
  
  return result;
}

module.exports = {init, defaultLang, language_dict, getMessage}
