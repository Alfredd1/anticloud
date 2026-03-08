import React, { useState, useEffect } from 'react';

function TreeView(){
    const [finalFolders, setFinalFolders] = useState({});
    const [finalFiles, setFinalFiles] = useState({});
    const [currentPath, setCurrentPath] = useState("/Thing/Root");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const devices = await window.api.getTailscaleDevices();
                const ips = devices.map(d => d.addresses?.[0] || d.tailscaleIPs?.[0]).filter(Boolean);
                
                const folders = {};
                const files = {};

                await Promise.all(ips.map(async (ip) => {
                    try {
                        const response = await fetch(`http://${ip}:3000/api/ls`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ path: currentPath })
                        });
                        if (response.ok) {
                            const data = await response.json();
                            if (data.files && Array.isArray(data.files)) {
                                data.files.forEach(item => {
                                    if (item.isDirectory) {
                                        if (!folders[item.name]) folders[item.name] = 1;
                                    } else {
                                        if (!files[item.name]) files[item.name] = 1;
                                    }
                                });
                            }
                        }
                    } catch (error) {
                        console.log(`Error fetching from :`, error);
                    }
                }));

                setFinalFolders(folders);
                setFinalFiles(files);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [currentPath]);

    if (loading) {
        return <div>Loading...</div>;
    }

    const folderItems = Object.keys(finalFolders).map(name => ({ name, type: 'Folder' }));
    const fileItems = Object.keys(finalFiles).map(name => ({ name, type: 'File' }));
    const sortedData = [...folderItems, ...fileItems];

    return (
        <div className='relative overflow-x-auto bg-neutral-primary-soft shadow-xs rounded-base border border-default'>
            <div className="p-4 border-b border-default">
                <h3 className="text-lg font-medium">Current Path: {currentPath}</h3>
            </div>
            <table className='w-full text-sm text-left rtl:text-right text-body'>
                <thead className='bg-neutral-secondary-soft border-b border-default'>
                    <tr>
                        <th scope='col' className='px-6 py-4 font-medium'>Name</th>
                        <th scope='col' className='px-6 py-4 font-medium'>Type</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedData.length > 0 ? (
                        sortedData.map((item, index) => (
                            <tr key={index}
                                className='odd:bg-neutral-primary even:bg-neutral-secondary-soft border-b border-default'>
                                <td className="px-6 py-4">{item.name}</td>
                                <td className="px-6 py-4">{item.type}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="2" className="px-6 py-4 text-center">No files found</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default TreeView;