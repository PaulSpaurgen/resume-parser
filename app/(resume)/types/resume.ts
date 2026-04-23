export interface ResumeExperience {
  id: string;
  title: string;
  company: string;
  duration: string;
  summary: string;
}

export interface Resume {
  name: string;
  headline: string;
  skills: string[];
  experience: ResumeExperience[];
}
