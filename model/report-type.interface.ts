export interface ReportTypeResponse {
    success: boolean;
    message: string;
    data: ReportTypeResult[];
    status: number;
}

export interface ReportTypeResult {
    report_type_id: number
    report_type_name: string
    report_type_description: string
    created_at: string
    updated_at: string
}
