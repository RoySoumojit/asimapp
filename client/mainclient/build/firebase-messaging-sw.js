importScripts('https://www.gstatic.com/firebasejs/5.7.2/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/5.7.2/firebase-messaging.js');

var firebaseConfig = {
    apiKey: "AIzaSyBT5aXT1mC1LBcT-4WPYumEzagrsnamXYI",
    authDomain: "asimmath.firebaseapp.com",
    databaseURL: "https://asimmath.firebaseio.com",
    projectId: "asimmath",
    storageBucket: "asimmath.appspot.com",
    messagingSenderId: "125226910718",
    appId: "1:125226910718:web:d36e16a2633c01eb5f76af"
  };
  firebase.initializeApp(firebaseConfig)
  const messaging=firebase.messaging()
  messaging.setBackgroundMessageHandler(function(payload){
      const title=payload.data.title
      const options={
          body:payload.data.status,
          image:'./logo192.png',
          icon:'./favicon.ico'
      }
      return self.registration.showNotification(title,options);
  });