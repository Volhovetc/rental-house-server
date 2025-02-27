const { validationResult } = require("express-validator");
require("dotenv").config();
const Users = require("../models/Users");
const task = require("../models/task");
const nodemailer = require("nodemailer");
const passwordHash = require("password-hash");
const jwt = require("jsonwebtoken");
const generatePassword = require("password-generator");

class UserController {
  async registration(req, res, next) {
    try {
      const error = validationResult(req);
      if (!error.isEmpty()) {
        return res.status(400).json({ type: "error", value: error.array() });
      }
      const pass = customPassword();
      const hashedPassword = passwordHash.generate(pass);
      const { email } = req.body;
      const candidate = await Users.findOne({ email });
      if (candidate && candidate._doc.isVerificated) {
        return res
          .status(400)
          .json({ type: "error", value: "Такой email уже зарегистрирован" });
      }

      if (candidate && !candidate._doc.isVerificated) {
        await Users.findOneAndUpdate(
          { email: email },
          { ...candidate._doc, hashedPassword: hashedPassword }
        );
        sendMail(email, pass);
        return res.status(200).json({
          type: "data",
          value: false,
        });
      }
      let date = new Date();
      const user = new Users({
        email,
        hashedPassword,
        isVerificated: false,
        created_at: `${date.getDate()} - ${
          date.getMonth() + 1
        } - ${date.getFullYear()}`,
      });
      await user.save();
      sendMail(email, pass);
      return res.status(200).json({
        type: "data",
        value: true,
      });
    } catch (e) {
      return res.status(500).json({ message: e.message });
    }
  }
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const error = validationResult(req);
      if (!error.isEmpty()) {
        return res.status(400).json({ errors: error.array() });
      }
      const candidate = await Users.findOne({ email });
      if (
        candidate &&
        passwordHash.verify(password, candidate.hashedPassword)
      ) {
        const accessToken = jwt.sign(
          { userId: candidate._doc._id, role: candidate.role },
          process.env.JWT_SECRET,
          { expiresIn: "1m" }
        );
        const refreshToken = jwt.sign(
          { userId: candidate._doc._id, role: candidate.role },
          process.env.JWT_SECRET,
          { expiresIn: "30d" }
        );

        if (!candidate._doc.isVerificated) {
          await Users.findOneAndUpdate(
            { email: email },
            { isVerificated: true }
          );
        }

        const options = {
          path: "/",
          httpOnly: true,
          signed: true,
          secure: "auto",
          sameSite: "lax",
          maxAge: 1000 * 60 * 60 * 24 * 30,
        };

        const tokens = JSON.stringify({
          accessToken: accessToken,
          refreshToken: refreshToken,
        });
        res.cookie("tokens", tokens, options);

        await Users.findOneAndUpdate(
          { email: email },
          { tokenRefresh: refreshToken }
        );
        res.send({
          value: { isBrief: candidate.isBrief },
          type: "data",
        });
      } else {
        res.status(500).json({ type: "error", value: "Неверные данные" });
      }
    } catch (e) {
      return res.status(500).json({ message: e.message });
    }
  }
  async brief(req, res, next) {
    try {
      const User = await Users.findOne({ _id: req.body._id });
      if (!User)
        return res
          .status(404)
          .json({ type: "error", value: "Пользователь не найден" });

      const { name, surname, lastname, phoneNumber, _id } = req.body;
      await Users.findOneAndUpdate(
        { _id: _id },
        {
          ...User._doc,
          name: name,
          surname: surname,
          lastname: lastname,
          phoneNumber: phoneNumber,
          isBrief: true,
        }
      );
      res.status(200).json({ type: "data" });
    } catch (e) {
      return res.status(500).json({ message: e.message });
    }
  }
  async profile(req, res, next) {
    try {
      const User = await Users.findOne({ _id: req.body._id });
      if (!User)
        return res
          .status(404)
          .json({ type: "error", value: "Пользователь не найден" });

      const dto = DTO(User);
      res.status(200).json({ type: "success", value: { ...dto } });
    } catch (e) {
      return res.status(500).json({ message: e.message });
    }
  }
  async users(req, res) {
    try {
      const users = await Users.find({});
      if (!users)
        return res
          .status(404)
          .json({ type: "error", value: "Пользователей нет" });

      const usersFilter = users.filter((user) => user.name);
      const usersDTO = usersFilter.map((e) => DTO(e));
      res.status(200).json({ type: "success", value: usersDTO });
    } catch (e) {
      return res.status(500).json({ message: e.message });
    }
  }
  async addtask(req, res, next) {
    try {
      const { from, to, text } = req.body;
      let date = new Date();
      const newTask = new task({
        from,
        to,
        text,
        created: `${date.getDate()}-${
          date.getMonth() + 1
        }-${date.getFullYear()}`,
      });
      await newTask.save();
      return res.status(200).json({
        type: "data",
        value: true,
        text: "задача поставлена",
      });
    } catch (e) {
      return res.status(500).json({ message: e.message });
    }
  }
  async gettasks(req, res) {
    try {
      const tasks = await task.find({});
      if (!tasks)
        return res.status(404).json({ type: "error", value: "Задач нет" });
      res.status(200).json({ type: "success", value: [...tasks] });
    } catch (e) {
      return res.status(500).json({ message: e.message });
    }
  }
  async gettasks(req, res) {
    try {
      const tasks = await task.find({});
      if (!tasks)
        return res.status(404).json({ type: "error", value: "Задач нет" });
      res.status(200).json({ type: "success", value: [...tasks] });
    } catch (e) {
      return res.status(500).json({ message: e.message });
    }
  }
  async updatetask(req, res) {
    try {
      const { id, done, text, to } = req.body;
      const updateTask = await task.findOneAndUpdate(
        { _id: id },
        { done: done, text: text, to: to }
      );
      if (!updateTask)
        return res
          .status(404)
          .json({ type: "error", value: "Задача не найдена" });
      return res.status(200).json({
        type: "data",
        value: true,
      });
    } catch (e) {
      return res.status(500).json({ message: e.message });
    }
  }
}

module.exports = new UserController();

const sendMail = async (email, pass) => {
  const transporter = nodemailer.createTransport({
    host: process.env.HOSTNAME,
    port: 465,
    secure: true,
    auth: {
      user: process.env.BOT,
      pass: process.env.PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
  await transporter.sendMail({
    from: process.env.BOT,
    to: email,
    subject: "Создание аккаунта",
    text: `Ваш пароль для входа: ${pass}`,
  });
};

function isStrongEnough(password) {
  const uc = password.match(/([A-Z])/g);
  const lc = password.match(/([a-z])/g);
  const n = password.match(/([\d])/g);
  const sc = password.match(/([\?\-])/g);
  const nr = password.match(/([\w\d\?\-])\1{2,}/g);
  return (
    password.length >= 12 &&
    !nr &&
    uc &&
    uc.length >= 3 &&
    lc &&
    lc.length >= 3 &&
    n &&
    n.length >= 2 &&
    sc &&
    sc.length >= 2
  );
}

function customPassword() {
  let password = "";
  const randomLength = Math.floor(Math.random() * (18 - 12)) + 12;
  while (!isStrongEnough(password)) {
    password = generatePassword(randomLength, false, /[\w\d\?\-]/);
  }
  return password;
}

const DTO = (User) => {
  const { name, surname, lastname, phoneNumber, role, _id } = User;
  return {
    name: name,
    surname: surname,
    lastname: lastname,
    phoneNumber: phoneNumber,
    role: role,
    id: _id,
  };
};
