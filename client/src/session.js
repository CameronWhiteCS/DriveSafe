import Cookies from 'universal-cookie';
import axios from 'axios';

const startSession = (token) => {
    const cookies = new Cookies();
    cookies.set('token', token, {sameSite: 'lax', expires: new Date(Date.now() + 24 * 7 * 1000000)});
}

const endSession = () => {
    console.log('Attempting to end session...');
    const cookies = new Cookies();
    const token = cookies.get('token');
    if(!token) {
        console.log('Session token not found, no session to end. ¯\\_(ツ)_/¯');
        return;
    }
    cookies.remove('token');
    axios.post('/php/api/users/signout.php', {token: token}).then((res) => {
        if(res.data.error) {
            console.log('Error ending session: ' + res.data.error);
        } else {
            console.log('Session ended on server side.');
        }
    });
}

const signedIn = () => {
    return new Cookies().get('token') !== undefined;
}

const loadProfile = (setUserData) => {
    console.log('Attempting to load profile using session token stored as cookie.');
    const cookies = new Cookies();
    if(!cookies.get('token')) {
        console.log('Cookie not found, aborting. ');
        return;
    }
    axios.get('/php/api/users/users.php?token=' + cookies.get('token')).then((res) => {
        if(res.data.error) {
            console.log('An error occurred while attempting to load profile data using stored session token.');
            console.log('Invalid session? Removing cookie.');
            cookies.remove('token');
        } else {
            setUserData(res.data);
            console.log('Profile data loaded successfully.');
            console.log(res.data);
        }
    });
}

export {startSession, endSession, loadProfile, signedIn}