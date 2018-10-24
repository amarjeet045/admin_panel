import * as login from './assests/js/login';

const config = {
    apiKey: 'AIzaSyA4s7gp7SFid_by1vLVZDmcKbkEcsStBAo',
    authDomain: 'growthfile-207204.firebaseapp.com',
    databaseURL: 'https://growthfile-207204.firebaseio.com',
    projectId: 'growthfile-207204',
    storageBucket: 'growthfile-207204.appspot.com',
    messagingSenderId: '701025551237'
}

firebase.initializeApp(config)
window.addEventListener('load',function(){
    login.initApp()
  })