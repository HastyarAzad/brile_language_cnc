import translate from "./translator.js";
import print from "./CNC.js";
import express from "express";
import cors from "cors";
import mailListener from "./mail_listener_new.js";   

const app = express();

app.use(express.json());
app.use(cors());

mailListener.on("mail", async function(mail, seqno) {
  console.log("something new came!!!");
  let text = "";
  text = text + mail.from.value[0].name;
  text = text + "\n";
  text = text + mail.text;
  console.log(text);
  const translated_text = translate(text);
  // console.log(translated_text);
  await print(translated_text);
});

app.put("/", async (req, res) => {
  const text = req.body.text;
  
  const translated_text = translate(text);
  // console.log(translated_text);
  await print(translated_text);
  res.send(`the text ${text} was printed successfully :)`);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log("listening on: ", PORT));

mailListener.start(); // start listening