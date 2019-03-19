const mode='production'
const mode = 'dev'
export const firebaseConfig = () => {
if(mode === 'production') {
    return
}
return {
    apiKey: "AIzaSyCadBqkHUJwdcgKT11rp_XWkbQLFAy80JQ",
    authDomain: "growthfilev2-0.firebaseapp.com",
    databaseURL: "https://growthfilev2-0.firebaseio.com",
    projectId: "growthfilev2-0",
    storageBucket: "growthfilev2-0.appspot.com",
    messagingSenderId: "1011478688238"
  }
}
