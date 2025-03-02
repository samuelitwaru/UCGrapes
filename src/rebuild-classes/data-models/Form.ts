export class Form {
    FormId: string;
    ReferenceName: string;
    FormUrl: string;
    constructor(FormId, ReferenceName, FormUrl) {
        this.FormId = FormId;
        this.ReferenceName = ReferenceName;
        this.FormUrl = FormUrl;
    }
}