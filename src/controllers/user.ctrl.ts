import { Request, Response } from "express";
import { UserService } from "../services";

export const getAll = async (req: Request, res: Response) => {
  try {
    const users = await UserService.findAll();
    res.status(200).send(users);
  } catch (error) {
    res.send({
      msg: "Not found",
      status: 404
    });
  }
};

export default { getAll };
