const productName = document.getElementById('name');
const brand = document.getElementById('brand');
const price = document.getElementById('price');
const description = document.getElementById('description');
const form = document.getElementById('manage-form');

const init = (office) => {
    form.addEventListener('submit',(ev)=>{
        ev.submitter.classList.add('active')
        ev.preventDefault();
        const requestBody = {
            attachment:{
                'Name':{
                    value: productName.value,
                    type:'string'
                },
                'Brand' : {
                    value:brand.value,
                    type:'string'
                },
                'Product Description':{
                    value:description.value,
                    type:'string'
                },
                'Unit Value (excluding GST)' : {
                    value:price.value,
                    type:'string'
                },
            },
            template:'product',
            office:office,
            geopoint:{
                latitude:0,
                longitude:0
            },
            share:[],
            schedule:[],
            venue:[]
        }
        
        http('POST',`${appKeys.getBaseUrl()}/api/activities/create`,requestBody).then(res=>{
            formSubmitResponse(ev.submitter, 'New product added');
        }).catch(err=>{
            // if(err.message === `Product ${requestBody.attachment.Name.value} already exist`) {
            
            //     return
            // }
            // formSubmitResponse(ev.submitter, err.message)
        })
    })
}



const putProduct = (activity) => {
    return new Promise(resolve=>{
        const tx = window.database.transaction('types','readwrite');
        const store= tx.objectStore('types');
        store.put(activity);
        tx.complete = function() {
            resolve(activity)      
        }
    })
}