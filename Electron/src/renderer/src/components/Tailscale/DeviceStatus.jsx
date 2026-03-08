import React, { useState, useEffect } from 'react';

function DeviceStatus() {
    const [devices, setDevices] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        window.api.getTailscaleStatus()
            .then(data => {
                setDevices(data);
            })
            .catch(err => {
                console.error('Error fetching Tailscale status:', err);
                setError(err.message);
            });
    }, []);

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!devices) {
        return <div>Loading device status...</div>;
    }

    return (
        <div>
            <h2>Device Status (from CLI)</h2>
            <ul>
                {devices.map(device => (
                    <li key={device.hostname}>
                        <strong>{device.hostname}</strong>: {device.online ? 'Online' : 'Offline'}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default DeviceStatus;