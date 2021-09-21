const { Controller } = require("st-ethernet-ip");
const dotenv = require("dotenv");
const express = require("express");

dotenv.config();
const app = express();

const PLC = new Controller();
if (process.env.DEBUG) {
  PLC.on("connect", () => console.log("PLC-> connected"));
  PLC.on("close", () => console.log("PLC-> disconected"));
  PLC.on("error", () => console.log("PLC-> error"));
  PLC.on("timeout", () => {
    console.log("PLC-> error");
    PLC.disconnect();
  });
}

app.get("/", async (req, res) => {
  console.log("GET request");
  await getPaletInfo()
    .then((response) => {
      return res.json(response);
    })
    .catch(() => {
      console.log("Error");
      res.status(500).json({ message: "error" });
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
      res.status(500).json({ message: "error" });
    });
});

async function getTagInfo(tag) {
  //A taglist and structure templates are automatically retrieved after connected
  let response = {};
  await PLC.connect(process.env.PLC_IP_ADDRESS, Number(process.env.PLC_RACK))
    .then(async () => {
      // An array of strings with 1 dimension (only 1 currently supported)
      const tagInfo = PLC.newTag(tag, null, true, 1);
      await PLC.readTag(tagInfo).catch((e) => {
        PLC.disconnect().catch();
        throw e.message;
      });
      console.log("Tag: " + tag + " - Value: " + tagInfo.value);
      if (tagInfo.value.length == undefined) {
        response = {
          tag_name: tag,
          tag_value: tagInfo.value,
        };
      } else {
        response = {
          tag_name: tag,
          tag_value: tagInfo.value[0],
        };
      }
    })
    .catch((e) => {
      PLC.disconnect().catch();
      throw e.message;
    });
  PLC.disconnect().catch();
  return response;
}

async function getPaletInfo() {
  let response = {};
  response = await getTagInfo("UDT_PALET");
  try {
    delete response.tag_value["ZZZZZZZZZZUDT_Palet4"];
  } catch {}
  return response;
}

app.listen(process.env.PORT, function () {
  console.log(
    `Your server is available at http://localhost:${process.env.PORT}`
  );
});
