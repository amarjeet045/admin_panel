// export const mode='production'
export const mode = 'production'
export const firebaseConfig = () => {
if(mode === 'production') {
    return {
        apiKey: "AIzaSyA4s7gp7SFid_by1vLVZDmcKbkEcsStBAo",
        authDomain: "growthfile-adminpanel.firebaseapp.com",
        projectId: "growthfile-207204",
        messagingSenderId: "701025551237"
    }
}
return {
    apiKey: "AIzaSyCadBqkHUJwdcgKT11rp_XWkbQLFAy80JQ",
    authDomain: "growthfilev2-0.firebaseapp.com",
    projectId: "growthfilev2-0",
    messagingSenderId: "1011478688238"
  }
}
export const apiBaseUrl = () =>{
    return mode === 'production' ? 'https://api2.growthfile.com/api/' : 'https://us-central1-growthfilev2-0.cloudfunctions.net/api/'
}

