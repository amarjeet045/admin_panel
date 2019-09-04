import {
    MDCTextField
} from "@material/textfield";
import {
    MDCList
} from "@material/list";
import {MDCRipple} from "@material/ripple";

const handleViewAndEditFields = (li) => {
    li.querySelector(".mdc-list-item__meta").classList.add("hidden")
    li.style.height = '56px';
    const editEl = document.querySelector(`[data-edit="${li.dataset.for}"]`);
    const viewEl = document.querySelector(`[data-view="${li.dataset.for}"]`);
    editEl.classList.remove('hidden')
    viewEl.classList.add('hidden')
    const textField = new MDCTextField(editEl.querySelector('.mdc-text-field'))
    textField.focus()
    document.querySelector('.mdc-card__actions').classList.remove('hidden')
    parent.resizeIframe(parent.document.querySelector('iframe'))

}

const init = (activity) => {
    const ul = new MDCList(document.getElementById('edit-payroll-list'))
    const listItemRipples = ul.listElements.map((listItemEl) => new MDCRipple(listItemEl));

    ul.listen("MDCList:action",function(evt){
        const li = ul.listElements[evt.detail.index];
        if(li.dataset.editable === "true") {
            handleViewAndEditFields(li)
        };
    })

    const cancelBtn = new MDCRipple(document.getElementById('cancel-form-edit'))
    cancelBtn.root_.addEventListener('click',function(){
        // parent.resizeIframe(parent.document.querySelector('iframe'))
        parent.document.querySelector('iframe').style.height = '';
        document.location.href = document.location.href;
    })
}
init();

