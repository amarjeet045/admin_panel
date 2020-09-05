const init = (office,officeId) => {
    loadNext()
   
} 

const loadNext = () => {
    loadList()
}

const loadList = (start,end) => {
    const tx = window.database.transaction("types")
    const store = tx.objectStore("types");
    store.openCursor().onsuccess = function(evt) {
        const cursor = evt.target.result;
        if(!cursor) return;
        console.log(cursor.value);
        cursor.continue();
    }
}


