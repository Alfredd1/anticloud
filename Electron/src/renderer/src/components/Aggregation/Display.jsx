import React from "react";
import DeviceIps from "../Tailscale/DeviceIps"

function Display(){
    const finalFolders = {};
    const finalFiles = {};
    const ips = <DeviceIps/>;
    const [data, setData] = useState(null);

    ips.forEach(ip => {
            useEffect(() => {
        // Include api location 
        ip = String(ip)
        fetch("https://" + ip + ":3000/api/ls" + {PATH})
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
    });
    //Add to folders and add to files dictionary.The name will be the key and the value will be 1, if a file or folder appears more than once then it does not get added to the dictionary.

}
export default Display;