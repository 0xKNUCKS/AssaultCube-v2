interface Token {
    key: string;
    expiry: string; // ISO 8601 string
}

interface Session {
    key: string;
    created_at: string; // ISO 8601 string
}

interface Timestamps {
    created: string; // ISO 8601 string
    last_login: string; // ISO 8601 string
}

interface UserData {
    password: string;
    ip: string;
    token: Token | null;
    session: Session | null;
    timestamps: Timestamps;
}

export default class User implements UserData {
    public password: string;
    public ip: string;
    public token: Token | null;
    public session: Session | null;
    public timestamps: Timestamps;

    constructor(
        password: string,
        ip: string,
        token: Token | null,
        session: Session | null,
        timestamps: Timestamps
    ) {
        this.password = password;
        this.ip = ip;
        this.token = token;
        this.session = session;
        this.timestamps = timestamps;
    }

    public static fromJSON(json: string): User {
        const data: UserData = JSON.parse(json);
        return new User(
            data.password,
            data.ip,
            data.token,
            data.session,
            data.timestamps
        );
    }

    public toJSON(): string {
        return JSON.stringify({
            password: this.password,
            ip: this.ip,
            token: this.token,
            session: this.session,
            timestamps: this.timestamps
        })
    }
}
