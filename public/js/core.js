/**
 * creates a dom element 
 * @param {string} tagName 
 * @param {object} attrs 
 * @returns {HTMLElement}
 */

const createElement = (tagName, attrs) => {
    const el = document.createElement(tagName)
    if (attrs) {
        Object.keys(attrs).forEach(function (attr) {
            el[attr] = attrs[attr]
        })
    }
    return el;
}

window.commonDom = {}
/**
 *  captures uncaught and sytax error globally. Once error is captured sendErrorLog then handles the error
 * @param {string} message 
 * @param {string} source 
 * @param {number} lineno 
 * @param {number} colno 
 * @param {string} error 
 */
window.onerror = function (message, source, lineno, colno, error) {
    var string = message.toLowerCase();
    var substring = "script error";
    if (string.indexOf(substring) > -1) return;
    const stack = error.stack || '-';
    const errorBody = {
        source: source,
        lineno: lineno,
        colno: colno,
        message: message,
        stack: stack
    }
    sendErrorLog(errorBody)
};
/**
 * listens for unhandledrejection in Promises. Once event is captured sendErrorLog then handles the error
 */

window.addEventListener("unhandledrejection", event => {
    console.log(event.reason);
    sendErrorLog({
        message: event.reason.message,
        stack: event.reason.stack
    })
    event.preventDefault();
});

/**
 * if User is authenticated and no previous occurance of error exists in localStorage,
 *  then log the error to /services/logs Api & 
 * property flushed is set to true and update in localStorage
 * @param {object} errorBody 
 */
const sendErrorLog = (errorBody) => {
    const storedError = JSON.parse(sessionStorage.getItem('error')) || {};
    //same error exists
    if (storedError.hasOwnProperty(`${errorBody.message}:${errorBody.source||''}`)) return;
    storedError[`${errorBody.message}:${errorBody.source||''}`] = errorBody;
    // set error in localStorage
    sessionStorage.setItem('error', JSON.stringify(storedError));

    //if user is authenticated
    if (window.firebase && window.firebase.auth().currentUser) {
        http('POST', `${appKeys.getBaseUrl()}/api/services/logs`, {
            message: errorBody.message,
            body: errorBody
        }).then(function () {
            storedError[`${errorBody.message}:${errorBody.source||''}`].flushed = true;
            sessionStorage.setItem('error', JSON.stringify(storedError));
        })
    };
}

/**
 * log all non flushed errors stored in localStorage to services/logs . 
 * flushed property is set to true when each error is logged and updated in localStorage
 */
function flushStoredErrors() {

    const storedError = JSON.parse(sessionStorage.getItem('error'));
    // no error found in localStorage
    if (!storedError) return;

    // Loop through all erros and log them
    Object.keys(storedError).forEach(function (key) {
        const errorBody = storedError[key]
        // only flush non flushed errors.
        if (!errorBody.flushed) {
            http('POST', `${appKeys.getBaseUrl()}/api/services/logs`, {
                message: errorBody.message,
                body: errorBody
            }).then(function () {
                //set flushed to true
                storedError[key].flushed = true;
                sessionStorage.setItem('error', JSON.stringify(storedError));
            })
        }
    })
}


/**
 * Check if user had super user permissions. Admin or support.
 * If admin or support Promise resovle with true else false
 */
const isElevatedUser = () => {
    return new Promise((resolve, reject) => {
        firebase.auth().currentUser.getIdTokenResult().then((idTokenResult) => {
            return resolve(idTokenResult.claims.admin || idTokenResult.claims.support)
        }).catch(reject)
    })
}

/**
 *  Inserts a logout button in header. Clicking this button will  signout user. 
 */
const addLogoutBtn = () => {
    const el = document.getElementById('app-bar-login');
    if (!el) return;
    document.getElementById('app-bar-signup').classList.add('hidden')
    el.textContent = 'Log out';
    el.removeAttribute('href');
    el.addEventListener('click', function () {
        firebase.auth().signOut().then(function () {
            redirect('')
        })
    })
}

/**
 * Performs status-change operation on an activity. uses activities/status-change
 * @param {object} activity 
 */
