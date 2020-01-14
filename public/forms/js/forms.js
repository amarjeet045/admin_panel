/**
 * 
 * @param {String} name 
 * name of the json file to read
 */
const readJson = (name) => {
    return new Promise((resolve, reject) => {
        fetch(`./${name}.json`).then(response => {
            return response.json();
        }).then(resolve).catch(reject)
    })
}

const getRequestBodyFromJson = (json, dataObject, isCreate) => {
    if (isCreate) {

        return {
            attachment: json.attachment,
            venue: json.venue,
            schedule: json.schedule,
            share: [],
            template: json.name,
            office:dataObject.office

        }
    }
    return dataObject;
}

function fillFormInputs(dataObject) {
    const isInput = {
        'string': true,
        'number': true,
        'amount': true,
        'date': true
    }

    for (key in dataObject.attachment) {
        if (isInput[dataObject.attachment[key].type]) {
            document.querySelector(`[data-field="${key}"]`).value = dataObject.attachment[key].value
        }
    }
}