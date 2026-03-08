import React, { useState, useEffect } from 'react';

function GetDeviceList() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.api.getTailscaleDevices()
      .then((data) => {
        if (data) {
          console.log("Raw Data:", data);

          // OPTION A: If the data IS the object of devices
          const deviceArray = Object.values(data);

          // OPTION B: If devices are tucked inside a key (e.g., data.devices)
          // const deviceArray = Object.values(data.devices || {});

          // Change this in your useEffect
          setDevices(Object.values(data.devices || data));
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <ul>
      {devices.map((d, i) => (
        <li key={i}>{d.hostname} - {d.connectedToControl ? "🟢" : "🔴"}</li>
      ))}
    </ul>
  );
}

export default GetDeviceList;