const statusChange = (activity) => {
    return new Promise((resolve, reject) => {
        return getLocation().then(geopoint => {
                activity.geopoint = geopoint
                return http('PUT', `${appKeys.getBaseUrl()}/api/activities/change-status`, activity)
            })
            .then(statusChangeResponse => {
                showSnacksApiResponse('The status is : ' + activity.status)
                resolve(statusChangeResponse)
            }).catch(err => {
                if (err.type === 'geoLocation') {
                    handleLocationError(err);
                    reject(err.message)
                    return
                }
                showSnacksApiResponse(err.message)
                reject(err.message)
            });
    });
}

/**
 * Performs share operation (add assigness) on an activity. uses activities/share/
 * @param {object} activity 
 */
const share = (activity) => {
    return new Promise((resolve, reject) => {
        return getLocation().then(geopoint => {
            activity.geopoint = geopoint;
            http('PUT', `${appKeys.getBaseUrl()}/api/activities/share/`, activity)

        }).then(response => {
            showSnacksApiResponse(`Updated`)
            resolve(response)
        }).catch(err => {
            if (err.type === 'geoLocation') {
                handleLocationError(err);
                reject(err.message)
                return
            }
            showSnacksApiResponse(err.message)
            reject(err.message)
        })
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
        const method = formData.isCreate ? 'POST' : 'PUT'
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
    }, appKeys.getIframeDomain())
}
const updateState = (...args) => {
    console.log(args)
    const state = args[0]
    history.pushState({
        view: state.view,
        action: state.action,
        office: state.office
    }, state.view, `?view=${state.view}${isNewUser ? '&u=1' :''}`);
    updateBreadCrumb(state.view);
    args.shift()
    window[state.action](...args)
}

const back = () => {
    history.back()
}

/**
 * Uses navigator.geolocation to get device location.
 */
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
            error.type === 'geolocation'
            return reject(error)
        }, {
            enableHighAccuracy: false,
            timeout: 8000,
        })
    })
}

/**
 * Get user idToken to be used as bearer token for performing http requests
 */

const getIdToken = () => {
    return new Promise((resolve, reject) => {
        firebase.auth().currentUser.getIdToken().then(resolve).catch(reject);
    })
}

/**
 * Formats endpoint depending user privilege and endpoint
 * @param {string} endPoint 
 */
const formatEndPoint = (endPoint) => {
    //default prefix
    let prefix = '&';
    // return endpoint as it is for /shareLink , /logs , /profile & admin user.
    if (!window.isSupport || endPoint.indexOf('/shareLink') > -1 || endPoint.indexOf('/logs') > -1 || endPoint.indexOf('/profile/') > -1) return endPoint;

    //if user is support prefix with '?'
    if (endPoint.indexOf('/activities/') > -1 || endPoint.indexOf('/update-auth') > -1 || endPoint.indexOf('/batch') > -1 || endPoint.indexOf('/admin/bulk') > -1) {
        prefix = '?'
    }

    return `${endPoint}${prefix}support=true`
}

/**
 *  Performs fetch operation to perform http requests.
 * @param {string} method 
 * @param {string} endPoint 
 * @param {object} postData 
 */
const http = (method, endPoint, postData) => {
    // if (commonDom.progressBar) {
    //     commonDom.progressBar.open();
    // }
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
                // if (commonDom.progressBar) {
                //     commonDom.progressBar.close();
                // }

                if (res.hasOwnProperty('success') && !res.success) {
                    reject(res);
                    return;
                }
                resolve(res)

            }).catch(function (err) {
                // if (commonDom.progressBar) {
                //     commonDom.progressBar.close();
                // }
                err.text().then(errorMessage => {
                    reject(JSON.parse(errorMessage))
                })
            })
        }).catch(error => {
            // if (commonDom.progressBar) {
            //     commonDom.progressBar.close();
            // }
            return reject(error)
        })
    })

}

/**
 * sets timestamp to postData body
 * @param {object} postData 
 * @returns stringified json 
 */
const createPostData = (postData) => {
    postData.timestamp = Date.now();
    return JSON.stringify(postData);
}

/**
 * performs logout operation
 */
const signOut = () => {
    firebase.auth().signOut().then().catch(console.log)
}

/**
 * redirects users to pathname 
 * @param {string} pathname 
 */
const redirect = (pathname) => {
    window.location = window.location.origin + pathname;
}

