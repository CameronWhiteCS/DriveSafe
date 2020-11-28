import { useEffect } from 'react';
import Cookies from 'universal-cookie';
import {useHistory} from 'react-router-dom';
import { endSession } from '../session';

const Signout = (props) => {
    
    const history = useHistory();

    useEffect(() => {
        const cookies = new Cookies();
        const token = cookies.get('token');
        if(token){
            endSession();
            props.setUserData(null);
        }
        history.push('/');
    });

    return (<p></p>);

}

export default Signout;