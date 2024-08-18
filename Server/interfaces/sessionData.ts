interface SessionData {
    owner: string;
    created_at: string;
}

export default class Session implements SessionData {
    owner: string;
    created_at: string;

    constructor(
        owner: string,
        created_at: string
    ) {
        this.owner = owner;
        this.created_at = created_at;
    }

    public static fromJSON(json: string): Session {
        const data: SessionData = JSON.parse(json);
        return new Session(
            data.owner,
            data.created_at
        );
    }

    public toJSON(): string {
        return JSON.stringify({
            owner: this.owner,
            created_at: this.created_at
        })
    }
}
