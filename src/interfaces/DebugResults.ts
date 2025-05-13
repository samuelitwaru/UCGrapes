export interface DebugResults {
    Summary: {
        TotalUrls: string;
        SuccessCount: string;
        FailureCount: string;
    };
    Pages: {
        Page: string;
        UrlList: {
            Url: string;
            StatusCode: number;
            StatusMessage: string;
            AffectedType: string;
            AffectedName: string;
        }[];
    }[];
}
