import React, { useState, useEffect } from 'react';

function DeviceIps() {
    const [ips, setIps] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
      // Use the API exposed from the preload script
      window.api.getTailscaleDevices()
        .then((devices) => {
            console.log('Devices:', devices);
            const extractedIps = devices.map(d => d.addresses?.[0] || d.tailscaleIPs?.[0]).filter(Boolean);
            setIps(extractedIps);
        })
        .catch(err => {
          console.error('Error fetching Tailscale device IPs:', err);
          setError(err.message);
        });
    }, []);

    if (error) {
        return <div style={{ color: 'red' }}>Error: {error}</div>;
    }

    if (ips.length === 0) {
        return <div>No IPs found. Check the terminal for API errors.</div>;
    }

    return (
        <div>
            <h2>Device IPs</h2>
            <ul>
                {ips.map(ip => <li key={ip}>{ip}</li>)}
            </ul>
        </div>
    );
};

export default DeviceIps;