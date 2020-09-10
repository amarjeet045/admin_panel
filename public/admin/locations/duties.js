

const addDuty = document.getElementById("add-duty");
const editIcon = document.getElementById("edit-location")
const ul = document.getElementById("duties-list");
const formHeading = document.getElementById('form-heading');
const dutiesCardContainer = document.getElementById('duties-card--container');

const init = (office, officeId) => {
    const search = new URLSearchParams(window.location.search);
    const canEdit = search.get("canEdit");
    const id = search.get("id");
    const location = search.get("location");

    if (!id) {
        window.alert("No location found");
        return
    }
    formHeading.textContent = location;

    if (canEdit  === "true" && id) {
        editIcon.classList.remove("hidden");
        editIcon.href = './createDuty?id=' + id
    }


    window
        .database
        .transaction("locations")
        .objectStore("locations")
        .get(location)
        .onsuccess = function (e) {
            const record = e.target.result;
            const duties = record.duties || [];
            const sorted = duties.sort((a, b) => b.timestamp - a.timestamp);

            sorted.forEach(duty => {
                dutiesCardContainer.appendChild(createDutyBox(duty, location))
            });

            http('GET', `${appKeys.getBaseUrl()}/api/office/${officeId}/location?location=${location}`).then(res => {
                window
                    .database
                    .transaction("locations", 'readwrite')
                    .objectStore("locations").put(res.results[0]);
                    const freshDuties =  res.results[0].duties || []
                    freshDuties.sort((a, b)=> b.timestamp - a.timestamp).forEach(duty=>{
                        dutiesCardContainer.appendChild(createDutyBox(duty, location))
                    })
            })
        }
}


const createDutyBox = (duty, location) => {

    const clone = document.getElementById('clone-node').cloneNode(true);
    clone.querySelector('.heading').textContent = 'Duty ' + location;
    if (!duty.canEdit) {
        clone.querySelector('.edit-duty').remove();
    } else {
        clone.querySelector('.edit-duty').href = `./manageDuty?id=${duty.id}`
    }
    clone.querySelector('.duty-start').value = moment(duty.startTime).format('HH:mm a')
    clone.querySelector('.duty-end').value = moment(duty.endTime).format('HH:mm a')

    const ul = clone.querySelector('#assignees-list');
    duty.assignees.splice(1, 3).forEach(assignee => {
        ul.appendChild(createDutyAssignee(assignee))
    });
    const showMore = clone.querySelector('.view-all')
    if (duty.assignees.length === 3) {
        showMore.classList.add('hidden')
    }

    let areAllOpen = false
    showMore.addEventListener('click', () => {
        areAllOpen = !areAllOpen
        duty.assignees.splice(3, duty.assignees.length - 1).forEach(assignee => {
            const li = createDutyAssignee(assignee)
            if (areAllOpen) {
                ul.appendChild(li)
            } else {
                li.remove();
            }
        });
        showMore.textContent = areAllOpen ? 'Show less' : 'Show more';
    });
    clone.classList.remove('hidden');
    return clone;
}

const createDutyAssignee = (assignee) => {
    const li = createElement('li', {
        className: 'mdc-list-item'
    })

    const img = createElement('img', {
        src: assignee.photoURL || '../../person.png',
        className: 'mdc-list-item__graphic'
    })
    const span = createElement('span', {
        textContent: assignee.displayName
    })
    li.appendChild(img);
    li.appendChild(span);
}