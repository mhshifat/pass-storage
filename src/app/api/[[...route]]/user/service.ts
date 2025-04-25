import { SignUpFormPayloadWithEncryptedData } from "@/lib/types";
import { UserRepo } from "./repo";

export class UserService {
  constructor(
    private _repo: UserRepo
  ) {
    this._repo = _repo;
  }

  async create(body: SignUpFormPayloadWithEncryptedData) {
    return this._repo.create(body);
  }

  async findByEmail(email: string, includes?: string[]) {
    return this._repo.findByEmail(email, includes);
  }

  async findById(id: string, includes?: string[]) {
    return this._repo.findById(id, includes);
  }

  async findByIds(ids: string[], includes?: string[]) {
    return this._repo.find({ ids }, includes);
  }
}
