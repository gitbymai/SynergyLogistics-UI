export interface JobTransactionType{
    jobTransactionTypeId: number;
    jobTransactionTypeCode: string;
    jobTransactionTypeGuid: string;
    jobTransactionType: string;
    jobTransactionTypePrefix: string;
    isActive: boolean;
}

export interface NewJobTransactionType{
    jobTransactionType: string;
    jobTransactionTypePrefix: string;
}