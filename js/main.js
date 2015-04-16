
function init(){
    var dev = false;
    // Compare our version data to the version in riots static version api call.
    $.ajax(config.baseurl + '/version').done(function(data){
        var version = data[0];

        config.setVersion(version);
        // In the case of riot version api being down, the url returns 0 if the status was not 200
        // as such not holding the app unnecessarily if version api call is down.
        if(dev || (localstorage.getItem('dbversion') !== version && version !== 0)){
            indexedDB.deleteDatabase('nurfStorage')
            console.log('New version released, invalidating resources.');
            localstorage.setItem('dbversion', version);
            config.setVersion(localstorage.getItem('dbversion'));
        }
        if(version === 0){
            config.setVersion(localstorage.getItem('dbversion'));
        }

        storage.init();
        staticdatahandler.init(app.init);
    });
}

document.addEventListener('DOMContentLoaded', function(){
    require('nw.gui').Window.get().showDevTools()
    init();
});