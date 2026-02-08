import type { Request, Response } from "express";
import User from "../models/User";
import Project from "../models/Project";
export class TeamMemberController {
  static findMemberByEmail = async (req: Request, res: Response) => {
    const { email } = req.body;
    const user = await User.findOne({ email }).select("id email name");
    if (!user) {
      const error = new Error("User not found");
      res.status(404).json({ error: error.message });
    }
    return res.json({ user });
  };
  static getProjectTeam = async (req: Request, res: Response) => {
    const project = await Project.findById(req.project._id).populate({
      path: "team",
      select: "id email name",
    });
    res.json(project.team);
  };
  static addMemberById = async (req: Request, res: Response) => {
    const { id } = req.body;
    const user = await User.findById(id).select("id");
    if (!user) {
      const error = new Error("User not found");
      return res.status(404).json({ error: error.message });
    }

    if (
      req.project.team.some((team) => team.toString() === user._id.toString())
    ) {
      const error = new Error("The user already exist in this project");
      return res.status(409).json({ error: error.message });
    }
    req.project.team.push(user._id);
    await req.project.save();

    return res.send("User added successfully");
  };
  static removeMemberById = async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
      if (!req.project.team.some((team) => team.toString() === userId)) {
        const error = new Error("The user doen't exist in this project");
        return res.status(409).json({ error: error.message });
      }
      req.project.team = req.project.team.filter(
        (teamMember) => teamMember.toString() !== userId,
      );

      req.project.save();
      return res.send("Memeber remove succesfully")
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "There was an error" });
    }
  };
}
