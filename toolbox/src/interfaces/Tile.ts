export interface Tile {
    Id: string;
    Name?: string;
    Text?: string;
    Color?: string;
    Align?: string;
    Icon?: string;
    BGColor?: string;
    BGImageUrl?: string;
    Opacity?: number;
    Permissions?: [];
    Action?: {
        ObjectType?: string;
        ObjectId?: string;
        ObjectUrl?: string;
    };
}