/**
 *  opens the MDCSnackBar to show user message
 * @param {string} text 
 * @param {string} buttonText 
 */
function showSnacksApiResponse(text, buttonText = 'Okay') {
    const sb = snackBar(text, buttonText);
    sb.open();

}

/**
 * If getLocation method rejects then map the error code to message.
 *  this message is then shown via showSnacksApiResponse()
 * @param {object} error 
 */
const handleLocationError = (error) => {

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
    //show message to user
    showSnacksApiResponse(messageString);

}

/**
 *  remove all children nodes from a given HTMLElement
 * @param {HTMLElement} parent 
 */
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
    const origins = ['https://growthfile.com', 'https://growthfile-207204.firebaseapp.com', appKeys.getIframeDomain()]
    return origins.indexOf(origin) > -1;
}

window.addEventListener('message', function (event) {
    if (!originMatch(event.origin)) return;
    if (!window[event.data.name]) return;
    window[event.data.name](event.data.body);
})

function resizeFrame(frameDimension) {

    const iframe = document.getElementById('form-iframe');
    iframe.style.height = frameDimension.height + 'px';

}

const addView = (el, sub, body) => {
    if (!el) return;
    el.classList.remove("mdc-layout-grid", 'pl-0', 'pr-0');
    el.innerHTML = `
    <iframe  id='form-iframe' scrolling="no" style="width:100%;border:none;" src='${appKeys.getIframeDomain()}/v2/forms/${sub.template}/edit.html'></iframe>`;
    document.getElementById('form-iframe').addEventListener("load", ev => {
        const frame = document.getElementById('form-iframe');
        if (!frame) return;
        if (commonDom.progressBar) {
            commonDom.progressBar.close()
        }
        frame.contentWindow.postMessage({
            name: 'init',
            template: sub,
            body: body,
            deviceType: ''
        }, appKeys.getIframeDomain())

        if (!sub.canEdit) {
            frame.contentWindow.postMessage({
                name: 'toggleSubmit',
                template: '',
                body: '',
                deviceType: ''
            }, appKeys.getIframeDomain())
        }

    })
}

function shareLinkField(attr) {
    return `<div class="mdc-text-field mdc-text-field--outlined ${attr.label ? '' :'mdc-text-field--no-label'} full-width ${attr.leadingIcon ? 'mdc-text-field--with-leading-icon' :''} ${attr.trailingIcon ? 'mdc-text-field--with-trailing-icon' :''} ${attr.disabled ? 'mdc-text-field--disabled' :''}" id='${attr.id}'>
    ${attr.leadingIcon ? `<i class="material-icons mdc-text-field__icon mdc-text-field__icon--leading" tabindex="0" role="button">${attr.leadingIcon}</i>`:''}
    ${attr.trailingIcon ? `<i class="material-icons mdc-text-field__icon mdc-text-field__icon--trailing" tabindex="0" role="button" >${attr.trailingIcon}</i>` :''}
    <input autocomplete=${attr.autocomplete ? attr.autocomplete : 'off'} type="${attr.type || 'text'}" class="mdc-text-field__input" value="${attr.value || ''}"  ${attr.required ? 'required':''}  ${attr.disabled ? 'disabled':''} ${attr.readonly ? 'readonly':''}>
    
    <div class="mdc-notched-outline">
      <div class="mdc-notched-outline__leading"></div>
      ${attr.label ? `<div class="mdc-notched-outline__notch">
      <label  class="mdc-floating-label">${attr.label}</label>
    </div>` :''}
      
      <div class="mdc-notched-outline__trailing"></div>
    </div>
  </div>`
}


