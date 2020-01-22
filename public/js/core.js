window.commonDom = {}
const sortByLatest = (data) => {
    return data.slice(0).sort((a, b) => {
        return b.lastModifiedDate - a.lastModifiedDate;
    })
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
        return resolve({
            latitude: 22,
            longitude: 77
        })
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


const http = (method, endPoint, postData) => {
    if (commonDom.progressBar) {
        commonDom.progressBar.open();
    }
    return new Promise((resolve, reject) => {
        getIdToken().then(idToken => {
            fetch(endPoint, {
                method:method,
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
                console.log(res)
                if (commonDom.progressBar) {
                    commonDom.progressBar.close();
                }

                if (res.hasOwnProperty('success') && !res.success) {
                    reject(res);
                    return;
                }
                resolve(res)

            }).catch(function (err) {
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
            http('POST', '/api/admin/bulk', {
                office: history.state.office,
                data: file,
                template: template,
                geopoint: geopoint
            }).then(function () {
                showSnacksApiResponse('Please check your email');
            }).catch(function (error) {
                showSnacksApiResponse(error.message);
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
    const origins = ['https://growthfile-207204.firebaseapp.com', 'https://growthfile.com', 'https://growthfile-testing.firebaseapp.com', 'http://localhost:5000', 'http://localhost']
    return origins.indexOf(origin) > -1;
}

window.addEventListener('message', function (event) {
    console.log(event)
    if (!originMatch(event.origin)) return;
    this.console.log(event.data);
    window[event.data.name](event.data.body);
})



function loadForm(el, sub, isCreate) {
    el.innerHTML = `
    <div class='mdc-layout-grid__cell--span-12-desktop mdc-layout-grid__cell--span-8-tablet mdc-layout-grid__cell--span-4-phone'>
    <iframe class='' id='form-iframe' src='${window.location.origin}/forms/${sub.template}/'></iframe></div>`;
    document.getElementById('form-iframe').addEventListener("load", ev => {
        const frame = document.getElementById('form-iframe');
        if (!frame) return;
        frame.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "nearest"
        })
        if (isCreate) {
            http('GET', `/json?action=view-templates&name=${sub.template}`).then(template => {
                const temp = template[Object.keys(template)];
                temp.template = sub.template;
                temp.office = sub.office
                temp.share = [];
                delete temp.name;
                frame.contentWindow.init(template[Object.keys(template)], isCreate);
            })
            return;
        }
        frame.contentWindow.init(sub, isCreate);
    })
}

function resizeFrame() {
    const iframe = document.getElementById('form-iframe');
    iframe.style.height = iframe.contentWindow.document.body.scrollHeight + 'px';
}
const addView = (el, sub) => {
    console.log(sub)

    const backIcon = `<a class='mdc-top-app-bar__navigation-icon material-icons'>arrow_back</a>
    <span class="mdc-top-app-bar__title">${sub.template === 'subscription' ? 'Add other contacts' : sub.template === 'users' ? 'Add people' : sub.template}</span>
    `
    const header = createHeader(backIcon, '');
    header.root_.classList.remove('hidden');

    el.classList.remove("mdc-layout-grid", 'pl-0', 'pr-0');
    el.innerHTML = `
        ${sub.template === 'office' || sub.template === 'subscription' || sub.template ==='users' ? header.root_.innerHTML : ''}
        <iframe class='' id='form-iframe' src='https://growthfile-testing.firebaseapp.com/v2/forms/${sub.template}/edit.html'></iframe>`;
    document.getElementById('form-iframe').addEventListener("load", ev => {
        const frame = document.getElementById('form-iframe');
        if (!frame) return;
        frame.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "nearest"
        })
        frame.contentWindow.postMessage({
            name: 'init',
            body: sub,
            deviceType: ''
        }, 'https://growthfile-testing.firebaseapp.com');
    })
}