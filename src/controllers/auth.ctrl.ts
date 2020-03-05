import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import * as util from "util";
import * as crypto from "crypto";
import * as nodemailer from "nodemailer";
import { check, validationResult, sanitize } from "express-validator";
import { User } from "../models/user";
import { UserService } from "../services";

export const loginValidator = [
  check("email", "Email is not valid").isEmail(),
  check("password", "Password cannot be blank").notEmpty(),
  sanitize("email").normalizeEmail({ gmail_remove_dots: false })
];

export const login = async (req: Request, res: Response) => {
  const errors = validationResult(req);

  if (errors) {
    return res.status(401).send({
      msg: errors,
      code: 406
    });
  }
  try {
    const user: User = await UserService.findByEmail(req.body.email);
    if (!user) {
      return res.status(404).send({
        msg: "User not found",
        code: 404
      });
    }
    const isSamePass = await UserService.comparePassword(
      req.body.password,
      user.password
    );
    if (isSamePass) {
      const token = jwt.sign(
        {
          email: user.email,
          role: user.role,
          username: user.username
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      return res.status(200).send({ token: token });
    } else {
      return res.status(401).send({
        msg: "Unauthorized",
        status: 401
      });
    }
  } catch (error) {
    return res.status(400).send({
      msg: error,
      code: 400
    });
  }
};

export const registerValidator = [
  check("password", "Password cannot be blank").notEmpty(),
  check("fname", "First name must be specified").notEmpty(),
  check("lname", "Last name must be specified").notEmpty(),
  check("username", "Username must be specified").notEmpty(),
  check("role", "Role must be specified").notEmpty(),

  check("email", "Email is not valid").isEmail(),
  sanitize("email").normalizeEmail({ gmail_remove_dots: false })
];

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);

  if (errors) {
    return res.status(401).send({
      msg: errors,
      status: 401
    });
  }
  const user: User = req.body;
  try {
    // Check if user already exists
    const existingUser = await UserService.findByUsernameOrEmail(
      user.username,
      user.email
    );
    if (existingUser) {
      return res.status(409).send({
        msg: "User already exists",
        status: 409
      });
    }
    // Generate activation token
    const qRandomBytes = (util as any).promisify(crypto.randomBytes);
    const cryptedValue = await qRandomBytes(16);
    user.activationToken = cryptedValue.toString("hex");
    user.activationExpires = new Date(Date.now() + 3600000); // 1 hour
    // Send activation email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.NODE_ENV === "production",
      socketTimeout: 5000,
      logger: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });

    const mailOptions = {
      to: user.email,
      from: process.env.SMTP_USER,
      subject: "Account activation",
      text: `You are receiving this email because you (or someone else) have requested account activation.\n\n
          Please click on the following link, or paste this into your browser to complete the process:\n\n
          http://${req.headers.host}/auth/activate/${user.activationToken}\n\n
          If you did not request this, please ignore this email\n`
    };
    await transporter.sendMail(mailOptions);
    const savedUser: User = await UserService.save(user);
    res.status(200).send(savedUser);
  } catch (error) {
    console.log(error);
    res.status(400).send({
      msg: "Unable to send email",
      status: 400
    });
  }
};

export const activate = async (req: Request, res: Response) => {
  try {
    const user: User = await UserService.findOneAndUpdate(
      req.params.activationToken
    );
    const token = jwt.sign(
      {
        email: user.email,
        role: user.role,
        username: user.username
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    return res.status(200).send({ token: token });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      msg: "Activation token expired, please register again",
      status: 400
    });
  }
};

export default { login, loginValidator, register, registerValidator, activate };
