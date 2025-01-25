import React, { useState, useEffect } from 'react';
import api from './api';  // Import the Axios instance

const App = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("api/test");  // API call
        setData(response.data);
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };

    fetchData();
  }, []);  // Empty dependency array to run this once on mount

  return (
    <div>
      <h1>API Response</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default App;
