var imagehandler = (function(){

    // Gets image from db if exists
    // else, downloads and saves to db.
    function getImage(path, callback){
        storage.getDbEntry(path, function(result) {
            if (!result || typeof result === 'undefined') {
                cacheImage(path, function(blobData){
                    createImageElement(blobData, callback);
                });
            } else{
                createImageElement(result.entry, callback);
            }
        });
    }

    function cacheImage(imageurl, callback){
        // Create XHR
        var xhr = new XMLHttpRequest(),
            blob;

        xhr.open("GET", imageurl, true);
        // Set the responseType to blob
        xhr.responseType = "blob";
        xhr.addEventListener("load", function () {
            if (xhr.status === 200) {

                // File as response
                blob = xhr.response;

                // Put the received blob into IndexedDB
                storage.addDbEntry(imageurl, blob, config.version);
                if(typeof callback === 'function'){
                    callback(blob);
                }
            }
        }, false);
        // Send XHR
        xhr.send();
    }

    function createImageElement(blobData, callback){
        var imgFile = blobData;

        // Get window.URL object
        var URL = window.URL || window.webkitURL;

        // Create and revoke ObjectURL
        var imgURL = URL.createObjectURL(imgFile);

        // Set img src to ObjectURL
        var imgElement = $('<img>')
        imgElement.attr("src", imgURL);

        if(typeof callback === 'function'){
            callback(imgElement);
        }
    }

    return{
        getImage : getImage
    }
})();