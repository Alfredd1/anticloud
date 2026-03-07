const {ipcMain} = require("electron"); // process listener
const {exec} = require("child_process");

export function get_devices_infos(){
  exec("tailscale status --json", (err, stdout) => { // (terminal command, arrow func)
    if (err){ // write errors
      return;
    }

    return JSON.parse(stdout); // write all devices
  })
}



