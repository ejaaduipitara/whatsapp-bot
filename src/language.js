const fs = require('fs');
const glob = require( 'glob' );

var language_dict = {};
const defaultLang = 'en';

const init = () => {
  glob.sync( 'assets/language/*.json' ).forEach( function( file ) {
      let dash = file.split("/");
      if(dash.length == 3) {
          let dot = dash[2].split(".");
        if(dot.length == 2) {
          let lang = dot[0];
          fs.readFile(file, function(err, data) {
            language_dict[lang] = JSON.parse(data.toString());
          });
        }
      }
    });
}

const getMessage = (language = defaultLang, botId, key) => {
  // console.log("⭆ getMessage: ", language, botId, key);
  let msg = botId ? language_dict[language][botId][key] : language_dict[language][key]

  // console.log("getMessage Output\n", msg);
  if(!msg) console.log(`❌ Object doesn't exist for ${language}.${botId}.${key}`);
  return msg;
}

module.exports = {init, defaultLang, language_dict, getMessage}