const shareWidget = (link, office) => {


    const el = createElement('div', {
        className: 'share-widget'
    })
    const grid = createElement('div', {
        className: 'mdc-layout-grid pt-0'
    })


    grid.appendChild(createElement('div', {
        className: 'mdc-typography--body1',
        textContent: 'Invite employees by sharing this download link with them.'
    }))

    const linkManager = createElement('div', {
        className: 'link-manager mt-20'
    });


    linkManager.innerHTML = shareLinkField({
        value: link,
        trailingIcon: navigator.share ? 'share' : 'file_copy',
        readonly: true,
    })


    const field = new mdc.textField.MDCTextField(linkManager.querySelector('.mdc-text-field'))

    field.trailingIcon_.root_.onclick = function () {
        field.focus()
        const shareText = `I want you to use Growthfile at work daily to avoid payment disputes and Get Paid in Full.  Click here to download the app and start now.`

        if (navigator.share) {
            const shareData = {
                title: 'Share link',
                text: shareText,
                url: link
            }
            navigator.share(shareData).then(function (e) {
                analyticsApp.logEvent('share', {
                    content_type: 'text'
                })
            }).catch(console.error)
            return
        }

        if (navigator.clipboard) {
            navigator.clipboard.writeText(shareText + link).then(function () {
                showSnacksApiResponse('Link copied')
            }).catch(function (error) {
                copyRegionToClipboard(link, shareText)
            })
            return
        }
        copyRegionToClipboard(link, shareText)
    }

    grid.appendChild(linkManager)
    if (!navigator.share) {
        const socialContainer = createElement("div", {
            className: 'social-container  pt-10 pb-10 mt-20 mdc-layout-grid__inner'
        });
        const desktopBrowserShareText = `Hi,%0A%0A${encodeURIComponent(`I want you to use Growthfile at work daily to avoid payment disputes and Get Paid in Full. `)}%0A%0A${encodeURIComponent('Click here to download the app and start now.')}%0A${encodeURIComponent(link)}`
        socialContainer.appendChild(createWhatsAppShareWidget(desktopBrowserShareText))
        socialContainer.appendChild(createMailShareWidget(desktopBrowserShareText))
        // socialContainer.appendChild(createTwitterShareWidget(link, `${shareText}`));
        // socialContainer.appendChild(createFacebookShareWidget(encodeURIComponent(link), `${shareText}`))

        grid.appendChild(socialContainer)
    }

    el.appendChild(grid)
    return el;
}



const copyRegionToClipboard = (url, shareText) => {
    const tempInput = createElement('input', {
        value: shareText + url + ` , Any issues do contact +918595422858`,
        id: 'copy-input'
    })
    document.body.appendChild(tempInput)
    const input = document.getElementById('copy-input')
    console.log(input.value)
    input.select();
    input.setSelectionRange(0, 9999);
    document.execCommand("copy")
    showSnacksApiResponse('Link copied')
    input.remove();

}

const parseURL = () => {
    const search = window.location.search;
    const param = new URLSearchParams(search);
    if (search && (param.get('utm_source') || param.get('utm_medium') || param.get('utm_campaign') || param.get('campaignId'))) return param;
    if (!firebase.auth().currentUser) return;

    const metadata = firebase.auth().currentUser.metadata
    if (metadata.creationTime === metadata.lastSignInTime) return new URLSearchParams('?utm_source=organic');
    return;
}

