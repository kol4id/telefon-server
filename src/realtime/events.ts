
export interface ServerToClientEvent {
    personalMessage: (payload: string) => void;
}