export interface Template {
    Id: string;
    Rows: Array<{
        Id: string;
        Tiles: Array<{
            Id: string;
            Name: string;
            Text: string;
            Color: string;
            Align: string;
            Icon: string;
            BGColor: string;
            BGImageUrl: string;
            Opacity: string;
            Action: {
                ObjectType: string;
                ObjectId: string;
                ObjectUrl: string;
            }
        }>
    }>
}