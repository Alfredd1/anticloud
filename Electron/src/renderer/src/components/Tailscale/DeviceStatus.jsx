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
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
      <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Device Status</h2>
      </div>

      <ul className="flex flex-row divide-x divide-gray-300 min-h-[80px]">
        {devices.map((device) => (
          <li
            key={device.hostname}
            className={`flex-1 flex flex-col items-center justify-center p-4 transition-colors
            ${device.online
              ? 'bg-white'
              : 'bg-gray-100 bg-[linear-gradient(45deg,_rgba(209,213,219,0.4)_25%,_transparent_25%,_transparent_50%,_rgba(209,213,219,0.4)_50%,_rgba(209,213,219,0.4)_75%,_transparent_75%,_transparent)] bg-[length:10px_10px]'
            }`}
          >
          <span className={`font-mono text-sm font-bold ${device.online ? 'text-gray-900' : 'text-gray-500'}`}>
            {device.hostname}
          </span>

            <span className={`text-xs mt-1 px-2 py-0.5 rounded-full font-medium
            ${device.online
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-200 text-gray-600'
            }`}
            >
            {device.online ? 'Online' : 'Offline'}
          </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DeviceStatus;
