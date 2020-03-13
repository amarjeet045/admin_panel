window.commonDom = {}

const statusChange = (activityId, status) => {
    return new Promise((resolve, reject) => {
        getLocation().then(geopoint => {
            http('PATCH', `${appKeys.getBaseUrl()}/api/activities/change-status`, {
                activityId: activityId,
                status: status,
                geopoint: geopoint
            }).then(statusChangeResponse => {
                showSnacksApiResponse('The status is : ' + status)
                resolve(statusChangeResponse)
            }).catch(function (err) {
                showSnacksApiResponse(err.message)
                reject(err.message)
            })
        }).catch(handleLocationError)
    });
}

const share = (activityId, phoneNumbers) => {
    return new Promise((resolve, reject) => {

        getLocation().then(geopoint => {
            http('PATCH', `${appKeys.getBaseUrl()}/api/activities/share/`, {
                activityId: activityId,
                share: phoneNumbers,
                geopoint: geopoint
            }).then(function (response) {

                console.log(response)
                showSnacksApiResponse(`Updated`)
                resolve(response)
            }).catch(function (err) {
                showSnacksApiResponse(err.message)
                reject(err)
            })
        }).catch(handleLocationError);
    })
}

const sortByLatest = (data) => {
    return data.slice(0).sort((a, b) => {
        return b.lastModifiedDate - a.lastModifiedDate;
    })
}

function sendFormToParent(formData) {
    const frame = document.getElementById('form-iframe');

    getLocation().then(function (geopoint) {
        formData.geopoint = geopoint
        const url = `${appKeys.getBaseUrl()}/api/activities/${formData.isCreate ? 'create':'update'}`;
        const method = formData.isCreate ? 'POST' : 'PATCH'
        http(method, url, formData).then(function () {
            toggleForm('success')
        }).catch(function (err) {
            toggleForm(err.message)
        })
    }).catch(handleLocationError);
}

const toggleForm = (message) => {
    showSnacksApiResponse(message);
    const frame = document.getElementById('form-iframe');
    if (!frame) return;
    frame.contentWindow.postMessage({
        name: 'toggleSubmit',
        template: '',
        body: '',
        deviceType: ''
    }, 'https://growthfile-207204.firebaseapp.com')
}
const updateState = (...args) => {
    console.log(args)
    const state = args[0]
    history.pushState({
        view: state.view,
        office: state.office
    }, state.view, `/?view=${state.name}`);
    updateBreadCrumb(state.name);
    args.shift()
    window[state.view](...args)

}

const back = () => {
    history.back()
}

const getLocation = () => {
    return new Promise((resolve, reject) => {
        const storedGeopoint = sessionStorage.getItem('geopoint')

        if (storedGeopoint) return resolve(JSON.parse(storedGeopoint))

        if (!"geolocation" in navigator) return reject("Your browser doesn't support geolocation.Please Use A different Browser")

        navigator.geolocation.getCurrentPosition(position => {
            const geopoint = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                provider: "HTML5"
            }
            sessionStorage.setItem('geopoint', JSON.stringify(geopoint))
            return resolve(geopoint);
        }, error => {
            return reject(error)
        }, {
            enableHighAccuracy: false,
            timeout: 8000,
        })
    })
}


const getIdToken = () => {
    return new Promise((resolve, reject) => {
        firebase.auth().currentUser.getIdToken().then(resolve).catch(reject);
    })
}


const formatEndPoint = (endPoint) => {
    let prefix = '&'

    if (!window.isSupport) return endPoint

    if (endPoint.indexOf('/activities/') > -1 || endPoint.indexOf('/update-auth') > -1 || endPoint.indexOf('/batch') > -1 || endPoint.indexOf('/admin/bulk') > -1) {
        prefix = '?'
    }
    return `${endPoint}${prefix}support=true`
}

