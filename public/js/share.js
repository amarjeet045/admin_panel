const initializeSharePage = (office,companyLogo) => {
    firebase.auth().onAuthStateChanged(function (user) {
        if (!user) {
            const el = document.getElementById('home-login')
            login(el)
            el.querySelector('.text-indicator p').textContent = 'Log into Growthfile to add users'
            document.querySelector(".share--background-image").classList.add("background-hidden")
            return
        }

        const param = parseURL()
        if(param){
            http('PUT', `${appKeys.getBaseUrl()}/api/profile/acquisition`, {
                source: param.get('utm_source'),
                medium: param.get('utm_medium'),
                campaign: param.get('utm_campaign'),
                campaignId:param.get('campaignId'),
                office: param.get('office'),
            })
        }

        document.querySelector(".share--background-image").classList.remove("background-hidden")
        document.querySelector('.auth-block').remove();
        createDynamiclink(`?action=get-subscription&office=${office}&utm_source=share_link_webapp&utm_medium=share_widget&utm_campaign=share_link`,companyLogo).then(function(shareLink){
            const widget = shareWidget(shareLink,office);
            document.getElementById('share-widget').appendChild(widget);  
                const continueBtn = createElement('a',{
                    href:'./app',
                    className:'mdc-button mdc-button--raised full-width',
                    textContent:'Continue'
                })
                const p = createElement('p',{
                    className:'text-center',
                    textContent:'Or',
                    style:'margin-top:30px'
                })
                widget.querySelector('.mdc-layout-grid').appendChild(p)
                widget.querySelector('.mdc-layout-grid').appendChild(continueBtn)
            
        }).catch(console.error)
    })
}

