import React, { useState, useEffect } from 'react';

function GetInfo(){
  const [data, setData] = useState(null);

  useEffect(() => {
    // Use the API exposed from the preload script
    window.api.getTailscaleDevices()
      .then(setData)
      .catch(error => {
        console.error('Error fetching Tailscale devices:', error);
        setData({ error: error.message });
      });
  }, []);

  if (!data) {
    return <div>Loading...</div>;
  }
  return data;
};

export default GetInfo;