import { MailListener } from "mail-listener6";   

var mailListener = new MailListener({
  username: "hastyar.braille@gmail.com",
  password: "dxittjbqmcfewjwa",
  host: "imap.gmail.com",
  port: 993, // imap port
  tls: true,
  connTimeout: 10000, // Default by node-imap
  authTimeout: 5000, // Default by node-imap,
  tlsOptions: { rejectUnauthorized: false },
  mailbox: "INBOX", // mailbox to monitor
  searchFilter: ["UNSEEN"], // the search filter being used after an IDLE notification has been retrieved
  markSeen: true, // all fetched email willbe marked as seen and not fetched next time
  fetchUnreadOnStart: false, // use it only if you want to get all unread email on lib start. Default is `false`,
  attachments: true, // download attachments as they are encountered to the project directory
  attachmentOptions: { directory: "attachments/" } // specify a download directory for attachments
});

// start listening
// mailListener.start(); 

// stop listening
//mailListener.stop();

mailListener.on("server:connected", function(){
  console.log("Mail Server Connected!!!");
});

// mailListener.on("mailbox", function(mailbox){
//   console.log("Total number of mails: ", mailbox.messages.total); 
//   // this field in mailbox gives the total number of emails
// });

mailListener.on("server:disconnected", function(){
  console.log("Mail Server Disconnected");
});

mailListener.on("error", function(err){
  console.log(err);
});

// mailListener.on("headers", function(headers, seqno){
//   // do something with mail headers
// });

// mailListener.on("body", function(body, seqno){
//   // do something with mail body
//   console.log(body);
// })

// mailListener.on("attachment", function(attachment, path, seqno){
//   // do something with attachment
// });

// mailListener.on("mail", function(mail, seqno) {
//   // do something with the whole email as a single object
//   console.log("something new came!!!")
//   console.log(`${mail.text} from ${mail.from.value[0].name}`);
// });

export default mailListener;