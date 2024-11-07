import Link from "next/link";

import type { Course, Review as ReviewType } from "src/@types";
import { Review as ReviewComponent } from "src/components/review";

interface ReviewProps {
  review: ReviewType & {
    course?: Pick<Course, "name" | "slug">;
  };
}

export function ReviewRevision({ review }: ReviewProps): JSX.Element {
  return (
    <div className="flex flex-row gap-2">
      <ReviewComponent review={review} />
      <div className="prose prose-sm mx-auto flex flex-col gap-2 bg-white px-6 py-3 shadow sm:rounded-lg ">
        <p className="my-2 text-center align-middle">Verdict</p>
        <Link href={`/api/admin/review/accept?id=${review._id}`} passHref>
          <button className="rounded border border-black bg-white px-4 pb-2 pt-3 text-black transition-colors hover:bg-green-500 hover:text-white">
            <span className="material-symbols-outlined">check</span>
          </button>
        </Link>
        <Link href={`/api/admin/review/reject?id=${review._id}`} passHref>
          <button className="rounded border border-black bg-white px-4 pb-2 pt-3 text-black transition-colors hover:bg-red-500 hover:text-white">
            <span className="material-symbols-outlined">close</span>
          </button>
        </Link>
      </div>
    </div>
  );
}
