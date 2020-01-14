function typesView(office) {
    commonDom.progressBar.close()
    commonDom.drawer.list.selectedIndex = 2;
    const templateTypes =  {}
    const appEl = document.getElementById('app-content')
    http('GET', `/api/myGrowthfile?office=${office}&field=types`).then(response => {
        appEl.innerHTML = ''
        console.log(response)
        response.types.forEach(function (type) {
            if(!templateTypes[type.template]) {
                templateTypes[type.template] = [type]
            }
            else {
                templateTypes[type.template].push(type)
            }
        });
        Object.keys(templateTypes).forEach(function(template){
            const card = createTypeCard(template)
            appEl.appendChild(card);
            templateTypes[template].forEach(function(activity){  
                const li = typeLi(activity.attachment.Name.value,getSecondaryText(activity),activity.status)
                li.querySelector(".mdc-icon-button").addEventListener('click',function(e){
                    getLocation().then(geopoint => {
                        http('PATCH','/api/activities/change-status',{
                            activityId:activity.activityId,
                            status:e.currentTarget.dataset.status,
                            geopoint:geopoint
                        }).then(function(){
                            if(e.currentTarget.dataset.status === 'delete') {
                                li.remove();
                            }
                        }).catch(function(err){
                            showSnacksApiResponse(err.message)
                        })
                    }).catch(handleLocationError)
                })
                li.querySelector('.mdc-list-item').addEventListener('click',function(){
                    history.pushState({
                        view: 'editType',
                        office: office
                      }, `Type View`, `/?view=editType`);
                      editType(activity)
                });
                
                card.querySelector('ul').appendChild(li);
            })
            appEl.appendChild(card);
            card.querySelector('.mdc-fab').addEventListener('click',function(){
                history.pushState({
                    view: 'editType',
                    office: office
                  }, `Type View`, `/?view=editType`);
                  addType({
                      template:template,
                      office:office
                  })
            })
        })
    });
}


function addType(activity) {
    const appEl = document.getElementById('app-content');
    loadForm(appEl,activity,true);
}


function editType(activity) {
    console.log(activity);
    const appEl = document.getElementById('app-content');
    loadForm(appEl,activity);
}

function getSecondaryText(activity) {
    const keys = Object.keys(activity.attachment);
    const k =  keys.filter(function(key){
        return key !== 'Name'
    })
    return k[0]
}


function createTypeCard(template) {

    const card = createElement('div', {
        className: 'mdc-card type-card expense-card mdc-layout-grid__cell mdc-layout-grid__cell--span-8-tablet  mdc-layout-grid__cell--span-12-desktop mdc-card--outlined'
    })
    card.dataset.type = template;
    card.innerHTML = `
        <div class="demo-card__primary">
            <div class="card-heading">
                <span class="demo-card__title mdc-typography mdc-typography--headline6">${template}</span>
              
            </div>
            <div class='recipients-container'>
                ${cardButton().add('add').outerHTML}
          </div>
        </div>
        <div class='include-list pt-10'>
            <ul class='mdc-list demo-list mdc-list--two-line mdc-list--avatar-list'>
            </ul>
        </div>
       `
    return card;

}


function typeLi(primaryTextContent,secondaryTextContent,status) {
    const container = createElement('div', {
        className: 'actionable-list-container'
      });
    
      const li = createElement('li', {
        className: 'mdc-list-item'
      });
    
      const textSpan = createElement('span', {
        className: 'mdc-list-item__text'
      });
    
      const primaryText = createElement('span', {
        className: 'mdc-list-item__primary-text',
        textContent: primaryTextContent
      });
    
      const secondaryText = createElement('span', {
        className: 'mdc-list-item__secondary-text',
        textContent:  secondaryTextContent
      });
    
      textSpan.appendChild(primaryText)
      textSpan.appendChild(secondaryText);
     
      li.appendChild(textSpan);
      new mdc.ripple.MDCRipple(li)
      container.appendChild(li)
      container.appendChild(createStatusIcon(status));
      return container;
    
}