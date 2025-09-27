export default interface BlogPost {
    id: number;
    Title: string;
    canonicalURL: string;
    coverImage?: {
        id: number;
        url: string
        altText?: string;
    } | null;
    Published: string; // ISO date string
    Category: "HomeLab" | "Programming" | "Website" | "MachineLearning" | "Hobbies" | "Projects" | "Misc.";
    author?: Author | null;
    summary: string;
    tags?: Array<Tag> | null;
    content: Array<any>;
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
}

export interface Tag {
    id: number;
    name: string;
}

export interface Author {
    id: number;
    Name: string;
    ProfilePicture?: {
        id: number;
        url: string;
        altText?: string;
    } | null;
    Bio?: string;
    eMail?: string;
    Links?: Array<SocialLink> | null;

}

export interface SocialLink {
    id: number;
    platform: "Twitter" | "Facebook" | "LinkedIn" | "Instagram" | "Discord" | "GitHub" | "YouTube" | "Other";
    link: string;
}

export const SocialPlatformIconName: Record<SocialLink["platform"], string> = {
    Twitter: "fa-brands:twitter",
    Facebook: "fa-brands:facebook",
    LinkedIn: "fa-brands:linkedin",
    Instagram: "fa-brands:instagram",
    Discord: "fa-brands:discord",
    GitHub: "fa-brands:github",
    YouTube: "fa-brands:youtube",
    Other: "fa-solid:link"
};