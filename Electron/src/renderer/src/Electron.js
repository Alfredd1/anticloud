const {ipcMain} = require("electron"); // process listener
const {exec} = require("child_process");

export function get_devices_infos(){
  exec("tailscale status --json", (err, stdout) => { // (terminal command, arrow func)
    if (err){ // write errors
      console.error(err);
      return;
    }

    const devices = JSON.parse(stdout); // write all devices
    console.log(devices);

  })
}



