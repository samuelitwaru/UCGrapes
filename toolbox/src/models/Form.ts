export class Form {
    FormId: string;
    ReferenceName: string;
    FormUrl: string;
    constructor(FormId: string, ReferenceName: string, FormUrl: string) {
        this.FormId = FormId;
        this.ReferenceName = ReferenceName;
        this.FormUrl = FormUrl;
    }
}