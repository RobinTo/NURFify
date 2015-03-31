var storage = (function(){
    var db = null,
        dbName = 'nurfStorage',
        storeName = 'nurf',
        version = 1,
        isDbReady = false;

    function init(callback){
        var request = indexedDB.open(dbName, version);

        request.onupgradeneeded = function (e) {
            db = e.target.result;

            e.target.transaction.onerror = function (e) {
                console.warn(e);
            };

            if (db.objectStoreNames.contains(storeName)) {
                db.deleteObjectStore(storeName);
            }

            db.createObjectStore(storeName, {keyPath: "key"});
            console.log('Recreated ' + storeName);
        };

        request.onsuccess = function (e) {
            db = e.target.result;
            isDbReady = true;
            if(callback) { callback() }
        };

        request.onerror = function (e) {
            console.warn(e);
        };

    }

    function removeDbEntry(key, callback) {
        var tx = db.transaction([storeName], "readwrite"),
            store = tx.objectStore(storeName),
            request = store['delete'](key);

        request.onsuccess = function (e) {
            if (callback) { callback(e); }
        };
        request.onerror = function (e) {
            if (!boot.deploy) { console.warn(e); }
        };
    }

    function addDbEntry(key, item, version, callback) {

        if(!version){
            version = 0.1;
        }
        var data = {'key': key, 'entry': item, 'version': version};
        var tx = db.transaction([storeName], "readwrite"),
            store = tx.objectStore(storeName),
            request = store.put(data);

        request.onsuccess = function (e) {
            if (callback) { callback(); }
        };

        request.onerror = function (e) {
            console.warn(e);
        };
    }

    function getDbEntry(key, callback) {
        var tx = db.transaction([storeName],  'readwrite'),
            store = tx.objectStore(storeName),
            request = store.get(key);

        request.onerror = function (event) {
            console.warn(event);
            if (callback) { callback(null); }
        };

        request.onsuccess = function (event) {
            if (event.target.result) {
                if (callback) { callback(event.target.result); }
            } else {
                if (callback) { callback(null); }
            }
        };
    }

    function dbSpinLock(fn) {
        return function () {
            var args = arguments,
                $this = this;
            if (!isDbReady) {
                var pid = setInterval(function () {
                    if (isDbReady) {
                        clearInterval(pid);
                        fn.apply($this, args);
                    }
                }, 50);
            } else {
                fn.apply($this, args);
            }
        };
    }

    return{
        init : init,
        addDbEntry : dbSpinLock(addDbEntry),
        getDbEntry : dbSpinLock(getDbEntry),
        removeDbEntry : dbSpinLock(removeDbEntry)
    }
})();

var localstorage = (function(){
    var dbo = window.localStorage;

    if (!dbo) {
        console.error('LocalStorage failed');
    }

    function setItem(key, value){
        dbo.setItem(key, JSON.stringify(value));
    }

    function getItem(key, value){
        return JSON.parse(dbo.getItem(key));
    }

    function removeAll(){
        dbo.clear();
    }

    return{
        setItem : setItem,
        getItem : getItem,
        removeAll : removeAll
    }
})();