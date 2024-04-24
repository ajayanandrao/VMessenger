import React, { useContext, useEffect, useRef, useState } from 'react';
import smsSound from './../Assets/ring.mp3';
import { AuthContext } from '../AuthContaxt';

const Ring = () => {
    const audioRef = useRef(null); // Create a ref for the audio element
    const { currentUser } = useContext(AuthContext);
    return (
        <div>
            <audio
                autoPlay
                onError={(e) => console.error("Audio Error:", e)}
                ref={audioRef} // Attach the ref to the audio element
            >
                <source src={smsSound} type="audio/mpeg" />

            </audio>

        </div>
    );
}

export default Ring;
