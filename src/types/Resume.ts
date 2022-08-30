export interface Resume {
    name: string,
    email: string,
    phone: string,
    website: string,
    bio: string,
    jobs: Job[],
    education: Institution[]
}

interface Job {
    title: string,
    organization: string,
    location: string,
    duration: string,
    description: string
}

interface Institution {
    name: string,
    location: string,
    year: string,
    degree: string
}