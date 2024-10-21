import User from "../../models/security/user.js";
import { UserDTO } from "./dtos/dtosUtilits.js";

export default class UserService {

    public async create(userDTO: UserDTO) {

        const user = await User.create(userDTO);

        console.log(user.$isPersisted) // true

        return user.serialize();
    }

    public async update(userDTO: UserDTO) {

        const foundUser = await User.findOrFail(userDTO.id);
        return await foundUser.merge(userDTO).save();
    }

    public async inactive(userDTO: UserDTO) {

        const foundUser = await User.findOrFail(userDTO.id);
        return await foundUser.merge({ active: false }).save();
    }

    public async active(userDTO: UserDTO) {

        const foundUser = await User.findOrFail(userDTO.id);
        return await foundUser.merge({ active: true }).save();
    }

    public static async findAll() {
        return await User.all();
    }

    public async findById(id: number) {
        return await User.findOrFail(id);
    }

    //  public async findBy(userFilter: UserFilters) {
    // return await User.findBy(userFilter);
    //}
}