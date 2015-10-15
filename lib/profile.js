var readline = require('linebyline');
var fs = require('fs');

var Profile = {};

Profile.getProfiles = function(file,callback){
  var matcher = new RegExp("^\\[");
  profileDetected = false;
  var currentProfileName;
  var currentProfileProperties = [];
  var profiles = [];
  rl = readline(file);
  rl.on('line', function(line, lineCount, byteCount) {
      if(matcher.test(line)){
        if(profileDetected == true){
          profiles.push({name:currentProfileName, properties: currentProfileProperties})
        }
        currentProfileProperties = [];
        currentProfileName = ((line.substring(1)).substring(0,line.length-2));
        profileDetected = true;
      }
      else {
        if(profileDetected == true){
          currentProfileProperties.push(line);
        }
      }
  })
  .on('error', function(e) {
    callback(e);
  })
  .on ('end', function(){
    if(profileDetected == true){
      profiles.push({name:currentProfileName, properties: currentProfileProperties})
    }
    callback(null,profiles);
  });
}

Profile.getProfileNames = function(file,callback){
  var matcher = new RegExp("^\\[");
  var currentProfileName;
  var profiles = [];
  rl = readline(file);
  rl.on('line', function(line, lineCount, byteCount) {
      if(matcher.test(line)){
        currentProfileName = ((line.substring(1)).substring(0,line.length-2));
        profiles.push(currentProfileName)
      }
  })
  .on('error', function(e) {
    callback(e);
  })
  .on ('end', function(){
    callback(null,profiles);
  });
}


Profile.setProfile = function(profileName,file,callback){
  Profile.getProfiles(file,function(err,profiles){
    if(err){
      callback(err);
    }
    else {
      tmpFileName = file+Date.now();
      var fd = fs.openSync(tmpFileName, 'w');
      // set profile to default
      profiles.forEach(function(profile){
        if(profile.name == profileName){
          fs.appendFileSync(tmpFileName,'[default]\r\n');
          profile.properties.forEach(function(property){
            fs.appendFileSync(tmpFileName,property+'\r\n');
          });
        }
      });
      // write remaining, skip original default
      profiles.forEach(function(profile){
        if(profile.name !== 'default'){
          fs.appendFileSync(tmpFileName,'['+profile.name+']\r\n');
          profile.properties.forEach(function(property){
            fs.appendFileSync(tmpFileName,property+'\r\n');
          });
        }
      });
      fs.renameSync(tmpFileName,file);
      callback();
    }
  });
}


module.exports = Profile;