const http = (method, endPoint, postData) => {
    if (commonDom.progressBar) {
        commonDom.progressBar.open();
    }
    return new Promise((resolve, reject) => {
        getIdToken().then(idToken => {

            fetch(formatEndPoint(endPoint), {
                method: method,
                body: postData ? createPostData(postData) : null,
                headers: {
                    'Content-type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                }
            }).then(response => {
                if (!response.status || response.status >= 226 || !response.ok) {
                    throw response
                }
                return response.json();
            }).then(function (res) {
                if (commonDom.progressBar) {
                    commonDom.progressBar.close();
                }

                if (res.hasOwnProperty('success') && !res.success) {
                    reject(res);
                    return;
                }
                resolve(res)

            }).catch(function (err) {
                if (commonDom.progressBar) {
                    commonDom.progressBar.close();
                }
                err.text().then(errorMessage => {
                    reject(JSON.parse(errorMessage))
                })
            })
        }).catch(error => {
            if (commonDom.progressBar) {
                commonDom.progressBar.close();
            }
            return reject(error)
        })
    })

}


const createPostData = (postData) => {
    console.log(postData)
    postData.timestamp = offsetTime();
    return JSON.stringify(postData);
}


const offsetTime = () => {
    return Date.now();
    //  return Date.now() + Number(sessionStorage.getItem('serverTime'))
}

const signOut = (topAppBar, drawer) => {
    firebase.auth().signOut().then(function () {
        if (topAppBar && drawer) {
            document.getElementById('app').classList.remove('mdc-top-app-bar--fixed-adjust')
            drawer.root_.classList.add('mdc-drawer--modal');
            hideTopAppBar(topAppBar)
            drawer.root_.classList.add("hidden")
            drawer.open = false;
            closeProfile();
        }
    }).catch(console.log)
}

const redirect = (pathname) => {
    window.location = window.location.origin + pathname;
}

function showSnacksApiResponse(text, buttonText = 'Okay') {

    const sb = snackBar(text, buttonText);
    sb.open();

}
const handleLocationError = (error) => {

    console.log(error)
    let messageString = title = '';

    switch (error.code) {
        case 1:
            title = 'Location permission'
            messageString = 'Growthfile does not have permission to use your location.'
            break;
        case 2:
            title = 'Location failure'
            messageString = 'Failed to detect your location. Please try again or refresh your browser'
            break;
        case 3:
            title = 'Location failure',
                messageString = 'Failed to detect your location. Please try again or refresh your browser'
            break;
        default:
            break;
    }
    const sb = snackBar(messageString, 'Okay');
    sb.open();


}

const removeChildren = (parent) => {
    let childrenNodes = parent.childNodes.length;
    while (childrenNodes--) {
        parent.removeChild(parent.lastChild);
    }
}


const getConfirmedActivitiesCount = (activityObject) => {
    let count = 0;
    Object.keys(activityObject).forEach(key => {
        if (activityObject[key].status === 'CONFIRMED') {
            count++
        }
    })
    return count;
}

const uploadSheet = (event, template) => {

    event.preventDefault();
    getBinaryFile(event.target.files[0]).then(function (file) {
        console.log(file)
        getLocation().then((geopoint) => {
            http('POST', `${appKeys.getBaseUrl()}/api/admin/bulk`, {
                office: history.state.office,
                data: file,
                template: template,
                geopoint: geopoint
            }).then(function () {
                showSnacksApiResponse('Please check your email');
                event.target.value = ''

            }).catch(function (error) {
                showSnacksApiResponse(error.message);
                event.target.value = ''
            })
        })
    })
}

const getBinaryFile = (file) => {
    return new Promise(resolve => {
        const fReader = new FileReader();
        fReader.onloadend = function (event) {
            return resolve(event.target.result);
        }
        fReader.readAsBinaryString(file);
    })
}


const downloadSample = (template) => {
    http('GET', `/json?action=view-templates&name=${template}`).then(template => {
        const keys = Object.keys(template);

        createExcelSheet(template[keys[0]]);
    }).catch(function (err) {
        console.error(err)
        showSnacksApiResponse('Try again later');
    })
}


function createExcelSheet(rawTemplate) {
    var wb = XLSX.utils.book_new();
    wb.props = {
        Title: rawTemplate.name,
        Subject: `${rawTemplate.name} sheet`,
        Author: 'Growthfile',
        CreatedDate: new Date()
    }

    const data = [];

    if (rawTemplate.name === 'customer' ||
        rawTemplate.name === 'branch') {
        data.push(['address', 'location'])
    } else {
        const allKeys = Object.keys(rawTemplate.attachment);

        rawTemplate
            .schedule
            .forEach(function (name) {
                allKeys.push(name);
            });
        rawTemplate
            .venue
            .forEach(function (venueDescriptor) {
                allKeys.push(venueDescriptor);
            });

        data.push(allKeys);

    }

    const ws = XLSX.utils.aoa_to_sheet(data);

    console.log(ws)
    XLSX.utils.book_append_sheet(wb, ws, "Sheet");
    XLSX.write(wb, {
        bookType: 'xlsx',
        type: 'binary'
    });
    XLSX.writeFile(wb, rawTemplate.name + '.xlsx');

}

function debounce(func, wait, immeditate) {
    var timeout;
    return function () {
        var context = this;
        var args = arguments;
        var later = function () {
            timeout = null;
            if (!immeditate) func.apply(context, args)
        }
        var callNow = immeditate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    }
}

function originMatch(origin) {
    const origins = ['https://growthfile-207204.firebaseapp.com', 'https://growthfile.com', 'https://growthfile-testing.firebaseapp.com', 'http://localhost:5000', 'http://localhost', 'https://growthfilev2-0.firebaseapp.com']
    return origins.indexOf(origin) > -1;
}

window.addEventListener('message', function (event) {
    console.log(event)
    if (!originMatch(event.origin)) return;
    this.console.log(event.data);
    window[event.data.name](event.data.body);
})


function resizeFrame(height) {

    const iframe = document.getElementById('form-iframe');
    if (height) {
        iframe.style.height = height;
    } else {
        iframe.style.height = iframe.contentWindow.document.body.scrollHeight + 'px';
    }
}

const addView = (el, sub, body) => {
    el.classList.remove("mdc-layout-grid", 'pl-0', 'pr-0');
    el.innerHTML = `
    <iframe class='' id='form-iframe' src='https://growthfile-207204.firebaseapp.com/v2/forms/${sub.template}/edit.html'></iframe>`;
    document.getElementById('form-iframe').addEventListener("load", ev => {
        const frame = document.getElementById('form-iframe');
        if (!frame) return;
        frame.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "nearest"
        });

        frame.contentWindow.postMessage({
            name: 'init',
            template: sub,
            body: body,
            deviceType: ''
        }, 'https://growthfile-207204.firebaseapp.com');
        if (sub.template === 'office') {
            frame.style.minHeight = '400px';
        }
        if (!sub.canEdit) {
            frame.contentWindow.postMessage({
                name: 'toggleSubmit',
                template: '',
                body: '',
                deviceType: ''
            }, 'https://growthfile-207204.firebaseapp.com')
        }

    })
}



