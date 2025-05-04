import React, { useState , useEffect } from "react";
import { useStore } from "../../Store/store";
import api from "../../api";
import { BarChart, Bar , ResponsiveContainer , Tooltip , XAxis , YAxis } from "recharts";
import "../Pro/Pro.css";


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
        
    }, [myProfile]);

    // console.log(proData, 'proData');

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

    const chartData = [
        { name: "Feature A", value: 400 },
        { name: "Feature B", value: 300 },
        { name: "Feature C", value: 200 },
        { name: "Feature D", value: 278 },
        { name: "Feature E", value: 189 },
      ];

    return(
    <div className="pro-version-container">
      <div className="pro-version-responsive-container">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart width={150} height={40} data={chartData}>
          <Bar dataKey="value" fill="#8884d8" />
          <Tooltip />
          <XAxis dataKey="name" hide />
          <YAxis hide />
        </BarChart>
      </ResponsiveContainer>
      </div>
      <div className="pro-total-friends-tracker">
        Total Hours Spent: 10
      </div>
    </div>
    )
};

export default Pro;