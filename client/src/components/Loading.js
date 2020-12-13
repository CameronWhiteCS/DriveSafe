import zIndex from '@material-ui/core/styles/zIndex';
import React from 'react';
import ReactLoading from 'react-loading';


const Loading = (props) => {


    const containerStyle = {
        width: '10%',
        height: '10%',
        position: 'fixed',
        transform: 'translate(-50%, -50%)',
        top: '50%',
        left: '50%',
        zIndex: '9000'
    }

    return (
        <div style={containerStyle}>
                <ReactLoading type={"spokes"} color={"#1966FF"} height={'100%'} width={'100%'} />
        </div>
    );

}

export default Loading;