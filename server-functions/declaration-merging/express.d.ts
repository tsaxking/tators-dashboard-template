import { Server } from "socket.io";
import { Session } from "../structure/sessions";

declare global {
    namespace Express {
        interface Request {
            session: Session;
            io: Server;
            start: number;
            ip?: string|null;
        }
    }
}

export = global;