/**
 * 
 * @param {String} name 
 * name of the json file to read
 */
const readJson = (name) => {
    return new Promise((resolve,reject) => {
        fetch(`./${name}.json`).then(response => {
            return response.json();
        }).then(resolve).catch(reject)
    })
}

const getRequestBodyFromJson = (json) => {
    return {
        attachment:json.attachment,
        venue:json.venue,
        schedule:json.schedule,
        share:[]
    }
} 