const createFacebookShareWidget = (url, text) => {
    const div = createElement('div', {
        className: 'social mdc-layout-grid__cell--span-2 social mdc-layout-grid__cell mdc-layout-grid__cell--span-3-desktop facebook'
    })
    const frame = createElement('iframe', {
        src: `https://www.facebook.com/plugins/share_button.php?href=${url}&layout=button&size=large&appId=425454438063638&width=110&height=28`,
        width: "110",
        height: "110",
        style: "border:none;overflow:hidden",
        scrolling: "no",
        frameborder: "0",
        allowTransparency: "true",
        allow: "encrypted-media"
    })
    frame.addEventListener('click', function () {
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
        className: 'social mdc-layout-grid__cell--span-2 social mdc-layout-grid__cell--span-3-desktop twitter'
    })
    const a = createElement('a', {
        href: 'https://twitter.com/share?ref_src=twsrc%5Etfw',
        className: 'twitter-share-button',
        width: '100%'
    })

    a.dataset.url = url;
    a.dataset.text = text
    a.dataset.size = 'large'
    a.dataset.related = "growthfile",

        a.addEventListener('click', function () {
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

const createWhatsAppShareWidget = (shareText) => {

    const div = createElement('div', {
        className: 'social  mdc-layout-grid__cell--span-4 mdc-layout-grid__cell--span-6-desktop'
    })
    const button = createElement('a', {
        className: 'mdc-button whatsapp-button full-width',
        href: `https://api.whatsapp.com/send?text=${shareText}`,
        target: '_blank'
    })
    button.innerHTML = ` <div class="mdc-button__ripple"></div>
    <svg class="mdc-button__icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="2489" height="2500" viewBox="0 0 1219.547 1225.016"><path fill="#E0E0E0" d="M1041.858 178.02C927.206 63.289 774.753.07 612.325 0 277.617 0 5.232 272.298 5.098 606.991c-.039 106.986 27.915 211.42 81.048 303.476L0 1225.016l321.898-84.406c88.689 48.368 188.547 73.855 290.166 73.896h.258.003c334.654 0 607.08-272.346 607.222-607.023.056-162.208-63.052-314.724-177.689-429.463zm-429.533 933.963h-.197c-90.578-.048-179.402-24.366-256.878-70.339l-18.438-10.93-191.021 50.083 51-186.176-12.013-19.087c-50.525-80.336-77.198-173.175-77.16-268.504.111-278.186 226.507-504.503 504.898-504.503 134.812.056 261.519 52.604 356.814 147.965 95.289 95.36 147.728 222.128 147.688 356.948-.118 278.195-226.522 504.543-504.693 504.543z"></path><linearGradient id="a" gradientUnits="userSpaceOnUse" x1="609.77" y1="1190.114" x2="609.77" y2="21.084"><stop offset="0" stop-color="#20b038"></stop><stop offset="1" stop-color="#60d66a"></stop></linearGradient><path fill="url(#a)" d="M27.875 1190.114l82.211-300.18c-50.719-87.852-77.391-187.523-77.359-289.602.133-319.398 260.078-579.25 579.469-579.25 155.016.07 300.508 60.398 409.898 169.891 109.414 109.492 169.633 255.031 169.57 409.812-.133 319.406-260.094 579.281-579.445 579.281-.023 0 .016 0 0 0h-.258c-96.977-.031-192.266-24.375-276.898-70.5l-307.188 80.548z"></path><image overflow="visible" opacity=".08" width="682" height="639"  transform="translate(270.984 291.372)"></image><path fill-rule="evenodd" clip-rule="evenodd" fill="#FFF" d="M462.273 349.294c-11.234-24.977-23.062-25.477-33.75-25.914-8.742-.375-18.75-.352-28.742-.352-10 0-26.25 3.758-39.992 18.766-13.75 15.008-52.5 51.289-52.5 125.078 0 73.797 53.75 145.102 61.242 155.117 7.5 10 103.758 166.266 256.203 226.383 126.695 49.961 152.477 40.023 179.977 37.523s88.734-36.273 101.234-71.297c12.5-35.016 12.5-65.031 8.75-71.305-3.75-6.25-13.75-10-28.75-17.5s-88.734-43.789-102.484-48.789-23.75-7.5-33.75 7.516c-10 15-38.727 48.773-47.477 58.773-8.75 10.023-17.5 11.273-32.5 3.773-15-7.523-63.305-23.344-120.609-74.438-44.586-39.75-74.688-88.844-83.438-103.859-8.75-15-.938-23.125 6.586-30.602 6.734-6.719 15-17.508 22.5-26.266 7.484-8.758 9.984-15.008 14.984-25.008 5-10.016 2.5-18.773-1.25-26.273s-32.898-81.67-46.234-111.326z"></path><path fill="#FFF" d="M1036.898 176.091C923.562 62.677 772.859.185 612.297.114 281.43.114 12.172 269.286 12.039 600.137 12 705.896 39.633 809.13 92.156 900.13L7 1211.067l318.203-83.438c87.672 47.812 186.383 73.008 286.836 73.047h.255.003c330.812 0 600.109-269.219 600.25-600.055.055-160.343-62.328-311.108-175.649-424.53zm-424.601 923.242h-.195c-89.539-.047-177.344-24.086-253.93-69.531l-18.227-10.805-188.828 49.508 50.414-184.039-11.875-18.867c-49.945-79.414-76.312-171.188-76.273-265.422.109-274.992 223.906-498.711 499.102-498.711 133.266.055 258.516 52 352.719 146.266 94.195 94.266 146.031 219.578 145.992 352.852-.118 274.999-223.923 498.749-498.899 498.749z"></path></svg>
    <span class="mdc-button__label">Send</span>`
    div.appendChild(button)
    return div
}

const createMailShareWidget = (shareText) => {
    const div = createElement('div', {
        className: 'social  mdc-layout-grid__cell--span-4 mdc-layout-grid__cell--span-6-desktop'
    })
    const button = createElement('a', {
        className: 'mdc-button mail-button mdc-button--outlined full-width',
        href: `mailto:?Subject=${encodeURIComponent('Welcome to Growthfile - Here’s your link to download the app')}&body=${shareText}`,
        target: '_blank'
    })
    button.innerHTML = ` <div class="mdc-button__ripple"></div>
    <i class="material-icons mdc-button__icon" aria-hidden="true">mail  </i>

    <span class="mdc-button__label">Send</span>`
    div.appendChild(button)
    return div
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

const getActiveCount = (activities = []) => {

    return activities.filter(activity => {
        return activity.status !== 'CANCELLED'
    }).length
}

const getUsersCount = (roles) => {

    let totalUsers = 0

    if (roles.admin) {
        totalUsers += roles.admin.length
    }
    if (roles.employee) {
        totalUsers += roles.employee.length

    }

    return {
        totalUsers: totalUsers,
        activeUsers: getActiveCount(roles.admin) + getActiveCount(roles.employee)
    }

}


const handleRecaptcha = (buttonId) => {
    //localize the reCAPTCHA to user's local launguage preference
    firebase.auth().useDeviceLanguage();

    return new firebase.auth.RecaptchaVerifier(buttonId, {
        'size': 'invisible',
        'callback': function (response) {
            // reCAPTCHA solved, allow signInWithPhoneNumber.
        },
        'expired-callback': function () {
            // Response expired. Ask user to solve reCAPTCHA again.
            // ...
        }
    });
}




function handleAuthAnalytics(result) {

    console.log(result);

    commonDom.progressBar ? commonDom.progressBar.close() : '';
    const sign_up_params = {
        method: firebase.auth.PhoneAuthProvider.PROVIDER_ID,
        'isAdmin': 0
    }
    if (result.additionalUserInfo.isNewUser) {
        firebase.auth().currentUser.getIdTokenResult().then(function (tokenResult) {
            if (isAdmin(tokenResult)) {
                fbq('trackCustom', 'Sign Up Admin');
                analyticsApp.setUserProperties({
                    "isAdmin": "true"
                });
                sign_up_params.isAdmin = 1
            } else {
                fbq('trackCustom', 'Sign Up');
            }
            analyticsApp.logEvent('sign_up', sign_up_params)
        })
        return
    }
    fbq('trackCustom', 'login');
    analyticsApp.logEvent('login', {
        method: result.additionalUserInfo.providerId
    })

}


let userState = function () {
    const userSubsriptions = {}

    return {
        canEditSubscription: function (subscriptionName) {
            if (window.isSupport) return true;
            return userSubsriptions[subscriptionName]
        },
        setUserSubscriptions: function (subscriptions, phoneNumber) {
            subscriptions.forEach(function (subscription) {
                if (subscription.attachment['Phone Number'].value === phoneNumber && subscription.status !== 'CANCELLED') {
                    userSubsriptions[subscription.attachment.Template.value] = true
                }
            })
        }
    }
}();


/**
 * convert image to base64
 * @param {Event} evt 
 * @param {Number} compressionFactor 
 */
const getImageBase64 = (evt, compressionFactor) => {
    return new Promise(function (resolve, reject) {
        const files = evt.target.files
        if (!files.length) return;
        const file = files[0];
        var fileReader = new FileReader();
        fileReader.onload = function (fileLoadEvt) {
            const srcData = fileLoadEvt.target.result;
            const image = new Image();
            image.src = srcData;
            image.onload = function () {
                return resolve(resizeAndCompressImage(image, compressionFactor))
            }
        }
        fileReader.readAsDataURL(file);
    })
}

/**
 *  Compress  via loading it in canvas.
 *  image is converted to jpeg format
 * @param {Image} image 
 * @param {Number} compressionFactor 
 * @returns {Base64} newDataUrl // modified jpeg image data url
 */
const resizeAndCompressImage = (image, compressionFactor = 0.92) => {
    var canvas = document.createElement('canvas');
    canvas.width = image.width
    canvas.height = image.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0, image.width, image.height);
    const newDataUrl = canvas.toDataURL('image/jpeg', compressionFactor);

    return newDataUrl;
}