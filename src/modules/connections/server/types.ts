export interface IConnectionDto {
    id: number;
    name: string;
    description?: string;
    type: string;
    created_at: Date;
    updated_at: Date;
}