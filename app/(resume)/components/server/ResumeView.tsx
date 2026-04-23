import type { Resume } from "../../types/resume";

interface ResumeViewProps {
  resume: Resume | null;
}

export default function ResumeView({ resume }: ResumeViewProps) {
  console.log("resume", resume);
  if (!resume) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-4">
        <h2 className="text-lg font-semibold text-slate-900">Parsed Resume</h2>
        <p className="mt-2 text-sm text-slate-500">Upload a resume to view structured details.</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <h2 className="text-lg font-semibold text-slate-900">{resume.name}</h2>
      <p className="text-sm text-slate-600">{resume.headline}</p>

      <div className="mt-4">
        <h3 className="text-sm font-semibold text-slate-900">Skills</h3>
        <ul className="mt-2 flex flex-wrap gap-2">
          {resume?.skills?.map((skill) => (
            <li key={skill} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">
              {skill}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-semibold text-slate-900">Experience</h3>
        <ul className="mt-2 space-y-3">
          {resume?.experience?.map((item) => (
            <li key={item.id} className="rounded-xl border border-slate-200 p-3">
              <p className="text-sm font-medium text-slate-900">
                {item.title} · {item.company}
              </p>
              <p className="text-xs text-slate-500">{item.duration}</p>
              <p className="mt-1 text-sm text-slate-700">{item.summary}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
