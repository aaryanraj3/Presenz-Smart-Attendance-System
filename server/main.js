import "../imports/api/methods";
import "./publish";
import { Email } from "meteor/email";
import { ExcelFiles } from "../imports/api/files";
import XLSX from "xlsx";
Meteor.methods({
  sendEmailPassword: function (data) {
    this.unblock();
    Email.send({
      to: data.email,
      from: "aaryanraj7273@gmail.com",
      subject: "Welcome to Presenz " + data.username + "!",
      text:
        "Congrats " +
        data.username +
        "! An account as been created for you! Please use your username - " +
        data.username +
        " and the password - " +
        data.password +
        " to login on the presenz website! You may change the password from the website!",
    });
  },

  processExcel: function (id) {
    console.log("ID IS", id);
    let fileLink = ExcelFiles.findOne({ _id: id }).link();
    console.log(fileLink);
    HTTP.get(
      fileLink,
      { responseType: "arraybuffer" },
      function (error, result) {
        let data = new Uint8Array(result.content);
        let arr = new Array();
        for (let i = 0; i !== data.length; ++i)
          arr[i] = String.fromCharCode(data[i]);
        let bstr = arr.join("");

        let workbook = XLSX.read(bstr, { type: "binary" });
        var first_sheet_name = workbook.SheetNames[0];
        let sheet = workbook.Sheets[first_sheet_name];
        let parsed = XLSX.utils.sheet_to_json(sheet);
        console.log(parsed);
        parsed.map((a) => {
          Meteor.call("create.student", a);
        });
      }
    );
  },
});
Meteor.startup(() => {
  console.log("started and sent");

  const smtp = {
    username: "aaryanraj7273@gmail.com",
    password: "dohzzolpchmmzlsq",
    server: "smtp.gmail.com",
    port: 465,
  };

  process.env.MAIL_URL = `smtps://${encodeURIComponent(
    smtp.username
  )}:${encodeURIComponent(smtp.password)}@${smtp.server}:${smtp.port}`;

  if (Meteor.users.find({}).count() === 0) {
    console.log("Default users created successfully");

    const users = [
      { username: "instructor", roles: ["teacher"] },
      { username: "admin", roles: ["admin"] },
    ];

    users.forEach((user) => {
      const id = Accounts.createUser({
        username: user.username,
        password: "presenz",
      });

      if (user.roles.length > 0) {
        Roles.addUsersToRoles(id, user.roles);
      }
    });
  }
});
