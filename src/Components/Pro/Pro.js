import React, { useState , useEffect } from "react";
import { useStore } from "../../Store/store";
import api from "../../api";


const Pro = () => { 
    const { myProfile } = useStore();
    const [proData , setProData] = useState([]);

    useEffect(() => {
        if(!myProfile) return;

        const fetchProVersion = async() => { 
            try { 
                const response = await api.get('/pro/latest');
                console.log(response.data);
                setProData(response.data);
            } catch(error) {
                console.error(error , 'error fetching pro version data');
                throw error;
            }
        };

        fetchProVersion();
        
    }, [myProfile, proData]);

    console.log(proData, 'proData');
    
    const purcashe = async() => { 
        try { 
            const response = await api.post('/pro/purcashe');
            console.log(response.data);
            // setProData(response.data);
            // console.log(proData, 'proData');
        } catch(error) { 
            console.error(error, 'Error posting pro request');
            throw error;
        }
    };


    return(
        <div>Test</div>
    )
};

export default Pro;