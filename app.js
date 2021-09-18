const { Controller } = require("st-ethernet-ip");
const express = require("express");

const app = express();

const PLC = new Controller();
PLC.on('connect', ()=> console.log('PLC-> connected'))
PLC.on('close', ()=> console.log('PLC-> disconected'))
PLC.on('error', ()=> console.log('PLC-> error'))

app.get("/", async (req, res) => {
  console.log("GET request");
  await getPaletInfo()
    .then((response) => {
      return res.json(response);
    })
    .catch(() => {
      console.log("Error");
      res.json({ message: "error" });
    });
});

app.get("/tag/:tag", async (req, res) => {
  console.log("GET request");
  await getTagInfo(req.params.tag)
    .then((response) => {
      return res.json(response);
    })
    .catch(() => {
      console.log("Error");
      res.json({ message: "error" });
    });
});

async function getPaletInfo() {
  //A taglist and structure templates are automatically retrieved after connected
  let response = {};
  await PLC.connect("172.31.3.10", 0)
    .then(async () => {
      // An array of strings with 1 dimension (only 1 currently supported)
      const Palet = PLC.newTag("UDT_PALET", null, true, 1);
      await PLC.readTag(Palet);
      console.log("Id: " + Palet.value[0].Id);
      response = Palet.value[0];
      try {
        delete response["ZZZZZZZZZZUDT_Palet4"];
      } catch {}
    })
    .catch((e) => {
      console.log(e);
      response = { message: "error" };
    });
  PLC.disconnect();
  return response;
}

async function getTagInfo(tag) {
  //A taglist and structure templates are automatically retrieved after connected
  let response = {};
  await PLC.connect("172.31.3.10", 0)
    .then(async () => {
      // An array of strings with 1 dimension (only 1 currently supported)
      const tagInfo = PLC.newTag(tag, null, true, 1);
      await PLC.readTag(tagInfo);
      console.log('Tag: ' + tag + " - Value: " + tagInfo.value);
      response = tagInfo.value;
    })
    .catch((e) => {
      console.log(e);
      response = { message: "error" };
    });
  PLC.disconnect();
  return response;
}

app.listen(3000, () => console.log("Server started"));