const createDynamiclink = (urlParam, logo) => {
    return new Promise((resolve, reject) => {
        const param = new URLSearchParams(urlParam);
        let office;
        if (param.get('office')) {
            office = decodeURI(param.get('office'))
        }
        const storedLinks = JSON.parse(localStorage.getItem('storedLinks'));
        if (storedLinks && storedLinks[office]) {
            return resolve(storedLinks[office])
        }

        fetch(`https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=${appKeys.getKeys().apiKey}`, {
            method: 'POST',
            body: JSON.stringify({
                "dynamicLinkInfo": {
                    "domainUriPrefix": "https://growthfile.page.link",
                    "link": `https://growthfile-207204.firebaseapp.com/v2/${urlParam}`,
                    "androidInfo": {
                        "androidPackageName": "com.growthfile.growthfileNew",
                        "androidMinPackageVersionCode": "15",
                    },
                    "navigationInfo": {
                        "enableForcedRedirect": true,
                    },
                    "iosInfo": {
                        "iosBundleId": "com.Growthfile.GrowthfileNewApp",
                        "iosAppStoreId": "1441388774",
                    },
                    "desktopInfo": {
                        "desktopFallbackLink": "https://www.growthfile.com/welcome.html"
                    },
                    "analyticsInfo": {
                        "googlePlayAnalytics": {
                            "utmSource": "webapp",
                            "utmMedium": "Referral",
                            "utmCampaign": "share_link",
                            "utmTerm": "share_link+create",
                            "utmContent": "Share",
                        }
                    },
                    "socialMetaTagInfo": {
                        "socialTitle": `${office} @Growthfile`,
                        "socialDescription": "No More Conflicts On Attendance & Leaves. Record Them Automatically!",
                        "socialImageLink": logo
                    },
                },
                "suffix": {
                    "option": "UNGUESSABLE"
                }
            }),
            headers: {
                'Content-type': 'application/json',
            }
        }).then(response => {
            return response.json()
        }).then(function (url) {
            const linkObject = {}
            linkObject[param.get('office')] = url.shortLink;

            localStorage.setItem('storedLinks', JSON.stringify(linkObject));

            resolve(url.shortLink)

        })
    });
}


