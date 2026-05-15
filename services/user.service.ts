import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { ConflictError, NotFoundError } from "@/utils/apiResponse";

export class UserService {
  static async create(name: string, email: string, password: string) {
    await dbConnect();

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      throw new ConflictError("An account with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: "customer",
    });

    await user.save();
    return user;
  }

  static async getById(id: string) {
    await dbConnect();
    const user = await User.findById(id).select("-password").lean();
    if (!user) throw new NotFoundError("User");
    return user;
  }

  static async getStats() {
    await dbConnect();
    const [total, customers] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "customer" }),
    ]);
    return { total, customers };
  }
}
