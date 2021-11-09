
import Post from "src/posts/post.entity";
import Address from "./address.entity";

export interface User {
    id: number;
    fullName?: string;
    businessName: string;
    username?: string;
    email?: string;
    phoneNumber: string;
    password?: string;
    role?: UserRole;
    profileImage?: string;
    posts?: Post[];
    address: Address;
    isEmailConfirmed: false;
    isAdmin: false
}

export enum UserRole {
    ADMIN = 'admin',
    CHIEFEDITOR = 'chiefeditor',    
    EDITOR = 'editor',
    USER = 'user'
}