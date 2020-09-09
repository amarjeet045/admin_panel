const container = document.querySelector('.fabs');
/**
 * Divide the parent dom by mdc two--line list height and round of to neares whole number.
 * The resulting positive integer will the query limi for users's api
 */
const query_limit_size = Math.round(document.querySelector('.main-content').offsetHeight / 72)

const init = (office, officeId) => {
    console.log('query limit size',query_limit_size);
    
}


/** Handle fab list */
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