const container = document.querySelector('.fabs');

const init = (office, officeId) => {

}

container.children[0].addEventListener('click', (ev) => {
    const dialog = new mdc.dialog.MDCDialog(document.getElementById('share-dialog'));
    let metaRecord;
    const tx = window.database.transaction("meta");
    tx.objectStore("meta").get("meta").onsuccess = function (e) {
        metaRecord = e.target.result;
    
    }
    tx.oncomplete = function () {
        // if (metaRecord.shareLink) {
            // dialog.content_.appencChild(shareWidget(metaRecord.shareLink))   
            dialog.content_.appendChild(shareWidget('https://growthfile.page.link/naxz'))   

        // }
        // else {
        //     getShareLink(metaRecord.office).then(res => {
        //         dialog.content_.appendChild(shareWidget(res.shortLink));
        //         metaRecord.shareLink = res.shortLink
        //         window.database.transaction("meta").objectStore("meta").put(metaRecord);
        //     })
        // }
        dialog.open()
        toggleFabList(container.children[2])
    }
})
container.children[1].addEventListener('click', (ev) => {
    redirect('/admin/employees/manage')
})

container.children[2].addEventListener('click', (ev) => {
    toggleFabList(ev.currentTarget)
})