const shareWidget = (link, office, displayName) => {

    const shareText = `${displayName ? `Hi ${displayName} from ${office}` : `Hi ${office}`} wants you to use Growthfile to mark daily attendance, apply for leave and regularize attendance. To download please click `
    const el = createElement('div', {
        className: 'share-widget'
    })
    const grid = createElement('div', {
        className: 'mdc-layout-grid'
    })
    const iconContainer = createElement('div', {
        className: 'icon-container'
    })
    iconContainer.appendChild(createElement('i', {
        className: 'material-icons share-icon mdc-theme--primary',
        textContent: 'share'
    }))
    grid.appendChild(iconContainer)
    grid.appendChild(createElement('h1', {
        className: 'mdc-typography--headline5 mb-10 share-widget--heading',
        textContent: 'Invite users to join ' + office
    }))


    const linkManager = createElement('div', {
        className: 'link-manager mt-20'
    })
    const shortLinkPath = new URL(link).pathname
    linkManager.innerHTML = textField({
        value: shortLinkPath.slice(1, shortLinkPath.length),
        trailingIcon: 'file_copy',
        readonly: true,

    })

    const field = new mdc.textField.MDCTextField(linkManager.querySelector('.mdc-text-field'))

    field.trailingIcon_.root_.onclick = function () {
       
        copyRegionToClipboard(link,shareText)
        
    }

    grid.appendChild(linkManager)
    if (navigator.share) {
        const shareBtn = button('Share')
        shareBtn.classList.add('share-btn', 'full-width', 'mdc-button--raised', 'mt-10');
        shareBtn.addEventListener('click', function () {
            const shareData = {
                title: 'Share link',
                text: shareText,
                url: link
            }
            navigator.share(shareData).then(function (e) {
                analyticsApp.logEvent('share', {
                    content_type: 'text'
                })
            }).catch(function (err) {
                console.log(err)
            })
        })
        grid.appendChild(shareBtn)
    } else {
        const socialContainer = createElement("div", {
            className: 'social-container  pt-10 pb-10 mt-20'
        });

        
        socialContainer.appendChild(createFacebookShareWidget(encodeURIComponent(link),`${shareText}`))

        socialContainer.appendChild(createTwitterShareWidget(link, `${shareText}`));
    
        grid.appendChild(socialContainer)

    }
    copyRegionToClipboard(link,shareText)
    el.appendChild(grid)
    return el;
}



const copyRegionToClipboard = (url,shareText) => {
    const tempInput = createElement('input', {
        value: shareText + url
    })
    document.body.appendChild(tempInput)
    tempInput.select();
    tempInput.setSelectionRange(0, 9999);
    document.execCommand("copy")
    showSnacksApiResponse('Link copied')
    tempInput.remove();

}

const parseURL = () => {
    const search = window.location.search;
    if (!search) return;
    const param = new URLSearchParams(search);
    return param;

}

const createFacebookShareWidget = (url,text) => {
    const div = createElement('div', {
        className: 'social'
    })
    const frame = createElement('iframe',{
        src:`https://www.facebook.com/plugins/share_button.php?href=${url}&layout=button_count&size=large&appId=425454438063638&width=110&height=28`,
        width:"110",
        height:"110",
        style:"border:none;overflow:hidden",
        scrolling:"no",
        frameborder:"0",
        allowTransparency:"true",
        allow:"encrypted-media"    
    })
    frame.addEventListener('click',function(){
        analyticsApp.logEvent('share', {
            content_type: 'text',
            method: 'facebook'
        })
    })
    div.appendChild(frame)
    return div
}
const createTwitterShareWidget = (url, text) => {
    const div = createElement('div', {
        className: 'social'
    })
    const a = createElement('a', {
        href: 'https://twitter.com/share?ref_src=twsrc%5Etfw',
        className: 'twitter-share-button',
       
    })
    
    a.dataset.url = url;
    a.dataset.text = text
    a.dataset.size = 'large'
    a.dataset.showCount = 'true';
    a.dataset.related = "growthfile",
   
    a.addEventListener('click',function(){
        analyticsApp.logEvent('share', {
            content_type: 'text',
            method: 'twitter'
        })
    })
    const script = createElement('script', {
        src: 'https://platform.twitter.com/widgets.js'
    })
    script.setAttribute('async', 'true');
    script.setAttribute('charset', 'utf-8')
    div.appendChild(a)
    div.appendChild(script)
    return div;

}


const encodeString = (string) => {
    return encodeURIComponent(string)
}


function fillVenueInSub(sub, venue) {
    const vd = sub.venue[0];
    sub.venue = [{
        geopoint: {
            latitude: venue.latitude || '',
            longitude: venue.longitude || ''
        },
        location: venue.location || '',
        address: venue.address || '',
        venueDescriptor: vd
    }];
    return sub;
}

const getTotalUsers = (roles) => {
    const subscriptions = roles.subscriptions ? roles.subscriptions.length : 0
    const admins = roles.admins ? roles.admins.length : 0
    const employees = roles.employees ? roles.employees.length : 0

    return subscriptions + admins + employees;
}