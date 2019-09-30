 const sortByLatest = (data) => {
     return data.slice(0).sort((a, b) => {
         return b.lastModifiedDate - a.lastModifiedDate
     })
 }

 export {
     sortByLatest
 }