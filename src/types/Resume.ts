export interface Resume {
    name: string,
    email: string,
    phone: string,
    website: string,
    bio: string,
    jobs: Job[],
    certifications: Certification[],
    education: Institution[]
}

interface Job {
    title: string,
    organization: string,
    location: string,
    duration: string,
    description: string,
    duties: string[]
}

interface Certification {
    name: string,
    issuer: string,
    duration: string
}

interface Institution {
    name: string,
    location: string,
    year: string,
    degree: string,
    languagePath: string
}