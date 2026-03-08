import React, { useState, useEffect } from 'react';

function TreeView(){
    const [data, setData] = useState(null);

    useEffect(() => {
        // Include api location
        fetch("https://localhost:3000/api/ls")
        .then(response => response.json())
        .then(data => {
            setData(data);
        })
        .catch(error => {
            console.log(error);
        });
    }, []);

    if (!data) {
        return <div>Loading...</div>;
    }
e
    const folders = data.filter(item => item.type === 'folder');
    const files = data.filter(item => item.type === 'file');
    const sortedData = [...folders, ...files];

    return (
        <div className='relative overflow-x-auto bg-neutral-primary-soft shadow-xs rounded-base border border-default'>
            <table className='"w-full text-sm text-left rtl:text-right text-body'>
                <thead className='bg-neutral-secondary-soft border-b border-default'>
                    <tr>
                        <th scope='col' className='px-6 py-4 font-medium'>Name</th>
                        <th scope='col' className='px-6 py-4 font-medium'>Type</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedData.map((item, index) => (
                        <tr key={index}
                            className='odd:bg-neutral-primary even:bg-neutral-secondary-soft border-b border-default'>
                            <td>{item.name}</td>
                            <td>{item.type}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default TreeView;
