import React from 'react';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import Home from './components/Home.js';
import AppNav from './components/AppNav.js'
import Signup from './components/Signup.js'
import Signout from './components/Signout.js'
import Signin from './components/Signin.js';
import Quizzes from './components/Quizzes.js';
import ControlPanel from './components/ControlPanel.js';
import GroupManager from './components/GroupManager/GroupManager.js';
import QuizManager from './components/QuizManager/QuizManager.js';
import QuizPanel from './components/QuizManager/QuizPanel.js';
import TakeQuiz from './components/TakeQuiz.js';
import Profile from './components/Profile.js';
import { loadProfile } from './session.js';
import EditProfile from './components/EditProfile.js';
import AccidentReport from './components/AccidentReport.js';
import AccidentSummary from './components/AccidentSummary.js';
function App() {

  const [userData, setUserData] = useState(null);

  const hasPermission = (permission) => {
    if (userData === null) return false;
    let output = false;
    userData.permissions.forEach((p) => {
      if (p === permission) {
        output = true;
        return;
      }
    });
    userData.groups.forEach((group) => {
      group.permissions.forEach((p) => {
        if (p === permission) {
          output = true;
          return;
        }
      });
    });
    return output;
  }

  useEffect(() => loadProfile(setUserData), []);

  return (

    <Router>
      <AppNav hasPermission={hasPermission} userData={userData} />
      <div style={{ width: '95%', margin: '0', padding: '0' }}>
        <br />
        <Route exact path="/signup" render={() => <Signup setUserData={setUserData} />} />
        <Route exact path="/" render={() => <Home />} />
        <Route exact path="/signout" render={() => <Signout setUserData={setUserData} />} />
        <Route exact path="/signin" render={() => <Signin setUserData={setUserData} />} />
        <Route exact path="/quizzes" render={() => <Quizzes />} />
        <Route exact path="/quizzes/:id" render={() => <TakeQuiz />} />
        <Route exact path="/admin" render={() => <ControlPanel hasPermission={hasPermission} />} />
        <Route exact path="/admin/groupmanager" render={() => <GroupManager />} />
        <Route exact path="/admin/quizmanager" render={() => <QuizManager />} />
        <Route exact path="/admin/quizmanager/edit/:quizId" render={() => <QuizPanel />} />
        <Route exact path="/profile/edit/" render={() => <EditProfile userData={userData}/>}/>
        <Route exact path="/profile/" render={() => <Profile userData={userData}/>}/>
        <Route exact path="/accidents/create" render={() => <AccidentReport hasPermission={hasPermission}/>}/>
        <Route exact path="/accidents/summary" render={() => <AccidentSummary hasPermission={hasPermission}/>}/>
      </div>
    </Router>

  );
}

export default App;
