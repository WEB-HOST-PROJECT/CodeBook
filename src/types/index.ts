export interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
}

export interface Question {
    id: string;
    title: string;
    description: string;
}

export interface Submission {
    id: string;
    studentId: string;
    studentName: string;
    questionId: string;
    questionTitle: string;
    code: string;
    timestamp: any;
    marks?: number;
    feedback?: string;
    reviewed?: boolean;
}